import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql, compose} from 'react-apollo';

import LocalClient from '../../stores/local-client.stores';
import {tmpUpload} from '../../services/graphcool.services';

import HostVariant from '../host-variant.components';
import Modal from '../shared/modal.components';
import Button from '../shared/new-button.components';

class HostVariantModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			displayAll: false,
			justPublished: null,
		};

		this.exit = this.exit.bind(this);
		this.showOlderVersions = this.showOlderVersions.bind(this);
		this.publishNewVersion = this.publishNewVersion.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();

		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			this.setState({
				buffer: head.toJS().d.hostingBuffer,
			});
		});
	}

	async componentDidUpdate(prevState) {
		if (
			prevState.buffer !== this.state.buffer
			&& this.state.status === 'generating'
		) {
			this.setState({status: 'uploading'});

			// upload file to graphcool and get the URL
			const {url} = await tmpUpload(
				new Blob([new Uint8Array(this.state.buffer)]),
				`${this.props.family.name} ${this.props.variant.name}`,
			);

			this.setState({status: 'hosting'});

			const hostFont = await this.props.hostFont(url);

			this.setState({
				status: undefined,
				justPublished: hostFont.data.selectedVariant.latestUploadUrl,
			});
		}
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openHostVariantModal: false,
		});
	}

	showOlderVersions(e) {
		e.preventDefault();

		this.setState({displayAll: true});
	}

	publishNewVersion() {
		try {
			this.setState({status: 'generating'});

			// generate the font
			this.client.dispatchAction('/generate-otf', {
				familyName: this.props.family.name,
				variantName: this.props.variant.name,
				hosting: true,
			});
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	render() {
		const {propName, loading, uploads, latestUploadUrl} = this.props;
		const {error, status, justPublished} = this.state;

		return (
			<Modal propName={propName}>
				<div className="modal-container-title account-header">Hosting</div>
				<div className="modal-container-content">
					{justPublished && (
						<p>
							Your font is ready at {justPublished}, just copy/paste the link
							where you want to use it.
						</p>
					)}
					{loading ? (
						<div>
							<p>Loading...</p>
						</div>
					) : (
						<HostVariant
							loading={loading}
							status={status}
							publishNewVersion={this.publishNewVersion}
							uploads={uploads}
							latestUploadUrl={latestUploadUrl}
						/>
					)}
					{error && <div className="add-family-form-error">{error}</div>}
					<div className="action-form-buttons">
						<Button onClick={this.exit} outline neutral>
							Close
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
}

HostVariantModal.propTypes = {
	family: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}),
	variant: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}),
	propName: PropTypes.string.isRequired,
	latestUploadUrl: PropTypes.string,
	uploads: PropTypes.arrayOf(
		PropTypes.shape({
			url: PropTypes.string,
			version: PropTypes.string,
			createdAt: PropTypes.string,
		}),
	),
};

HostVariantModal.defaultProps = {
	latestUploadUrl: null,
	uploads: [],
};

const publishedVariantsQuery = gql`
	query getPublishedVariants($id: ID!) {
		selectedVariant: Variant(id: $id) {
			id
			latestUploadUrl
			uploads {
				id
				url
				createdAt
			}
		}
	}
`;

const hostVariantMutation = gql`
	mutation hostVariant($id: ID!, $tmpFileUrl: String!) {
		hostFont(variantId: $id, tmpFileUrl: $tmpFileUrl) {
			id
			url
			version
		}
	}
`;

export default compose(
	graphql(publishedVariantsQuery, {
		options: ({variant}) => ({variables: {id: variant.id}}),
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return {
				refetch: data.refetch,
				latestUploadUrl: data.selectedVariant.latestUploadUrl,
				uploads: data.selectedVariant.uploads,
			};
		},
	}),
	graphql(hostVariantMutation, {
		props: ({mutate, ownProps}) => ({
			hostFont: tmpFileUrl =>
				mutate({
					variables: {
						id: ownProps.variant.id,
						tmpFileUrl,
					},
				}).then(() => ownProps.refetch()),
		}),
	}),
)(HostVariantModal);

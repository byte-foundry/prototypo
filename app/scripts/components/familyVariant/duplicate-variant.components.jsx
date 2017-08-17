import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql} from 'react-apollo';

import LocalClient from '~/stores/local-client.stores';

import Modal from '../shared/modal.components';
import InputWithLabel from '../shared/input-with-label.components';
import Button from '../shared/new-button.components';

// TODO: we should externalize queries
import {libraryQuery} from '../collection/collection.components';

class DuplicateVariant extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			name: '',
		};

		this.exit = this.exit.bind(this);
		this.duplicateVariant = this.duplicateVariant.bind(this);
		this.saveName = this.saveName.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: false,
		});
	}

	duplicateVariant() {
		this.setState({error: null});

		const {name} = this.state;

		try {
			// TODO: check duplicates, on Graphcool ?

			this.props.duplicateVariant(name);

			this.exit();
		}
		catch (err) {
			this.setState({error: err.message});
		}
		// this.client.dispatchAction('/create-variant', {
		// 	name: this.refs.newName.inputValue,
		// 	familyId: this.props.family.id,
		// 	variantBaseId: this.props.variant.id,
		// 	noSwitch: true,
		// });
	}

	saveName(e) {
		this.setState({error: null, name: e.target.value});
	}

	render() {
		const {variant, propName} = this.props;
		const {error, name} = this.state;

		const isNotValid = !name.trim() || name.trim() === variant.name;

		return (
			<Modal propName={propName}>
				<div className="modal-container-title account-header">
					Duplicate variant {this.props.variant.name}
				</div>
				<div className="modal-container-content">
					<InputWithLabel onChange={this.saveName} inputValue={variant.name} />
					{error
						&& <div className="add-family-form-error">
							{error}
						</div>}
					<div className="action-form-buttons">
						<Button onClick={this.exit} outline>
							Cancel
						</Button>
						<Button onClick={this.duplicateVariant} disabled={isNotValid}>
							Duplicate "{variant.name}"
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
}

DuplicateVariant.propTypes = {
	variant: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		values: PropTypes.object.isRequired,
	}),
	propName: PropTypes.string.isRequired,
};

const getBaseValuesQuery = gql`
	query getBaseValues($variantBaseId: ID!) {
		variant: Variant(id: $variantBaseId) {
			id
			name
			family {
				id
			}
			values
		}
	}
`;

const duplicateVariantMutation = gql`
	mutation duplicateVariant($familyId: ID!, $name: String!, $baseValues: Json!) {
		createVariant(name: $name, values: $baseValues, familyId: $familyId) {
			id
			name
			values
		}
	}
`;

export default graphql(getBaseValuesQuery, {
	options: ({variant}) => ({variables: {variantBaseId: variant.id}}),
	props({data, ownProps}) {
		if (data.loading) {
			return {loading: true, variant: ownProps.variant};
		}

		return {variant: data.variant};
	},
})(
	graphql(duplicateVariantMutation, {
		props: ({mutate, ownProps}) => ({
			duplicateVariant: name =>
				mutate({
					variables: {
						familyId: ownProps.variant.family.id,
						name,
						baseValues: ownProps.variant.values,
					},
					update: (store, {data: {createVariant}}) => {
						const data = store.readQuery({query: libraryQuery});

						const family = data.user.library.find(family => family.id === ownProps.family.id);

						family.variants.push(createVariant);

						store.writeQuery({
							query: libraryQuery,
							data,
						});
					},
				}),
		}),
	})(DuplicateVariant),
);

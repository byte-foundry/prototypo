import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql} from 'react-apollo';
import {libraryQuery} from '../collection/collection.components';

import LocalClient from '../../stores/local-client.stores';

import Modal from '../shared/modal.components';
import InputWithLabel from '../shared/input-with-label.components';
import Button from '../shared/new-button.components';

class ChangeNameVariant extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			newName: '',
		};

		this.exit = this.exit.bind(this);
		this.editVariant = this.editVariant.bind(this);
		this.saveNewName = this.saveNewName.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: false,
		});
	}

	async editVariant() {
		this.setState({error: null});

		const newName = this.state.newName;

		try {
			// TODO: check duplicates, on Graphcool ?

			this.props.rename(newName);

			this.exit();
		}
		catch (e) {
			this.setState({error: e.message});
		}
	}

	saveNewName(e) {
		this.setState({error: null, newName: e.target.value});
	}

	render() {
		const {variant, propName} = this.props;
		const {error, newName} = this.state;

		const isNotValid = !newName.trim() || newName.trim() === variant.name;

		return (
			<Modal propName={propName}>
				<div className="modal-container-title account-header">
					Change variant name
				</div>
				<div className="modal-container-content">
					<InputWithLabel
						onChange={this.saveNewName}
						inputValue={variant.name}
					/>
					{error && (
						<div className="add-family-form-error">{error}</div>
					)}
					<div className="action-form-buttons">
						<Button onClick={this.exit} outline neutral>
							Cancel
						</Button>
						<Button
							onClick={this.editVariant}
							disabled={isNotValid}
						>
							Change variant name
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
}

ChangeNameVariant.propTypes = {
	variant: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}),
	propName: PropTypes.string.isRequired,
};

const renameVariantMutation = gql`
	mutation renameVariant($id: ID!, $newName: String!) {
		updateVariant(id: $id, name: $newName) {
			id
			name
		}
	}
`;

export default graphql(renameVariantMutation, {
	props: ({mutate, ownProps}) => ({
		rename: newName =>
			mutate({
				variables: {
					id: ownProps.variant.id,
					newName,
				},
			}),
		update: (store, {data: {updateVariant}}) => {
			const data = store.readQuery({query: libraryQuery});
			const family = data.user.library.find(
				family => family.id === ownProps.family.id,
			);
			const variant = family.variants.find(
				variant => variant.id === ownProps.variant.id,
			);

			variant.name = updateVariant.name;

			store.writeQuery({
				query: libraryQuery,
				data,
			});
		},
	}),
})(ChangeNameVariant);

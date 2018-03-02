import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql} from 'react-apollo';

import LocalClient from '../../stores/local-client.stores';

import Modal from '../shared/modal.components';
import InputWithLabel from '../shared/input-with-label.components';
import Button from '../shared/new-button.components';

class ChangeNameFamily extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			newName: '',
		};

		this.exit = this.exit.bind(this);
		this.editFamily = this.editFamily.bind(this);
		this.saveNewName = this.saveNewName.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openChangeFamilyNameModal: false,
		});
	}

	async editFamily() {
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
		const {family, propName} = this.props;
		const {error, newName} = this.state;

		const isNotValid = !newName.trim() || newName.trim() === family.name;

		return (
			<Modal propName={propName}>
				<div className="modal-container-title account-header">Rename family</div>
				<div className="modal-container-content">
					<InputWithLabel onChange={this.saveNewName} inputValue={family.name} />
					{error
						&& <div className="add-family-form-error">
							{error}
						</div>}
					<div className="action-form-buttons">
						<Button onClick={this.exit} outline neutral>
							Cancel
						</Button>
						<Button onClick={this.editFamily} disabled={isNotValid}>
							Change family name
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
}

ChangeNameFamily.propTypes = {
	family: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}),
	propName: PropTypes.string.isRequired,
};

const renameFamilyMutation = gql`
	mutation renameFamily($id: ID!, $newName: String!) {
		updateFamily(id: $id, name: $newName) {
			id
			name
		}
	}
`;

export default graphql(renameFamilyMutation, {
	props: ({mutate, ownProps}) => ({
		rename: newName =>
			mutate({
				variables: {
					id: ownProps.family.id,
					newName,
				},
			}),
	}),
})(ChangeNameFamily);

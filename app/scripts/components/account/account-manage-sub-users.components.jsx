import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';

import HoodieApi from '../../services/hoodie.services.js';

import DisplayWithLabel from '../shared/display-with-label.components';

class AccountManageSubUsers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			userCreation: null,
			loadingCreation: false,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCreate = this.handleCreate.bind(this);
	}

	async handleCreate(e) {
		e.preventDefault();

		const email = e.target.email.value;
		const firstName = e.target.firstName.value;
		const lastName = e.target.lastName.value;

		this.setState({error: null, loadingCreation: email});

		try {
			await this.props.onAddUser({
				email,
				firstName,
				lastName,
			});

			this.setState({userCreation: null, loadingCreation: false});
		}
		catch (err) {
			this.setState({error: err.message, loadingCreation: false});
		}
	}

	async handleSubmit(e) {
		e.preventDefault();

		const email = e.target.email.value;

		this.setState({error: null, loadingCreation: email});

		try {
			await this.props.onAddUser({email});

			this.setState({loadingCreation: false});
		}
		catch (err) {
			if (err.type === 'NotFound') {
				this.setState({userCreation: {email}, loadingCreation: false});
			}
			else {
				this.setState({error: err.message, loadingCreation: false});
			}
		}
	}

	async handleRemoveButton(member) {
		this.setState({error: null});

		try {
			await this.props.onRemoveUser(member);
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	renderCreateUserForm() {
		return (
			<li style={{listStyleType: 'none'}}>
				This user doesn't exist, would you like to create it? An email with a reset password link will be sent to the owner of this address.
				<form onSubmit={this.handleCreate}>
					<input disabled type="text" name="email" placeholder="email@example.com" defaultValue={this.state.userCreation.email} />
					<input type="text" name="firstName" placeholder="First Name" />
					<input type="text" name="lastName" placeholder="Last Name" />
					<button>Create user</button>
					<button onClick={() => {this.setState({userCreation: null});}}>Cancel</button>
				</form>
			</li>
		);
	}

	renderAddUserForm() {
		return (
			<li style={{listStyleType: 'none'}}>
				<form onSubmit={this.handleSubmit}>
					<input type="text" name="email" placeholder="email@example.com" />
					<button>Add user</button>
				</form>
			</li>
		);
	}

	renderForm() {
		const {members, max} = this.props;
		const {userCreation, loadingCreation} = this.state;

		if (loadingCreation) {
			return <li style={{color: '#aaa'}}>(loading) {loadingCreation}</li>;
		}

		if (max && max - members.length <= 0) {
			return;
		}

		if (userCreation) {
			return this.renderCreateUserForm();
		}

		return this.renderAddUserForm();
	}

	render() {
		const {members, max, onAddUser, onRemoveUser} = this.props;
		const {error} = this.state;

		const content = members.length < 1 && <p>You don't manage any user for now.</p>;

		let userList;
		if (onAddUser) {
			userList = (
				<ul>
					{members.map((member) => {
						return (
							<li key={member.email}>
								{member.status === 'pending' && '(pending) '}
								{member.email}
								{' '}
								{onRemoveUser && (
									<button onClick={() => { return this.handleRemoveButton(member); }}>&times;</button>
								)}
							</li>
						);
					})}
					{onAddUser && this.renderForm()}
				</ul>
			);
		}

		return (
			<DisplayWithLabel>
				{content}
				{userList}
				{max > 0 && (
					<p>
						{max - members.length} slots left.
						<span style={{fontSize: '12px', float: 'right'}}>
							Want more slots?
							{' '}
							<Link style={{color: "#24d390"}} to="/account/details/change-plan">
								Update your subscription!
							</Link>
						</span>
					</p>
				)}
				{error && <p>{error}</p>}
			</DisplayWithLabel>
		);
	}
}

AccountManageSubUsers.propTypes = {
	members: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			email: PropTypes.string,
			status: PropTypes.string,
		})
	).isRequired,
	max: PropTypes.number,
	onAddUser: PropTypes.func,
	onRemoveUser: PropTypes.func,
};

const withLoader = (Component) => {
	return function Loader({loading, ...rest}) {
		if (loading) {
			return <p>Loading...</p>;
		}

		return <Component {...rest} />;
	};
};

const query = gql`
	query getSubUsers {
		user {
			id
			subUsers {
				id
				email
			}
			pendingSubUsers {
				id
				email
			}
		}
	}
`;

export default graphql(query, {
	options: {
		fetchPolicy: 'cache-and-network',
	},
	props: ({data}) => {
		if (data.loading || !data.user) { // TMP: don't fail if there's no graphcool account
			return {loading: true};
		}

		const members = [
			...data.user.subUsers.map((e) => {
				return {...e, status: 'active'};
			}),
			...data.user.pendingSubUsers.map((e) => {
				return {...e, status: 'pending'};
			}),
		].sort((a, b) => a.email > b.email);

		return {
			members,
			onAddUser: async (infos) => {
				await HoodieApi.addManagedUser(data.user.id, infos);

				await data.refetch();
			},
			onRemoveUser: async ({id}) => {
				await HoodieApi.removeManagedUser(data.user.id, id);

				await data.refetch();
			},
		};
	},
})(withLoader(AccountManageSubUsers));

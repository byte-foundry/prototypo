import React, {PropTypes} from 'react';

import DisplayWithLabel from '../shared/display-with-label.components';

class AccountManageSubUsers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			userCreation: null,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCreate = this.handleCreate.bind(this);
	}

	async handleCreate(e) {
		e.preventDefault();

		this.setState({error: null});

		try {
			await this.props.onAddUser({
				firstName: e.target.firstName.value,
				lastName: e.target.lastName.value,
				email: e.target.email.value,
			});

			this.setState({userCreation: null});
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	async handleSubmit(e) {
		e.preventDefault();

		const email = e.target.email.value;

		this.setState({error: null});

		try {
			await this.props.onAddUser({email});
		}
		catch (err) {
			if (err.type === 'NotFound') {
				this.setState({
					userCreation: {email},
				});
			}
			else {
				this.setState({error: err.message});
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
					<button onClick={() => {this.setState({userCreation: null})}}>Cancel</button>
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
		const {userCreation} = this.state;

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
				{max > 0 && <p>{max - members.length} slots left.</p>}
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

export default AccountManageSubUsers;

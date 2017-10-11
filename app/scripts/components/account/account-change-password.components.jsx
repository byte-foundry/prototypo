import React from 'react';
import {graphql, gql} from 'react-apollo';

import InputWithLabel from '../shared/input-with-label.components';
import AccountValidationButton from '../shared/account-validation-button.components';
import FormError from '../shared/form-error.components';
import FormSuccess from '../shared/form-success.components';

class AccountChangePassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			success: false,
			errors: '',
		};

		this.changePassword = this.changePassword.bind(this);
	}

	async changePassword(e) {
		e.preventDefault();

		this.setState({loading: true, success: false, errors: ''});

		try {
			const password = this.password.value;
			const newPassword = this.newPassword.value;
			const confirm = this.newPasswordConfirm.value;

			if (newPassword !== confirm) {
				throw new Error("The new password and the confirmation doesn't match");
			}

			await this.props.updatePassword(password, newPassword);

			this.setState({loading: false, success: true});
		}
		catch (err) {
			this.setState({loading: false, errors: err.message});
		}
	}

	render() {
		const {success, errors, loading} = this.state;

		return (
			<form className="account-base account-change-password" onSubmit={this.changePassword}>
				<InputWithLabel
					ref={(node) => {
						this.password = node;
					}}
					type="password"
					label="My current password"
					required
				/>
				<div className="account-change-password-line columns">
					<div className="half-column">
						<InputWithLabel
							ref={(node) => {
								this.newPassword = node;
							}}
							type="password"
							label="New password"
							required
						/>
					</div>
					<div className="half-column">
						<InputWithLabel
							ref={(node) => {
								this.newPasswordConfirm = node;
							}}
							type="password"
							label="New password, again"
							required
						/>
					</div>
				</div>
				{success && <FormSuccess successText="You've successfully changed your password." />}
				{errors && <FormError errorText={errors} />}
				<AccountValidationButton label="Change password" loading={loading} />
			</form>
		);
	}
}

const updatePasswordMutation = gql`
	mutation updateProfile($email: String!, $password: String!, $newPassword: String!) {
		updatePasword(email: $email, password: $password, newPassword: $newPassword) {
			id
		}
	}
`;

export default graphql(updatePasswordMutation, {
	props: ({mutate, ownProps}) => ({
		updatePassword: (password, newPassword) => {
			mutate({
				variables: {
					id: ownProps.id,
					password,
					newPassword,
				},
			});
		},
	}),
})(AccountChangePassword);

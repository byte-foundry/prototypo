import React from 'react';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class AccountChangePassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inError: {},
		};

		//function binding
		this.changePassword = this.changePassword.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					loading: head.toJS().changePasswordForm.loading,
					errors: head.toJS().changePasswordForm.errors,
					inError: head.toJS().changePasswordForm.inError,
					success: head.toJS().changePasswordForm.success,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'changePasswordForm');
		this.lifespan.release();
	}

	changePassword(e) {
		e.preventDefault();
		const newPassword = this.refs.new.inputValue;
		const confirm = this.refs.confirm.inputValue;

		this.client.dispatchAction('/change-password', {
			password: this.refs.current.inputValue,
			newPassword,
			confirm,
		});
	}

	render() {
		const errors = this.state.errors
			? this.state.errors.map((err) => {
				return <FormError errorText={err}/>;
			})
			: false;

		const form = (
			<form onSubmit={this.changePassword} className="account-base account-change-password">
				<InputWithLabel error={this.state.inError.password} required={true} ref="current" type="password" label="My current password"/>
				<div className="account-change-password-line">
					<InputWithLabel error={this.state.inError.newPassword} required={true} ref="new" type="password" label="New password"/>
					<InputWithLabel error={this.state.inError.confirm} required={true} ref="confirm" type="password" label="New password, again"/>
				</div>
				{errors}
				<AccountValidationButton loading={this.state.loading} label="Confirm change password"/>
			</form>
		);

		const success = <h1 className="subscription-title">You've successfully changed your password</h1>;

		return this.state.success
			? success
			: form;
	}
}

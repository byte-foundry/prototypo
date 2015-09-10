import React from 'react';
import HoodieApi from '../services/hoodie.services.js';
import WarningMessage from './warning-message.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

export default class Account extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	async changePassword(e) {
		e.preventDefault();
		const password = React.findDOMNode(this.refs.password).value;
		if (password.length < 6) {
			this.setState({
				passwordTooShort:true,
			});

			return;
		}

		const result = await HoodieApi.changePassword(password);

		this.setState({
			passwordChanged:true,
		});

		return;
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.setState({
			passwordChanged:false,
			passwordTooShort:false,
		});
	}

	logout() {
		this.client.dispatchAction('/logout');
		Log.ui('Account.logout');
	}

	render() {
		let passwordTooShort = false;

		if (this.state.passwordTooShort) {
			passwordTooShort = `You're password is too short (must be 6 characters long at least)`;
		}

		let changePassContent = false;

		if (!this.state.passwordChanged) {
			changePassContent = (
				<div className="account-block">
					<h2 className="account-block-title side-tab-h2">Change password</h2>
					<form className="account-block-form" onSubmit={(e) => { this.changePassword(e) }}>
						<label className="account-block-form-label" htmlFor="new-password">New password (at least 6 characters)</label>
						<input className="account-block-form-input" ref="password" type="password" id="new-password" name="new-password"/>
						{((message) => {if (message) {
							return <WarningMessage text={message}/>
						}})(passwordTooShort)}
						<button className="account-block-form-button">Change password</button>
					</form>
				</div>
			);
		}
		else {
			changePassContent = (
				<div className="account-block">
					<h1 className="account-block-title">You're password has been changed !</h1>
				</div>
			);
		}

		return (
			<div className="account">
				<h1 className="account-block-title side-tab-h1">
					Admin panel
					<div className="account-block-title-email">
						<span className="account-block-title-email-icon" onClick={() => {this.logout()}}>
							<span className="account-block-title-email-icon-logout">
								logout
							</span>
						</span>
						{HoodieApi.instance.email}
					</div>
				</h1>
				{changePassContent}
			</div>
		)
	}
}

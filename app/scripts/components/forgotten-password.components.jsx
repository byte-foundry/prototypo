import React from 'react';
import {hashHistory} from 'react-router';

import HoodieApi from '../services/hoodie.services.js';
import WarningMessage from './warning-message.components.jsx';
import WaitForLoad from './wait-for-load.components.jsx';
import Log from '../services/log.services.js';
import AccountValidationButton from './shared/account-validation-button.components.jsx';

export default class ForgottenPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	async resetPassword(e) {
		e.preventDefault();

		this.setState({
			loading: true,
		});

		const email = this.refs.email.value;

		if (!(/.+\@.+\..+/.test(email))) {
			this.setState({
				notAnEmail: true,
				loading: false,
			});
			return;
		}

		Log.ui('ForgottenPassword.resetPassword', email);
		try {
			await HoodieApi.askPasswordReset(email);

			this.setState({
				reset: true,
				loading: false,
			});
		}
		catch (err) {
			this.setState({
				errorReset: err.message,
				loading: false,
			});
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] forgotten password');
		}

		let warning = false;

		if (this.state.notAnEmail) {
			warning = 'You must enter an email address';
		}

		if (this.state.errorReset) {
			warning = this.state.errorReset;
		}

		let content;

		if (!this.state.reset) {
			const message = warning
				? <WarningMessage text={warning}/>
				: false;

			content = (
					<form className="sign-in-form" onSubmit={(e) => {this.resetPassword(e);}}>
						<p className="forgotten-password-text">Please fill the following input with the email address you've used to register.</p>
						<input className="forgotten-password-input" ref="email" placeholder="Email address"/>
						<p className="forgotten-password-text">We will send you a new password, and you will be able to change your password once connected in the profile panel.</p>
						{message}
						<div className="forgotten-password-buttons">
						<AccountValidationButton label="cancel" id="cancel" click={() => {hashHistory.push({pathname: '/signin'});}}/>
						<AccountValidationButton loading={this.state.loading} label="Reset Password"/>
						</div>
					</form>
			);
		}
		else {
			content = [
				<p className="forgotten-password-text">A temporary password has been sent to your email inbox</p>,
				<button className="forgotten-password-button"
					onClick={() => {
						location.href = '#/signin';
					}}>Return to signin</button>,
			];
		}
		return (
			<div className="forgotten-password sign-base">
				<div classname="account-dashboard-icon"/>
				<h1 className="account-title">Reset my password</h1>
				<div className="account-dashboard-container">
						{content}
					</form>
				</div>
			</div>
		);
	}
}

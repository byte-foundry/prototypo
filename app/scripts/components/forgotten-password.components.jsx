import React from 'react';
import PropTypes from 'prop-types';

import HoodieApi from '../services/hoodie.services.js';
import WarningMessage from './warning-message.components.jsx';
import WaitForLoad from './wait-for-load.components.jsx';
import Log from '../services/log.services.js';
import AccountValidationButton from './shared/account-validation-button.components.jsx';
import InputWithLabel from './shared/input-with-label.components.jsx';

class ForgottenPassword extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			errorReset: null,
			notAnEmail: false,
		};

		this.redirectToSignin = this.redirectToSignin.bind(this);
		this.renderForm = this.renderForm.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
	}

	async resetPassword(e) {
		e.preventDefault();

		this.setState({
			loading: true,
		});

		const email = this.refs.email.inputValue;

		if (!/.+\@.+\..+/.test(email)) {
			this.setState({
				notAnEmail: true,
				loading: false,
			});
			return;
		}

		try {
			await HoodieApi.askPasswordReset(email);

			this.setState({loading: false});

			this.props.router.push('/signin/forgotten?success');
		}
		catch (err) {
			trackJs.track(err);
			this.setState({
				errorReset: err.message,
				loading: false,
			});
		}
	}

	redirectToSignin() {
		this.props.router.push('/signin');
	}

	renderForm() {
		const {location} = this.props;

		const query = new URLSearchParams(location.search);

		if (query.has('success')) {
			return (
				<div className="sign-in-form">
					<p className="forgotten-password-text">
						The email has been sent with the reset link.
					</p>
					<AccountValidationButton
						label="Return to signin"
						click={this.redirectToSignin}
					/>
				</div>
			);
		}

		const {notAnEmail, errorReset} = this.state;
		const warning
			= (notAnEmail && 'You must enter an email address') || errorReset;

		return (
			<form className="sign-in-form" onSubmit={this.resetPassword}>
				<p className="forgotten-password-text">
					Please fill the following input with the email address you've used to
					register.
				</p>
				<InputWithLabel
					type="email"
					ref="email"
					name="email"
					placeholder="Email address"
				/>
				<p className="forgotten-password-text">
					We will send you a link by email to reset your password.
				</p>
				{warning && <WarningMessage text={warning} />}
				<div className="forgotten-password-buttons">
					<AccountValidationButton
						label="Cancel"
						id="cancel"
						click={this.redirectToSignin}
					/>
					<AccountValidationButton
						loading={this.state.loading}
						label="Reset Password"
					/>
				</div>
			</form>
		);
	}

	render() {
		return (
			<div className="forgotten-password sign-in sign-base">
				<div className="account-dashboard-icon" />
				<div className="account-header">
					<h1 className="account-title">Forgot your password?</h1>
				</div>
				<h1 className="account-dashboard-page-title">
					Don't worry,<br />we've got your back.
				</h1>
				<div className="account-dashboard-container">{this.renderForm()}</div>
			</div>
		);
	}
}

ForgottenPassword.propTypes = {
	router: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

export default ForgottenPassword;

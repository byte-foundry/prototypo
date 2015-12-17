import React from 'react';
import pleaseWait from 'please-wait';
import HoodieApi from '../services/hoodie.services.js';
import WarningMessage from './warning-message.components.jsx';
import WaitForLoad from './wait-for-load.components.jsx';
import Log from '../services/log.services.js';

export default class ForgottenPassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	async resetPassword() {
		this.setState({
			loading:true,
		});

		const email = React.findDOMNode(this.refs.email).value;
		if (!(/.+\@.+\..+/.test(email))) {
			this.setState({
				notAnEmail:true,
				loading:false,
			});
			return;
		}

		Log.ui('ForgottenPassword.resetPassword', email);
		try {
			const result = await HoodieApi.askPasswordReset(email);
			this.setState({
				reset:true,
				loading:false,
			});
		}
		catch(err) {
			this.setState({
				errorReset: err.message,
				loading:false,
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
			content = [
				<p className="forgotten-password-text">Please fill the following input with the email address you've used to register.</p>,
				<input className="forgotten-password-input" ref="email" placeholder="Email address"/>,
				<p className="forgotten-password-text">We will send you a new password, and you will be able to change your password once connected in the profile panel.</p>,
				((message) => {if (message) {
					return <WarningMessage text={message}/>
				}
				else {
					return false;
				}})(warning),
				<WaitForLoad loaded={!this.state.loading} secColor={true}>
					<div className="forgotten-password-buttons">
						<button className="forgotten-password-button"
							onClick={() => {
								location.href = '#/signin';
							}}>Cancel</button>
						<button className="forgotten-password-button"
							onClick={() => {
								this.resetPassword()
							}}>Reset Password</button>
					</div>
				</WaitForLoad>,
			]
		}
		else {
			content = [
				<p className="forgotten-password-text">A temporary password has been sent to your email inbox</p>,
				<button className="forgotten-password-button"
					onClick={() => {
						location.href = '#/signin';
					}}>Return to signin</button>,
			]
		}
		return (
			<div className="forgotten-password">
				{content}
			</div>
		)
	}
}

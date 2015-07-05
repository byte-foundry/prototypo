import React from 'react';
import pleaseWait from 'please-wait';
import HoodieApi from '../services/hoodie.services.js';

export default class ForgottenPassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}
	async resetPassord() {
		const result = await HoodieApi.askPasswordReset(React.findDOMNode(this.refs.email).value);
		this.setState({
			reset:true,
		});
	}

	render() {
		let content;

		if (!this.state.reset) {
			content = [
				<p className="forgotten-password-text">Please fill the following input with the email address you've used to register.</p>,
				<input className="forgotten-password-input" ref="email" placeholder="Email address"/>,
				<p className="forgotten-password-text">We will send you a new password, and you will be able to change your password once connected in the profile panel.</p>,
				<div className="forgotten-password-buttons">
					<button className="forgotten-password-button"
						onClick={() => {
							location.href = '#/signin';
						}}>Cancel</button>
					<button className="forgotten-password-button"
						onClick={() => {
							this.resetPassord()
						}}>Reset Password</button>
				</div>,
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

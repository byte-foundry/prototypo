import React from 'react';
import HoodieApi from '../services/hoodie.services.js';
import WarningMessage from './warning-message.components.jsx';

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
				passwordToShort:true,
			});

			return;
		}

		const result = await HoodieApi.changePassword(password);

		this.setState({
			passwordChanged:true,
		});

		return;
	}

	componentWillUnmount() {
		this.setState({
			passwordChanged:false,
			passwordToShort:false,
		});
	}

	render() {
		let passwordToShort = false;

		if (this.state.passwordToShort) {
			passwordToShort = `You're password is to short (must be 6 characters long at least)`;
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
						}})(passwordToShort)}
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
						<span className="account-block-title-email-icon">
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

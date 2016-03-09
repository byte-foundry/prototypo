import React from 'react';
import {Link} from 'react-router';

import HoodieApi from '../services/hoodie.services.js';
import LocalClient from '../stores/local-client.stores.jsx';

import WarningMessage from './warning-message.components.jsx';
import WaitForLoad from './wait-for-load.components.jsx';
import InputWithLabel from './shared/input-with-label.components.jsx';
import AccountValidationButton from './shared/account-validation-button.components.jsx';

export default class Signin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			warningMessage: undefined,
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.setState({
			loading: true,
		});
	}

	signIn(e) {
		this.setState({
			loading: false,
		});

		e.preventDefault();

		const login = this.refs.email.inputValue.toLowerCase();
		const password = this.refs.password.inputValue;

		HoodieApi.login(login,
			password)
			.then(() => {
				this.client.dispatchAction('/login', { });
			})
			.catch((err) => {
				this.setState({
					warningMessage: /unauthorized/i.test(err.message)
						? 'Incorrect email or password'
						: 'An unexpected error occured, please contact contact@prototypo.io and mention your current email',
					loading: true,
				});
			});

		return;
	}

	componentWillUnmount() {
		this.setState({
			loading: false,
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Signin');
		}
		return (
			<div className="sign-in sign-base">
				<div className="account-dashboard-icon"/>
				<h1 className="account-title">Sign in</h1>
				<div className="account-dashboard-container">
					<form className="sign-in-form" onSubmit={(e) => {this.signIn(e);}}>
						<InputWithLabel
							id="email-sign-in"
							name="email-sign-in"
							type="email"
							ref="email"
							placeholder="Email"
							required={true}
							label="Email"/>
						<InputWithLabel
							label="Password"
							required={true}
							id="password-sign-in"
							name="password-sign-in"
							ref="password"
							type="password"
							required
							placeholder="Password"/>
						<Link to="/signin/forgotten" className="sign-in-help-needed">
							I forgot my password
						</Link>
						<Link to="/signup" className="sign-in-help-needed">
							I don't have an account
						</Link>
						{((message) => {
							if (message) {
								return <WarningMessage text={message}/>;
							}
						})(this.state.warningMessage)}
						<AccountValidationButton label="Sign in"/>
					</form>
				</div>
			</div>
		);
	}
}

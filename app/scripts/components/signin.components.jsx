import React from 'react';
import HoodieApi from '../services/hoodie.services.js';
import LocalClient from '../stores/local-client.stores.jsx';

import WarningMessage from './warning-message.components.jsx';
import WaitForLoad from './wait-for-load.components.jsx';

export default class Signin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			warningMessage:undefined,
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

		const login = React.findDOMNode(this.refs.email).value.toLowerCase();
		const password = React.findDOMNode(this.refs.password).value;

		HoodieApi.login(`user/${login}`,
			password)
			.then(() => {
				this.client.dispatchAction('/login', { });
			})
			.catch((err) => {console.log(err);
				this.setState({
					warningMessage: err.error === 'unauthorized' ? 'You made a mistake in your email or password' : 'An unexpected error occured please contact contact@prototypo.io and provide us with your username',
					loading:true,
				});
			})

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
			<form className="sign-in" onSubmit={(e) => {this.signIn(e)}}>
				<h1 className="sign-in-title">Sign in</h1>
				<label className="sign-in-label" htmlFor="email-sign-in">Email</label>
				<input
					className="sign-in-input"
					id="email-sign-in"
					name="email-sign-in"
					required
					type="email"
					ref="email"
					placeholder="Email"/>
				<label className="sign-in-label" htmlFor="password-sign-in">Password</label>
				<input
					className="sign-in-input"
					id="password-sign-in"
					name="password-sign-in"
					ref="password"
					type="password"
					required
					placeholder="Password"/>
				<a href="#/signin/forgotten" className="sign-in-help-needed">
					Forgotten your password?
				</a>
				<a href="https://www.prototypo.io/pricing.html" className="sign-in-help-needed">
					You don't have any account?
				</a>
				{((message) => {if (message) {
					return <WarningMessage text={message}/>
					}})(this.state.warningMessage)}
				<WaitForLoad loaded={this.state.loading} secColor={true}>
					<button className="sign-in-button">Sign in</button>
				</WaitForLoad>
			</form>
		)
	}
}

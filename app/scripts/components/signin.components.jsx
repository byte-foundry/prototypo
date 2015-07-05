import React from 'react';
import HoodieApi from '../services/hoodie.services.js';

import WarningMessage from './warning-message.components.jsx';

export default class Signin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			warningMessage:undefined,
		};
	}
	signIn() {
		HoodieApi.login(`user/${React.findDOMNode(this.refs.email).value}`,
			React.findDOMNode(this.refs.password).value)
			.then(() => {
				location.href = '#/dashboard';
			})
			.catch((err) => {
				this.setState({
					warningMessage: err.error === 'unauthorized' ? 'You made a mistake in your email or password' : 'An unexpected error occured please contact contact@prototypo.io and provide us with your username',
				});
			})
	}
	render() {
		return (
			<div className="sign-in">
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
				<a href="#/signin/forgotten">
					Forgotten your password ?
				</a>
				{((message) => {if (message) {
					return <WarningMessage text={message}/>
				}})(this.state.warningMessage)}
				<button className="sign-in-button" onClick={(e) => {this.signIn()}}>Sign in</button>
			</div>
		)
	}
}

import React from 'react';
import HoodieApi from '../services/hoodie.services.js';

export default class Signin extends React.Component {
	signIn() {
		HoodieApi.login(`user/${React.findDOMNode(this.refs.email).value}`,
			React.findDOMNode(this.refs.password).value)
			.then(() => {
				location.href = '#/dashboard';
			})
	}
	render() {
		return (
			<div className="sign-in">
				<h1 className="sign-in-title">Sign in</h1>
				<label className="sign-in-label" for="email-sign-in">Email</label>
				<input
					className="sign-in-input"
					id="email-sign-in"
					name="email-sign-in"
					required
					type="email"
					ref="email"
					placeholder="Email"/>
				<label className="sign-in-label" for="password-sign-in">Password</label>
				<input
					className="sign-in-input"
					id="password-sign-in"
					name="password-sign-in"
					ref="password"
					type="password"
					required
					placeholder="Password"/>
				<a href="about:blank">
					Forgotten your password ?
				</a>
				<button className="sign-in-button" onClick={(e) => {this.signIn()}}>Sign in</button>
			</div>
		)
	}
}

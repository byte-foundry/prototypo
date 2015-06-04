import React from 'react';
import hoodieApi from '../services/hoodie.services.js';

export default class Register extends React.Component {
	register() {
		const username = React.findDOMNode(this.refs.username).value;
		const password = React.findDOMNode(this.refs.password).value;
		hoodieApi.register(username, password);
	}
	render() {
		return (
			<div className="sign-in">
				<h1 className="sign-in-title">Register</h1>
				<label className="sign-in-label" for="email-register">Email</label>
				<input
					className="sign-in-input"
					id="email-register"
					name="email-register"
					required
					ref="username"
					type="email"
					placeholder="Email"/>
				<label className="sign-in-label" for="password-register">Password</label>
				<input
					className="sign-in-input"
					id="password-register"
					name="password-register"
					type="password"
					ref="password"
					required
					placeholder="Password"/>
				<button className="sign-in-button" onClick={() => {this.register()}}>Register</button>
			</div>
		)
	}
}

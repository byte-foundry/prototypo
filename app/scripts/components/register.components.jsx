import React from 'react';

export default class Register extends React.component {
	render() {
		return (
			<div class="register">
				<h1>Register</h1>
				<label for="email-register">Email</label>
				<input
					id="email-register"
					name="email-register"
					required
					type="email"
					placeholder="Email"/>
				<label for="password-register">Password</label>
				<input
					id="password-register"
					name="password-register"
					type="password"
					required
					placeholder="Password"/>
				<button class="register-btn">Register</button>
			</div>
		)
	}
}

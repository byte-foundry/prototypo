import React from 'react';

export default class Signin extends React.component {
	render() {
		return (
			<div class="signin">
				<h1>Sign in</h1>
				<label for="email-sign-in">Email</label>
				<input
					id="email-sign-in"
					name="email-sign-in"
					required
					type="email"
					placeholder="Email"/>
				<label for="password-sign-in">Password</label>
				<input
					id="password-sign-in"
					name="password-sign-in"
					type="password"
					required
					placeholder="Password"/>
				<a href="about:blank">
					Forgotton your password ?
				</a>
				<button class="signin">Sign in</button>
			</div>
		)
	}
}

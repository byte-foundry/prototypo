import React from 'react';
import {graphql, gql} from 'react-apollo';
import {Link, withRouter} from 'react-router';

import isProduction from '../helpers/is-production.helpers';
import {loadStuff} from '../helpers/appSetup.helpers';
import HoodieApi from '../services/hoodie.services';

import FormError from './shared/form-error.components';
import InputWithLabel from './shared/input-with-label.components';
import AccountValidationButton from './shared/account-validation-button.components';
import OAuthButtons from './oauth-buttons.components';

export class Signin extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			errors: [],
			inError: {},
		};

		this.signIn = this.signIn.bind(this);
		this.handleSignIn = this.handleSignIn.bind(this);
	}

	async signIn(email, token) {
		window.localStorage.setItem('graphcoolToken', token);

		await HoodieApi.setup();

		await loadStuff();

		window.Intercom('boot', {
			app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
			email,
			widget: {
				activator: '#intercom-button',
			},
		});

		this.props.router.push({
			pathname: this.props.location.query.prevHash || '/library/home',
			query: this.props.location.query,
		});
	}

	async handleSignIn(e) {
		e.preventDefault();

		const email = this.emailInput.inputValue.toLowerCase();
		const password = this.passwordInput.inputValue;

		const errors = [];

		this.setState({loading: true, errors, inError: {}});

		if (!email || !password) {
			errors.push('Fields with a * are required');

			this.setState({
				loading: false,
				errors,
				inError: {
					username: !email,
					password: !password,
				},
			});

			return;
		}

		try {
			const response = await this.props.authenticateEmailUser(email, password);

			await this.signIn(email, response.data.auth.token);

			this.setState({loading: false, errors, inError: {}});
		}
		catch (err) {
			if (err.graphQLErrors[0].code === 5001) {
				errors.push(err.graphQLErrors[0].functionError);
			}
			else {
				window.trackJs.track(err);
				errors.push(
					'An unexpected error occured, please contact support@prototypo.io and mention your current email',
				);
			}

			this.setState({loading: false, errors, inError: {}});
		}
	}

	render() {
		const errors = this.state.errors.map(error => (
			<FormError errorText={error} />
		));

		return (
			<div className="sign-in sign-base">
				<div className="account-dashboard-icon" />
				<div className="account-header">
					<h1 className="account-title">Sign in</h1>
				</div>
				<h1 className="account-dashboard-page-title">Welcome back.</h1>
				<div className="sign-in-container">
					<div className="sign-in-oauth">
						<label className="sign-in-oauth-label" htmlFor="oauth">
							Sign in with
						</label>
						<OAuthButtons
							id="oauth"
							onLogin={this.signIn}
							className="sign-in-oauth-buttons"
						/>
					</div>
					<div className="sign-in-separator">
						<hr className="sign-in-separator-line" />
						<span className="sign-in-separator-text">OR</span>
					</div>
					<form className="sign-in-form" onSubmit={this.handleSignIn}>
						<InputWithLabel
							id="email-sign-in"
							name="email-sign-in"
							type="email"
							ref={(node) => {
								this.emailInput = node;
							}}
							placeholder="Email"
							required
							label="Email"
						/>
						<InputWithLabel
							label="Password"
							id="password-sign-in"
							name="password-sign-in"
							ref={(node) => {
								this.passwordInput = node;
							}}
							type="password"
							required
							placeholder="Password"
						/>
						<Link to="/signin/forgotten" className="sign-in-help-needed">
							I forgot my password
						</Link>
						{/* <Link to="/signup" className="sign-in-help-needed">
							I don't have an account
						</Link> */}
						{errors}
						<AccountValidationButton
							label="Sign in"
							loading={this.state.loading}
						/>
					</form>
				</div>
			</div>
		);
	}
}

const authenticateEmailUserMutation = gql`
	mutation authenticateEmailUser($email: String!, $password: String!) {
		auth: authenticateEmailUser(email: $email, password: $password) {
			token
		}
	}
`;

export default graphql(authenticateEmailUserMutation, {
	props: ({mutate}) => ({
		authenticateEmailUser: (email, password) =>
			mutate({
				variables: {
					email,
					password,
				},
			}),
	}),
})(withRouter(Signin));

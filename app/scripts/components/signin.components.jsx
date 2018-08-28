import gql from 'graphql-tag';
import React from 'react';
import {graphql} from 'react-apollo';
import {Redirect, Link, withRouter} from 'react-router-dom';

import isProduction from '../helpers/is-production.helpers';
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

		window.Intercom('boot', {
			app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
			email,
			widget: {
				activator: '#intercom-button',
			},
		});
		window.trackJs.addMetadata('username', email);

		await this.props.refetch();
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
			if (err.graphQLErrors && err.graphQLErrors[0].code === 5001) {
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
			<FormError key={error} errorText={error} />
		));

		if (!this.state.loading && this.props.user) {
			const query = new URLSearchParams(this.props.location.search);
			const nextLocation = query.has('prevHash')
				? decodeURIComponent(query.get('prevHash'))
				: '/library';

			query.delete('prevHash');

			return (
				<Redirect
					to={{
						...this.props.location,
						pathname: nextLocation,
						search: query.toString(),
					}}
					replace
				/>
			);
		}

		return (
			<div className="account-app">
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
						<form
							className="sign-in-form"
							onSubmit={this.handleSignIn}
							data-testid="sign-in-form"
						>
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
							<Link to="/signup" className="sign-in-help-needed">
								I don't have an account
							</Link>
							{errors}
							<AccountValidationButton
								label="Sign in"
								loading={this.state.loading}
							/>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export const LOGGED_IN_USER = gql`
	query loggedInUser {
		user {
			id
		}
	}
`;

export const AUTHENTICATE_EMAIL_USER = gql`
	mutation authenticateEmailUser($email: String!, $password: String!) {
		auth: authenticateEmailUser(email: $email, password: $password) {
			token
		}
	}
`;

export default graphql(AUTHENTICATE_EMAIL_USER, {
	props: ({mutate}) => ({
		authenticateEmailUser: (email, password) =>
			mutate({
				variables: {
					email,
					password,
				},
			}),
	}),
})(
	graphql(LOGGED_IN_USER, {
		props: ({data}) => ({
			refetch: data.refetch,
			loadingUser: data.loading,
			user: data.user,
		}),
	})(withRouter(Signin)),
);

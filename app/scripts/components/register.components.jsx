import gql from 'graphql-tag';
import React from 'react';
import {graphql} from 'react-apollo';
import {Redirect, Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import isProduction from '../helpers/is-production.helpers';
import HoodieApi from '../services/hoodie.services';

import InputWithLabel from './shared/input-with-label.components';
import SelectWithLabel from './shared/select-with-label.components';
import AccountValidationButton from './shared/account-validation-button.components';
import FormError from './shared/form-error.components';
import OAuthButtons from './oauth-buttons.components';

class Register extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			inError: {},
			errors: [],
			redirectTo: null,
		};

		this.signIn = this.signIn.bind(this);
		this.register = this.register.bind(this);
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

		const query = new URLSearchParams(this.props.location.search);

		this.setState({
			redirectTo: {
				...this.props.location,
				pathname: query.get('prevHash') || '/library',
			},
		});
	}

	async register(e) {
		e.preventDefault();

		const email = this.email.inputValue;
		const password = this.password.inputValue;
		const firstName = this.firstname.inputValue;
		const lastName = this.lastname.inputValue;
		const occupation = this.occupation.inputValue.value;
		const phone = this.phone.inputValue;
		const skype = this.skype.inputValue;

		const errors = [];
		const inError = {};

		this.setState({
			errors,
			inError,
			loading: true,
		});

		// Check each input for error
		if (!email || !password || !firstName) {
			this.setState({
				errors: ['Fields with a * are required'],
				inError: {
					email: !email,
					password: !password,
					firstname: !firstName,
				},
				loading: false,
			});

			return;
		}

		if (!/\S+?@\S+?\.\S+?/.test(email)) {
			inError.email = true;
			errors.push('Your email is invalid');
		}

		if (password.length < 8) {
			// password is not long enough
			inError.password = true;
			errors.push('Your password must be at least 8 character long');
		}

		if (errors.length > 0) {
			this.setState({
				errors,
				inError,
				loading: false,
			});
			return;
		}

		const curedLastname = lastName ? ` ${lastName}` : '';

		try {
			const response = await this.props.signUpAndLogin(
				email.toLowerCase(),
				password,
				firstName,
				{
					lastName: lastName || undefined,
					occupation: occupation || undefined,
					phone: phone || undefined,
					skype: skype || undefined,
				},
			);

			window.localStorage.setItem('graphcoolToken', response.data.auth.token);

			HoodieApi.setup();

			window.Intercom('boot', {
				app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
				email,
				name: firstName + curedLastname,
				occupation,
				phone: phone || undefined, // avoid empty string being recorded into Intercom
				skype,
				ABtest: Math.floor(Math.random() * 100),
				widget: {
					activator: '#intercom-button',
				},
			});
			window.trackJs.addMetadata('username', email);
			window.fbq('track', 'Lead');

			this.setState({
				errors: [],
				inError: {},
				loading: false,
			});
		}
		catch (err) {
			window.trackJs.track(err);

			errors.push(err.message);

			this.setState({
				errors,
				inError: {},
				loading: false,
			});
		}
	}

	render() {
		const {inError, loading} = this.state;
		const {location, user} = this.props;

		const query = new URLSearchParams(location.search);

		if (!loading && user) {
			let nextLocation = '/library';

			// renaming subscribe query parameter
			nextLocation = '/account/subscribe';
			query.set('plan', query.get('subscribe') || 'personal_annual_99');

			// else if (query.has('prevHash')) {
			// 	nextLocation = decodeURIComponent(query.get('prevHash'));
			// }

			query.delete('subscribe');
			query.delete('prevHash');

			return (
				<Redirect
					to={{
						...location,
						pathname: nextLocation,
						search: query.toString(),
					}}
					replace
				/>
			);
		}

		const errors = this.state.errors.map(error => (
			<FormError errorText={error} />
		));

		const jobtitles = [
			{value: 'graphic_designer', label: 'a graphic designer'},
			{value: 'student', label: 'a student'},
			{value: 'teacher', label: 'a teacher'},
			{value: 'type_designer', label: 'a type designer'},
			{value: 'web_developer', label: 'a web developer'},
		];

		return (
			<div className="account-app">
				<div className="sign-up sign-base">
					<div className="account-dashboard-icon" />
					<div className="account-header">
						<h1 className="account-title">Sign up</h1>
					</div>
					<h1 className="account-dashboard-page-title">Nice to meet you.</h1>
					<div className="account-dashboard-container">
						<div className="sign-in-container">
							<div className="sign-in-oauth">
								<label className="sign-in-oauth-label" htmlFor="oauth">
									Sign up with
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
							<form className="sign-in-form" onSubmit={this.register}>
								<div className="columns">
									<div className="half-column">
										<InputWithLabel
											label="First name"
											id="firstname"
											name="firstname"
											ref={(firstname) => {
												this.firstname = firstname;
											}}
											error={inError.firstname}
											placeholder="John"
											required
										/>
									</div>
									<div className="half-column">
										<InputWithLabel
											label="Last name"
											className="sign-in-input"
											id="lastname"
											name="lastname"
											placeholder="Doe"
											ref={(lastname) => {
												this.lastname = lastname;
											}}
										/>
									</div>
								</div>
								<InputWithLabel
									label="Email"
									error={inError.email}
									id="email-register"
									name="email-register"
									required
									ref={(email) => {
										this.email = email;
									}}
									// supporting emailSignUp for legacy purposes
									inputValue={query.get('email') || query.get('emailSignUp')}
									type="email"
									placeholder="example@domain.com"
								/>
								<InputWithLabel
									label="Password"
									info="(at least 8 character long)"
									error={inError.password}
									id="password-register"
									name="password-register"
									type="password"
									ref={(password) => {
										this.password = password;
									}}
									required
								/>
								<SelectWithLabel
									ref={(occupation) => {
										this.occupation = occupation;
									}}
									label="I am"
									name="occupation"
									className="input-with-label-input"
									placeholder="an architect"
									options={jobtitles}
								/>
								<div className="columns">
									<div className="half-column">
										<InputWithLabel
											label="Phone number"
											info="(optional)"
											type="tel"
											ref={(phone) => {
												this.phone = phone;
											}}
										/>
									</div>
									<div className="half-column">
										<InputWithLabel
											label="Skype ID"
											info="(optional)"
											ref={(skype) => {
												this.skype = skype;
											}}
										/>
									</div>
								</div>
								<Link
									to={{
										...location,
										pathname: '/signin',
									}}
									className="sign-in-help-needed"
								>
									I already have an account
								</Link>
								{errors}
								<AccountValidationButton loading={loading} label="Sign up" />
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const loggedInUserQuery = gql`
	query loggedInUserQuery {
		user {
			id
		}
	}
`;

const signUpAndLoginMutation = gql`
	mutation signUpAndLogin(
		$firstName: String!
		$email: String!
		$password: String!
		$lastName: String
		$occupation: String
		$phone: String
		$skype: String
	) {
		signupEmailUser(
			email: $email
			password: $password
			firstName: $firstName
			lastName: $lastName
			occupation: $occupation
			phone: $phone
			skype: $skype
		) {
			id
		}

		auth: authenticateEmailUser(email: $email, password: $password) {
			token
		}
	}
`;

export default graphql(loggedInUserQuery, {
	props: ({data}) => ({
		loadingUser: data.loading,
		user: data.user,
	}),
})(
	graphql(signUpAndLoginMutation, {
		props: ({mutate}) => ({
			signUpAndLogin: (email, password, firstName, options) =>
				mutate({
					variables: {
						email,
						password,
						firstName,
						...options,
					},
				}),
		}),
	})(Register),
);

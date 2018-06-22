import React from 'react';
import Lifespan from 'lifespan';
import {Link, withRouter} from 'react-router';
import PropTypes from 'prop-types';

import LocalClient from '../stores/local-client.stores';
import isProduction from '../helpers/is-production.helpers';
import {loadStuff} from '../helpers/appSetup.helpers';
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
		};

		this.signIn = this.signIn.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					inError: head.toJS().d.signupForm.inError,
					errors: head.toJS().d.signupForm.errors,
					loading: head.toJS().d.signupForm.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
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
		window.trackJs.addMetadata('username', email);

		this.props.router.push({
			pathname: this.props.location.query.prevHash || '/start',
			query: this.props.location.query,
		});
	}

	register(e) {
		e.preventDefault();
		e.stopPropagation();
		const username = this.username.inputValue;
		const password = this.password.inputValue;
		const firstname = this.firstname.inputValue;
		const lastname = this.lastname.inputValue;
		const css = this.css.inputValue;
		const phone = this.phone.inputValue;
		const skype = this.skype.inputValue;

		this.client.dispatchAction('/sign-up', {
			username,
			password,
			firstname,
			lastname,
			css,
			phone,
			skype,
			to: this.props.location.query.subscribe
				? '/account/subscribe'
				: this.props.location.query.prevHash,
			oldQuery: this.props.location.query.subscribe
				? {
					plan: this.props.location.query.subscribe,
					quantity: this.props.location.query.quantity,
				}
				: this.props.location.query,
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Register');
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
						<form
							className="sign-in-form"
							onSubmit={(e) => {
								this.register(e);
							}}
						>
							<div className="columns">
								<div className="half-column">
									<InputWithLabel
										label="First name"
										id="firstname"
										name="firstname"
										ref={(firstname) => {
											this.firstname = firstname;
										}}
										error={this.state.inError.firstname}
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
								error={this.state.inError.email}
								id="email-register"
								name="email-register"
								required
								ref={(username) => {
									this.username = username;
								}}
								inputValue={this.props.location.query.emailSignUp}
								type="email"
								placeholder="example@domain.com"
							/>
							<InputWithLabel
								label="Password"
								info="(at least 8 character long)"
								error={this.state.inError.password}
								id="password-register"
								name="password-register"
								type="password"
								ref={(password) => {
									this.password = password;
								}}
								required
							/>
							<SelectWithLabel
								ref={(css) => {
									this.css = css;
								}}
								label="I am"
								name="css"
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
								to={{pathname: '/signin', query: this.props.location.query}}
								className="sign-in-help-needed"
							>
								I already have an account
							</Link>
							{errors}
							<AccountValidationButton
								loading={this.state.loading}
								label="Sign up"
							/>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

Register.propTypes = {
	router: PropTypes.object.isRequired,
};

export default withRouter(Register);

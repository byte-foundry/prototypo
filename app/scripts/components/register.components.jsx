import React from 'react';
import Lifespan from 'lifespan';
import {Link} from 'react-router';

import LocalClient from '../stores/local-client.stores.jsx';

import InputWithLabel from './shared/input-with-label.components.jsx';
import SelectWithLabel from './shared/select-with-label.components.jsx';
import AccountValidationButton from './shared/account-validation-button.components.jsx';
import FormError from './shared/form-error.components.jsx';

export default class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inError: {},
			errors: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
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

	register(e) {
		e.preventDefault();
		e.stopPropagation();
		const username = this.refs.username.inputValue;
		const password = this.refs.password.inputValue;
		const firstname = this.refs.firstname.inputValue;
		const lastname = this.refs.lastname.inputValue;
		const css = this.refs.css.inputValue;
		const phone = this.refs.phone.inputValue;
		const skype = this.refs.skype.inputValue;

		this.client.dispatchAction('/sign-up', {username, password, firstname, lastname, css, phone, skype, to: this.props.location.query.subscribe ? '/account/subscribe' : this.props.location.query.prevHash, oldQuery: this.props.location.query.subscribe ? {plan: this.props.location.query.subscribe} : this.props.location.query});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Register');
		}

		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error}/>;
		});

		const jobtitles = [
			{value: 'graphic_designer', label: 'a graphic designer'},
			{value: 'student', label: 'a student'},
			{value: 'teacher', label: 'a teacher'},
			{value: 'type_designer', label: 'a type designer'},
			{value: 'web_developer', label: 'a web developer'},
		];

		return (
			<div className="sign-up sign-base">
				<div className="account-dashboard-icon"/>
				<div className="account-header">
					<h1 className="account-title">Sign up</h1>
				</div>
				<h1 className="account-dashboard-page-title">Nice to meet you.</h1>
				<div className="account-dashboard-container">
					<form className="sign-in-form" onSubmit={(e) => {this.register(e);}}>
						<div className="columns">
							<div className="half-column">
								<InputWithLabel
									label="First name"
									id="firstname"
									name="firstname"
									ref="firstname"
									error={this.state.inError.firstname}
									placeholder="John"
									required={true} />
							</div>
							<div className="half-column">
								<InputWithLabel
									label="Last name"
									className="sign-in-input"
									id="lastname"
									name="lastname"
									placeholder="Doe"
									ref="lastname" />
							</div>
						</div>
						<InputWithLabel
							label="Email"
							error={this.state.inError.email}
							id="email-register"
							name="email-register"
							required
							ref="username"
							type="email"
							placeholder="example@domain.com"/>
						<InputWithLabel
							label="Password"
							info="(at least 8 character long)"
							error={this.state.inError.password}
							id="password-register"
							name="password-register"
							type="password"
							ref="password"
							required />
						<SelectWithLabel
							ref="css"
							label="I am"
							name="css"
							className="input-with-label-input"
							placeholder="an architect"
							options={jobtitles} />
						<div className="columns">
							<div className="half-column">
								<InputWithLabel label="Phone number" info="(optional)" type="tel" ref="phone"/>
							</div>
							<div className="half-column">
								<InputWithLabel label="Skype ID" info="(optional)" ref="skype"/>
							</div>
						</div>
						<Link to="/signin" className="sign-in-help-needed">
							I already have an account
						</Link>
						{errors}
						<AccountValidationButton loading={this.state.loading} label="Sign up"/>
					</form>
				</div>
			</div>
		);
	}
}

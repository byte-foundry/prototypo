import React from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';

import HoodieApi from '../services/hoodie.services.js';
import LocalClient from '../stores/local-client.stores.jsx';

import FormError from './shared/form-error.components.jsx';
import InputWithLabel from './shared/input-with-label.components.jsx';
import AccountValidationButton from './shared/account-validation-button.components.jsx';

export default class Signin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					inError: head.toJS().signinForm.inError,
					errors: head.toJS().signinForm.errors,
					loading: head.toJS().signinForm.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	signIn(e) {

		e.preventDefault();

		const username = this.refs.email.inputValue.toLowerCase();
		const password = this.refs.password.inputValue;

		return this.client.dispatchAction('/sign-in', {username, password});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Signin');
		}

		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error}/>;
		});

		return (
			<div className="sign-in sign-base">
				<div className="account-dashboard-icon"/>
				<div className="account-header">
					<h1 className="account-title">Sign in</h1>
				</div>
				<div className="account-dashboard-container">
					<form className="sign-in-form" onSubmit={(e) => {this.signIn(e);}}>
						<InputWithLabel
							id="email-sign-in"
							name="email-sign-in"
							type="email"
							ref="email"
							placeholder="Email"
							required={true}
							label="Email"/>
						<InputWithLabel
							label="Password"
							required={true}
							id="password-sign-in"
							name="password-sign-in"
							ref="password"
							type="password"
							required
							placeholder="Password"/>
						<Link to="/signin/forgotten" className="sign-in-help-needed">
							I forgot my password
						</Link>
						<Link to="/signup" className="sign-in-help-needed">
							I don't have an account
						</Link>
						{errors}
						<AccountValidationButton label="Sign in" loading={this.state.loading}/>
					</form>
				</div>
			</div>
		);
	}
}

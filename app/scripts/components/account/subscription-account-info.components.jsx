import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class SubscriptionAccountInfo extends React.Component {
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
					inError: head.toJS().signupForm.inError,
					errors: head.toJS().signupForm.errors,
					loading: head.toJS().signupForm.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createAccount(e) {
		e.preventDefault();
		e.stopPropagation();
		const username = this.refs.username.inputValue;
		const password = this.refs.password.inputValue;
		const firstname = this.refs.firstname.inputValue;
		const lastname = this.refs.lastname.inputValue;

		this.client.dispatchAction('/sign-up', {username, password, firstname, lastname, to: '/account/create/choose-a-plan'});
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error}/>;
		});

		return (
			<form onSubmit={(e) => {this.createAccount(e);}} className="account-base subscription-account-info">
				<div className="columns">
					<div className="half-column">
						<InputWithLabel label="First name" required={true} ref="firstname"/>
					</div>
					<div className="half-column">
						<InputWithLabel label="Last name" required={false} ref="lastname"/>
					</div>
				</div>
				<InputWithLabel label="Your email" required={true} placeholder="mj@prototypo.io" ref="username"/>
				<InputWithLabel type="password" info="(at least 8 character long)" label="Password" required={true} ref="password"/>
				{errors}
				<AccountValidationButton label="Sign up" loading={this.state.loading}/>
			</form>
		);
	}
}

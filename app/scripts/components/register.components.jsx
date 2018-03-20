import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import Button from './shared/new-button.components';
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

		this.client.dispatchAction('/sign-up', {username, password, firstname, lastname, css, phone, skype, to: this.props.location.query.subscribe ? '/account/subscribe' : this.props.location.query.prevHash, oldQuery: this.props.location.query.subscribe ? {plan: this.props.location.query.subscribe, quantity: this.props.location.query.quantity} : this.props.location.query});
	}

	redirectToNewVersion() {
		window.location = 'https://app.prototypo.io/#signup';
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
					<div className="sign-up-message">
						<p>Signing up has been deactivated for<br/> this legacy version of Prototypo.</p>
						<Button onClick={this.redirectToNewVersion}>Take me to the new version!</Button>
					</div>
				</div>
			</div>
		);
	}
}

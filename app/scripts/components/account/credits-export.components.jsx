import React from 'react';
import {Link} from 'react-router';

import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import AddCard from '../shared/add-card.components.jsx';
import FormError from '../shared/form-error.components.jsx';

import vatrates from 'vatrates';

export default class CreditsExport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
			country: undefined,
			currency: undefined,
		};

		// function binding
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// format : freegeoip.net/{format}/{IP_or_hostname}
		// const url = 'http://freegeoip.net/json/google.com';
		const url = 'http://freegeoip.net/json/';

		this.serverRequest = fetch(url)
			.then((response) => {
				if (response) {
					return response.json();
				}
			})
			.then((response) => {
				if (response.country_code in vatrates) {
					this.setState({
						currency: 'EUR',
					});
				}
				else {
					this.setState({
						currency: 'DOL',
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	handleSubmit(e) {
		e.preventDefault();
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});
		const currency = this.state.currency === 'EUR' ? '€' : '$';

		return (
			<div className="sign-up sign-base">
				<div className="account-dashboard-icon"/>
				<Link to="/account" className="account-dashboard-home-icon"/>
				<div className="account-header">
					<h1 className="account-title">Obtain export credits</h1>
				</div>
				<div className="account-dashboard-container">
					<form className="sign-in-form" onSubmit={this.handleSubmit}>
						<AddCard ref="card" inError={this.state.inError}/>
						{errors}
						<AccountValidationButton
							loading={this.state.loading}
							label={`Pay in ${currency}`}/>
					</form>
				</div>
			</div>
		);
	}
}

import React from 'react';
import {Link} from 'react-router';

import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import AddCard from '../shared/add-card.components.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class CreditsExport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
		};

		// function binding
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
	}
	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});

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
						<AccountValidationButton loading={this.state.loading} label="Continue"/>
					</form>
				</div>
			</div>
		);
	}
}

import React from 'react';
import {withRouter} from 'react-router-dom';
import {injectStripe} from 'react-stripe-elements';

import AddCard from './shared/add-card.components';
import AccountValidationButton from './shared/account-validation-button.components';
import FormError from './shared/form-error.components';

import HoodieApi from '../services/hoodie.services';

class AddCardForm extends React.Component {
	state = {
		loading: false,
		errors: [],
		inError: {},
	};

	handleSubmit = async (e) => {
		e.preventDefault();

		this.setState({loading: true});

		const fullname = e.target.fullname.value;
		const {token} = await this.props.stripe.createToken({
			name: fullname,
		});

		// This bit of code is there to analyze the need of 3D secure
		// among our users and to know if the failing payment is due
		// to their card requiring it.
		// We shall fully move to Sources later.
		try {
			const {source} = await this.props.stripe.createSource({
				type: 'card',
				owner: {
					name: fullname,
				},
			});

			window.Intercom('update', {
				'3d-secure': source.card.three_d_secure,
			});
		}
		catch (err) {
			window.trackJs.track(err);
		}

		try {
			await HoodieApi.updateCustomer({
				source: token.id,
			});

			this.props.history.replace('/account/details?newCard');
		}
		catch (err) {
			this.setState({loading: true, errors: [err.message]});
		}
	};

	render() {
		const errors = this.state.errors.map(error => (
			<FormError errorText={error} />
		));

		return (
			<form
				onSubmit={this.handleSubmit}
				className="account-base account-add-card"
			>
				<AddCard ref="card" inError={this.state.inError} />
				{errors}
				<AccountValidationButton
					className="account-add-card-form-button"
					loading={this.state.loading}
					label="Add card"
				/>
			</form>
		);
	}
}

export default injectStripe(withRouter(AddCardForm));

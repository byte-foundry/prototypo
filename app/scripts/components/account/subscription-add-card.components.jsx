import React from 'react';
import Lifespan from 'lifespan'

import LocalClient from '../../stores/local-client.stores.jsx';

import AddCard from '../shared/add-card.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class SubscriptionAddCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					errors: head.toJS().addcardForm.errors,
					inError: head.toJS().addcardForm.inError,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	addCard() {
		this.client.dispatchAction('/add-card', {
			card: this.refs.card.data(),
			vat: this.refs.vat.inputValue,
		});
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});

		return (
			<div className="account-base subscription-add-card">
				<AddCard inError={this.state.inError} ref="card"/>
				<InputWithLabel ref="vat" label="VAT number"/>
				{errors}
				<AccountValidationButton click={() => {this.addCard();}} label="Add my card"/>
			</div>
		);
	}
}

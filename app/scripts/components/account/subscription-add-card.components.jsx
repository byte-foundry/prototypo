import React from 'react';
import Lifespan from 'lifespan'

import LocalClient from '../../stores/local-client.stores.jsx';

import AddCard from '../shared/add-card.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class SubscriptionAddCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
			infos: {
				card: [],
			},
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
					loading: head.toJS().addcardForm.loading,
					infos: head.toJS().infos,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'addcardForm');
		this.lifespan.release();
	}

	addCard(e) {
		e.preventDefault();
		e.stopPropagation();
		this.client.dispatchAction('/add-card', {
			card: this.refs.card.data(),
			vat: this.refs.vat.inputValue,
		});
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});
		const oldCardData = this.state.infos && this.state.infos.card && this.state.infos.card[0]
			? (
				<div>
					<div>**** **** **** {this.state.infos.card[0].last4}</div>
					<div> {this.state.infos.card[0].exp_month}/{this.state.infos.card[0].exp_year}</div>
				</div>
			)
			: false;
		const oldCard = oldCardData
			? (
				<div className="columns">
					<div className="third-column">
						You already added a card
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true} data={oldCardData}/>
					</div>
				</div>
			)
			: false;

		return (
			<form onSubmit={(e) => {this.addCard(e);}} className="account-base subscription-add-card">
				{oldCard}
				<AddCard inError={this.state.inError} ref="card"/>
				<InputWithLabel ref="vat" label="VAT number"/>
				{errors}
				<AccountValidationButton loading={this.state.loading} label="Add my card"/>
			</form>
		);
	}
}

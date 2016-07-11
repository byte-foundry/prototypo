import React from 'react';
import Lifespan from 'lifespan';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

import getCurrency from '../../helpers/currency.helpers.js';

import LocalClient from '../../stores/local-client.stores.jsx';


export default class SubscriptionConfirmation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			card: [{
				country: 'US',
			}],
			plan: 'personal_monthly',
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS().infos);
				this.setState({
					loading: head.toJS().confirmation.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	confirm() {
		const currency = getCurrency(this.state.card[0].country);

		this.client.dispatchAction('/confirm-buy', {plan: this.state.plan, currency});
	}

	render() {
		const plans = {
			'personal_monthly': {
				name: 'Professional monthly subscription',
				period: 'month',
				USD: '$15.00',
				EUR: '15.00€',
			},
			'personal_annual': {
				name: 'Professional annual subscription',
				period: 'year',
				USD: '$144.00',
				EUR: '144.00€',
			},
		};

		const currency = getCurrency(this.state.card[0].country);

		const card = this.state.card
			? (
				<div>
					<div>**** **** **** {this.state.card[0].last4}</div>
					<div>{this.state.card[0].exp_month}/{this.state.card[0].exp_year}</div>
				</div>
			)
			: false;

		const address = this.state.address
			? (
				<div>
					<div>{this.state.buyerName}</div>
					<div>{this.state.address.building_number} {this.state.address.street_name}</div>
					<div>{this.state.address.address_details}</div>
					<div>{this.state.address.city} {this.state.address.postal_code}</div>
					<div>{this.state.address.region} {this.state.address.country}</div>
				</div>
			)
			: false;

		const vat = this.state.vat
			? (
				<div className="columns">
					<div className="third-column">
						Your VAT number
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data={this.state.vat} nolabel={true}/>
					</div>
				</div>
			)
			: false;

		return (
			<div className="account-base subscription-confirmation">
				<div className="subscription-title">
					Great, you chose the {plans[this.state.plan].name}!
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every {plans[this.state.plan].period} the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data={plans[this.state.plan][currency]} nolabel={true}/>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						Your card number and expiration date
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data={card} nolabel={true}/>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						Your billing address
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data={address} nolabel={true}/>
					</div>
				</div>
				{vat}
				<p>By click on "I confirm my subscription" you agree to prototypo <a className="account-email" target="_blank" href="https://prototypo.io/cgu">EULA (click here to read)</a></p>
				<AccountValidationButton disabled={this.state.loading} loading={this.state.loading} label="I confirm my subscription" click={() => {this.confirm();}}/>
			</div>
		);
	}
}

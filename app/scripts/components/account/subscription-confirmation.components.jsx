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
			plans: {},
		};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const plans = await this.client.fetch('/planStore');

		this.setState({
			plans: plans.head.toJS(),
		});

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS().infos);
				this.setState({
					couponValue: head.toJS().choosePlanForm.couponValue,
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
		const {plans, plan, card, address, couponValue} = this.state;
		const planDescription = plans[plan] || {};
		const currency = getCurrency(card[0].country);

		const couponDom = couponValue
			? (
				<div className="columns">
					<div className="third-column">
						You validated the following coupon
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{couponValue}
						</DisplayWithLabel>
					</div>
				</div>
			) : false;

		const cardDom = card
			? (
				<div>
					<div>**** **** **** {card[0].last4}</div>
					<div>{card[0].exp_month}/{card[0].exp_year}</div>
				</div>
			)
			: false;

		const addressDom = address
			? (
				<div>
					<div>{this.state.buyerName}</div>
					<div>{address.building_number} {address.street_name}</div>
					<div>{address.address_details}</div>
					<div>{address.city} {address.postal_code}</div>
					<div>{address.region} {address.country}</div>
				</div>
			)
			: false;

		const vatDom = this.state.vat
			? (
				<div className="columns">
					<div className="third-column">
						Your VAT number
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{this.state.vat}
						</DisplayWithLabel>
					</div>
				</div>
			)
			: false;

		return (
			<div className="account-base subscription-confirmation">
				<div className="subscription-title">
					Great, you chose the {planDescription.name}!
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every {planDescription.period} the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{planDescription[currency]}
						</DisplayWithLabel>
					</div>
				</div>
				{couponDom}
				<div className="columns">
					<div className="third-column">
						Your card number and expiration date
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{cardDom}
						</DisplayWithLabel>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						Your billing address
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{addressDom}
						</DisplayWithLabel>
					</div>
				</div>
				{vatDom}
				<p>By click on "I confirm my subscription" you agree to prototypo <a className="account-email" target="_blank" href="https://prototypo.io/cgu">EULA (click here to read)</a></p>
				<AccountValidationButton disabled={this.state.loading} loading={this.state.loading} label="I confirm my subscription" click={() => {this.confirm();}}/>
			</div>
		);
	}
}

import React from 'react';
import Lifespan from 'lifespan';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';

import getCurrency from '../../helpers/currency.helpers.js';

import LocalClient from '../../stores/local-client.stores.jsx';


export default class SubscriptionConfirmation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			card: [{
				country: 'US',
			}],
			plan: 'personal_monthly',
			plans: {},
			newUserFromWebSite: undefined,
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
			.onUpdate((head) => {
				this.setState(head.toJS().d.infos);
				this.setState({
					errors: head.toJS().d.confirmation.errors,
					loading: head.toJS().d.confirmation.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	async componentDidMount() {
		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			newUserFromWebSite: prototypoStore.head.toJS().newUserFromWebSite,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	confirm() {
		const currency = getCurrency(this.state.card[0].country);

		this.client.dispatchAction('/confirm-buy', {plan: this.state.plan, currency});

		if (this.state.newUserFromWebSite) {
			window.Intercom('trackEvent', `confirmedPlan.${this.state.plan}`);
		}
	}

	render() {
		const {plans, plan, card, address, isCouponValid, couponValue} = this.state;
		const planDescription = plans[plan] || {};
		const currency = getCurrency(card[0].country);

		const couponDom = isCouponValid
			? (
				<div className="columns">
					<div className="third-column">
						Validated coupon
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{couponValue} → {isCouponValid.label}
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
						VAT number
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
						Amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{planDescription[currency]} /{planDescription.period}
						</DisplayWithLabel>
					</div>
				</div>
				{couponDom}
				<div className="columns">
					<div className="third-column">
						Payment details
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{cardDom}
						</DisplayWithLabel>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						Billing address
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							{addressDom}
						</DisplayWithLabel>
					</div>
				</div>
				{vatDom}
				<p>By clicking on "confirm subscription" you agree to prototypo's <a className="account-email" target="_blank" href="https://prototypo.io/cgu">EULA</a></p>
				{this.state.errors.map((error, id) => {
					return <FormError key={`error-${id}`} errorText={error} />;
				})}
				<AccountValidationButton disabled={this.state.loading} loading={this.state.loading} label="confirm subscription" click={() => {this.confirm();}}/>
			</div>
		);
	}
}

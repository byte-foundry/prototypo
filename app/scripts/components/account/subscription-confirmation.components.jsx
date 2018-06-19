import React from 'react';
import Lifespan from 'lifespan';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';
import Price from '../shared/price.components';
import withCountry from '../shared/with-country.components';

import getCurrency from '../../helpers/currency.helpers.js';
import HoodieApi from '../../services/hoodie.services';

import LocalClient from '../../stores/local-client.stores.jsx';

class SubscriptionConfirmation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: [],
			card: [
				{
					country: props.country,
				},
			],
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

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {infos, confirmation, choosePlanForm} = head.toJS().d;

				this.setState({
					...infos,
					errors: confirmation.errors,
					loading: confirmation.loading,
					coupon: choosePlanForm.couponValue && {
						...choosePlanForm.validCoupon, // coupon details
						value: choosePlanForm.couponValue, // coupon value
					},
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	async componentWillUpdate(nextProps, {card, plan, coupon, totalPrice}) {
		if (coupon && totalPrice === undefined) {
			const invoice = await HoodieApi.getUpcomingInvoice({
				subscription_plan: `${plan}_${getCurrency(card[0].country)}_taxfree`,
				coupon: coupon.value,
			});

			this.setState({totalPrice: invoice.total / 100});
		}
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

		this.client.dispatchAction('/confirm-buy', {
			plan: this.state.plan,
			currency,
		});

		if (this.state.newUserFromWebSite) {
			window.Intercom('trackEvent', `confirmedPlan.${this.state.plan}`);
		}
	}

	render() {
		const {plans, plan, card, address, coupon, totalPrice} = this.state;
		const planDescription = plans[plan] || {};
		const fullPrice = parseFloat(planDescription.amount);

		const couponDom = coupon ? (
			<div className="columns">
				<div className="third-column">Validated coupon</div>
				<div className="two-third-column">
					<DisplayWithLabel nolabel={true}>
						{coupon.value} → {coupon.label}
					</DisplayWithLabel>
				</div>
			</div>
		) : (
			false
		);

		const cardDom
			= card && card[0].last4 ? (
				<div className="columns">
					<div className="third-column">Payment details</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true}>
							<div>
								<div>**** **** **** {card[0].last4}</div>
								<div>
									Expires on {String(card[0].exp_month).padStart(2, 0)}/{
										card[0].exp_year
									}
								</div>
							</div>
						</DisplayWithLabel>
					</div>
				</div>
			) : (
				false
			);

		const addressDom = address ? (
			<div className="columns">
				<div className="third-column">Billing address</div>
				<div className="two-third-column">
					<DisplayWithLabel nolabel={true}>
						<div>
							<div>{this.state.buyerName}</div>
							<div>
								{address.building_number} {address.street_name}
							</div>
							<div>{address.address_details}</div>
							<div>
								{address.city} {address.postal_code}
							</div>
							<div>
								{address.region} {address.country}
							</div>
						</div>
					</DisplayWithLabel>
				</div>
			</div>
		) : (
			false
		);

		const vatDom = this.state.vat ? (
			<div className="columns">
				<div className="third-column">VAT number</div>
				<div className="two-third-column">
					<DisplayWithLabel nolabel={true}>{this.state.vat}</DisplayWithLabel>
				</div>
			</div>
		) : (
			false
		);

		const price = coupon && totalPrice !== undefined ? totalPrice : fullPrice;
		const originalPrice = coupon
			&& totalPrice !== undefined
			&& fullPrice !== price && (
			<span className="subscription-confirmation-amount-original-price">
				<Price amount={fullPrice} country={card[0].country} />
			</span>
		);

		return (
			<div className="account-base subscription-confirmation">
				<div className="subscription-title">
					Great, you chose the {planDescription.name}!
				</div>
				<div className="columns">
					<div className="third-column">Amount</div>
					<div className="two-third-column subscription-confirmation-amount">
						<DisplayWithLabel nolabel={true}>
							<Price amount={price} country={card[0].country} /> {originalPrice}{' '}
							/ {planDescription.period}
						</DisplayWithLabel>
					</div>
				</div>
				{couponDom}
				{cardDom}
				{addressDom}
				{vatDom}
				<p>
					By clicking on "confirm subscription" you agree to prototypo's{' '}
					<a
						className="account-email"
						target="_blank"
						href="https://prototypo.io/cgu"
					>
						EULA
					</a>
				</p>
				{this.state.errors.map((error, id) => <FormError key={`error-${id}`} errorText={error} />)}
				<AccountValidationButton
					disabled={this.state.loading}
					loading={this.state.loading}
					label="confirm subscription"
					click={() => {
						this.confirm();
					}}
				/>
			</div>
		);
	}
}

SubscriptionConfirmation.propTypes = {
	country: React.PropTypes.string.isRequired,
};

export default withCountry(SubscriptionConfirmation);

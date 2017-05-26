import React from 'react';
import Lifespan from 'lifespan';

import {monthlyConst, annualConst, agencyMonthlyConst, agencyAnnualConst} from '../../data/plans.data.js';

import LocalClient from '../../stores/local-client.stores.jsx';

import AddCard from '../shared/add-card.components.jsx';
import Button from '../shared/button.components.jsx';
import InputNumber from '../shared/input-number.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Price from '../shared/price.components.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class SubscriptionCardAndValidation extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			card: [],
			quantity: props.quantity || 1,
			couponValue: undefined,
			inError: {},
			errors: [],
			hasBeenSubscribing: false,
		};

		this.changeCard = this.changeCard.bind(this);
		this.changeQuantity = this.changeQuantity.bind(this);
		this.keepCard = this.keepCard.bind(this);
		this.addCoupon = this.addCoupon.bind(this);
		this.handleCouponChange = this.handleCouponChange.bind(this);
		this.handleCouponSubmit = this.handleCouponSubmit.bind(this);
		this.subscribe = this.subscribe.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {cards, choosePlanForm, confirmation, hasBeenSubscribing} = head.toJS().d;

				this.setState((state) => ({
					card: cards || [],
					couponValue: choosePlanForm.couponValue || this.props.coupon,
					validCoupon: choosePlanForm.validCoupon,
					wasValidCoupon: choosePlanForm.validCoupon || state.wasValidCoupon,
					loading: confirmation.loading,
					inError: confirmation.inError || {},
					errors: confirmation.errors,
					hasBeenSubscribing,
				}));
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillReceiveProps({quantity}) {
		if (this.props.quantity !== quantity) {
			this.changeQuantity(quantity);
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeCard() {
		this.setState({
			changeCard: true,
		});
	}

	keepCard() {
		this.setState({
			changeCard: false,
		});
	}

	addCoupon() {
		this.setState({couponValue: ''});
	}

	changeQuantity(value) {
		this.setState({quantity: parseInt(value, 10)});
	}

	subscribe() {
		const {plan} = this.props;
		const {couponValue, card, quantity} = this.state;

		this.client.dispatchAction('/confirm-buy', {
			plan,
			vat: '', // this.refs.vat.value,
			coupon: couponValue,
			card: this.refs.card && card.length < 1
				? this.refs.card.data()
				: false,
			quantity: (plan.startsWith('agency') && quantity) || undefined,
		});
	}

	handleCouponChange() {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.refs.coupon.inputValue,
		});
		this.setState({isFormSubmitted: false});
	}

	handleCouponSubmit(e) {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.refs.coupon.inputValue,
		});
		this.setState({'isFormSubmitted': true});
	}

	render() {
		const {country, plan} = this.props;
		const {quantity} = this.state;
		const plans = {
			'personal_monthly': {
				blurb: (
					this.state.hasBeenSubscribing
					? (
						<div>
							By clicking on the subscribe button below you agree to be charged <Price amount={monthlyConst.price} country={country}/> every month until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a targer="_blank" href="https://prototypo.io/cgu/">EULA</a>.
						</div>
					)
					: (
						<div>
							By clicking on the subscribe button below you agree to and pay <Price amount={monthlyConst.firstMonthPrice} country={country}/> for the first month of your Prototypo subscription. You'll also agree to be charged <Price amount={monthlyConst.price} country={country}/> every month after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" href="https://prototypo.io/cgu/">EULA</a>.
						</div>
					)
				),
			},
			'personal_annual_99': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <Price amount={annualConst.annualPrice} country={country}/> once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a targer="_blank" href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
			'agency_monthly': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <Price amount={agencyMonthlyConst.monthlyPrice * quantity} country={country}/> once and be subscribed to Prototypo. You also agree to be charged every month of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a targer="_blank" href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
			'agency_annual': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <Price amount={agencyAnnualConst.annualPrice * quantity} country={country}/> once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a targer="_blank" href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
		};

		const card = this.state.card.length > 0 && !this.state.changeCard
			? (
				<div>
					<div className="subscription-card-and-validation-card">
						<div className="subscription-card-and-validation-card-chip">
							<div className="subscription-card-and-validation-card-chip-left"></div>
							<div className="subscription-card-and-validation-card-chip-right"></div>
						</div>
						<div className="subscription-card-and-validation-card-number">
							**** **** **** {this.state.card[0].last4}
						</div>
						<div className="subscription-card-and-validation-card-date">
							{this.state.card[0].exp_month}/{this.state.card[0].exp_year}
						</div>
						<div className="subscription-card-and-validation-card-name">
							{this.state.card[0].name}
						</div>
					</div>
					<div className="columns subscription-card-and-validation-buttons">
						<div className="subscription-card-and-validation-switch half-column" onClick={this.addCoupon}>I have a coupon</div>
						<div className="subscription-card-and-validation-switch is-right half-column" onClick={this.changeCard}>Change my card</div>
					</div>
				</div>
			)
			: (
				<div>
					<AddCard inError={this.state.inError} ref="card" className={`${this.state.validCoupon && this.state.validCoupon.shouldSkipCard ? "disabled" : ''}`}/>
					<div className="columns subscription-card-and-validation-buttons">
						<div className="subscription-card-and-validation-switch half-column" onClick={this.addCoupon}>I have a coupon</div>
						{this.state.card.length > 0
								&& <div className="subscription-card-and-validation-switch is-right half-column" onClick={this.keepCard}>Keep my card</div>}
					</div>
				</div>
			);
		const coupon = this.state.couponValue !== undefined && (
			<div>
				<form onSubmit={this.handleCouponSubmit}>
					<InputWithLabel ref="coupon" label="Coupon code" error={false} onChange={this.handleCouponChange} value={this.state.couponValue}/>
				</form>
				{this.state.validCoupon
					? <div className="subscription-card-and-validation-valid-coupon">{`(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ ${this.state.validCoupon.label}`}</div>
					: this.state.wasValidCoupon || this.state.isFormSubmitted
						? <div className="subscription-card-and-validation-error-coupon">ʕ ಡ╭╮ಡ ʔ This is not a valid coupon</div>
						: null}
			</div>
		);

		const errors = this.state.errors.map((error, index) => {
			return <FormError key={index} errorText={error} />;
		});

		if (plans[plan]) {

			const {blurb} = plans[plan];

			return (
				<div className="subscription-card-and-validation normal">
					{plan.startsWith('agency') && (
						<div className="input-with-label">
							<label className="input-with-label-label" htmlFor="quantity">Quantity:</label>
							<InputNumber
								min={2}
								max={100}
								value={quantity}
								controls
								onChange={this.changeQuantity}
							/>
						</div>
					)}
					{card}
					{coupon}
					<div className="subscription-card-and-validation-legal">
						{blurb}
					</div>
					{errors}
					<Button big label="Subscribe to prototypo" click={this.subscribe} loading={this.state.loading}/>
				</div>
			);
		}
		else {
			this.context.router.replace('/account/subscribe?plan=personal_annual_99');
			return false;
		}
	}
}

SubscriptionCardAndValidation.contextTypes = {
	router: React.PropTypes.object.isRequired,
};

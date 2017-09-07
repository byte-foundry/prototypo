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
			couponValue: undefined,
			inError: {},
			errors: [],
			hasBeenSubscribing: false,
			isFormSubmitted: false,
			firstTimeCheck: false,
		};

		this.changeCard = this.changeCard.bind(this);
		this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
		this.keepCard = this.keepCard.bind(this);
		this.addCoupon = this.addCoupon.bind(this);
		this.handleCouponChange = this.handleCouponChange.bind(this);
		this.handleCouponSubmit = this.handleCouponSubmit.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.checkPlan = this.checkPlan.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.checkPlan(this.props.plan, this.props.quantity, this.props.coupon);

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

	componentWillReceiveProps({plan, quantity, coupon}) {
		this.checkPlan(plan, quantity, coupon);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	checkPlan(plan, quantity, coupon) {
		if (this.props.coupon !== coupon || !this.state.firstTimeCheck) {
			this.client.dispatchAction('/choose-plan', {
				plan,
				quantity,
				coupon,
			});
			this.setState({firstTimeCheck: true});
		}

		if (!coupon || coupon === '') {
			this.setState({couponValue: undefined});
		}

		if (plan !== 'personal_monthly' && plan !== 'personal_annual_99' && plan !== 'agency_monthly' && plan !== 'agency_annual') {
			this.props.onChangePlan({
				plan: plan.startsWith('agency') ? 'agency_annual' : 'personal_annual_99',
				quantity: plan.startsWith('agency') ? parseInt(quantity, 10) || 2 : undefined,
				coupon,
			});
		}
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

	subscribe() {
		const {plan, quantity} = this.props;
		const {couponValue, card} = this.state;

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

	handleChangeQuantity(value) {
		this.props.onChangePlan({
			quantity: parseInt(value, 10),
			plan: this.props.plan,
			coupon: this.props.coupon || undefined,
		});
	}

	handleCouponChange(e) {
		this.props.onChangePlan({
			coupon: e.target.value,
			plan: this.props.plan,
			quantity: this.props.quantity,
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
		const {couponValue} = this.state;
		const {country, plan, quantity} = this.props;

		let percentPrice = 1;
		if (this.state.validCoupon && this.state.validCoupon.percent_off) {
			percentPrice = (100 - this.state.validCoupon.percent_off) / 100;
		}

		if (!plan) {
			return null;
		}

		const plans = {
			'personal_monthly': {
				blurb: (
					this.state.hasBeenSubscribing
					? (
						percentPrice === 1
						? (
							<div>
								By clicking on the subscribe button below you agree to be charged <strong><Price amount={monthlyConst.price * percentPrice} country={country}/></strong> every month until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
							</div>
						)
						: (
							<div>
								By clicking on the subscribe button below you agree to be charged <strong><Price amount={monthlyConst.price * percentPrice} country={country}/></strong> for the first month of your Prototypo subscription. You'll also agree to be charged <strong><Price amount={monthlyConst.price} country={country}/></strong> every month after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
							</div>
						)
					)
					: (
						<div>
							By clicking on the subscribe button below you agree to and pay <strong><Price amount={monthlyConst.firstMonthPrice * percentPrice} country={country}/></strong> for the first month of your Prototypo subscription. You'll also agree to be charged <strong><Price amount={monthlyConst.price} country={country}/></strong> every month after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
						</div>
					)
				),
			},
			'personal_annual_99': {
				blurb: (
					percentPrice === 1
					? (
						<div>
							By clicking on the subscribe button below you agree to pay <strong><Price amount={annualConst.annualPrice * percentPrice} country={country}/></strong> once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
						</div>
					)
					: (
						<div>
							By clicking on the subscribe button below you agree to pay <strong><Price amount={annualConst.annualPrice * percentPrice} country={country}/></strong> once and subscribe to Prototypo for a full year. You'll also agree to be charged <strong><Price amount={annualConst.annualPrice} country={country}/></strong> every year after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
						</div>
					)
				),
			},
			'agency_monthly': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <strong><Price amount={(agencyMonthlyConst.monthlyPrice * quantity) * percentPrice} country={country}/></strong> once and be subscribed to Prototypo. You also agree to be charged every month of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" rel="noopener noreferrer" href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
			'agency_annual': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <strong><Price amount={(agencyAnnualConst.annualPrice * quantity * percentPrice)} country={country}/></strong> once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a target="_blank" href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
		};

		if (!plans[plan]) {
			return null;
		}

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
						{couponValue === undefined && <div className="subscription-card-and-validation-switch half-column" onClick={this.addCoupon}>I have a coupon</div>}
						<div className="subscription-card-and-validation-switch is-right half-column" onClick={this.changeCard}>Change my card</div>
					</div>
				</div>
			)
			: (
				<div>
					<AddCard inError={this.state.inError} ref="card" className={`${this.state.validCoupon && this.state.validCoupon.shouldSkipCard ? "disabled" : ''}`}/>
					<div className="columns subscription-card-and-validation-buttons">
						{couponValue === undefined && <div className="subscription-card-and-validation-switch half-column" onClick={this.addCoupon}>I have a coupon</div>}
						{this.state.card.length > 0
								&& <div className="subscription-card-and-validation-switch is-right half-column" onClick={this.keepCard}>Keep my card</div>}
					</div>
				</div>
			);
		const coupon = couponValue !== undefined && (
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
							onChange={this.handleChangeQuantity}
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
}

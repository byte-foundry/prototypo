import React from 'react';
import Lifespan from 'lifespan';

import {
	monthlyConst,
	annualConst,
	teamMonthlyConst,
	teamAnnualConst,
} from '../../data/plans.data';

import LocalClient from '../../stores/local-client.stores';

import AddCard from '../shared/add-card.components';
import Button from '../shared/button.components';
import InputNumber from '../shared/input-number.components';
import InputWithLabel from '../shared/input-with-label.components';
import Price from '../shared/price.components';
import FormError from '../shared/form-error.components';

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

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {
					cards,
					choosePlanForm,
					confirmation,
					hasBeenSubscribing,
				} = head.toJS().d;

				this.setState(state => ({
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

		const newPlan = {};

		if (plan.startsWith('team') && Number.isNaN(parseInt(quantity, 10))) {
			newPlan.quantity = 1;
		}

		if (
			plan !== 'personal_monthly'
			&& plan !== 'personal_annual_99'
			&& plan !== 'team_monthly'
			&& plan !== 'team_annual'
		) {
			newPlan.plan = plan.startsWith('team')
				? 'team_annual'
				: 'personal_annual_99';
		}

		if (newPlan.quantity || newPlan.plan) {
			this.props.onChangePlan({
				...newPlan,
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
			card: this.card && card.length < 1 ? this.card.data() : false,
			quantity: (plan.startsWith('team') && quantity) || undefined,
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

	handleCouponSubmit() {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.coupon.inputValue,
		});
		this.setState({isFormSubmitted: true});
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
			personal_monthly: {
				blurb:
					percentPrice === 1 ? (
						<div>
							By clicking on the subscribe button below you agree to be charged{' '}
							<strong>
								<Price
									amount={monthlyConst.price * percentPrice}
									country={country}
								/>
							</strong>{' '}
							every month until you cancel your subscription to Prototypo. You
							also agree to respect Prototypo's{' '}
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					) : (
						<div>
							By clicking on the subscribe button below you agree to be charged{' '}
							<strong>
								<Price
									amount={monthlyConst.price * percentPrice}
									country={country}
								/>
							</strong>{' '}
							for the first month of your Prototypo subscription. You'll also
							agree to be charged{' '}
							<strong>
								<Price amount={monthlyConst.price} country={country} />
							</strong>{' '}
							every month after that first until you cancel your subscription to
							Prototypo. You also agree to respect Prototypo's{' '}
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					),
			},
			personal_annual_99: {
				blurb:
					percentPrice === 1 ? (
						<div>
							By clicking on the subscribe button below you agree to pay{' '}
							<strong>
								<Price
									amount={annualConst.annualPrice * percentPrice}
									country={country}
								/>
							</strong>{' '}
							once and subscribe to Prototypo for a full year. You also agree to
							be charged every year of this amount until you cancel your
							subscription to Prototypo. You also agree to respect Prototypo's{' '}
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					) : (
						<div>
							By clicking on the subscribe button below you agree to pay{' '}
							<strong>
								<Price
									amount={annualConst.annualPrice * percentPrice}
									country={country}
								/>
							</strong>{' '}
							once and subscribe to Prototypo for a full year. You'll also agree
							to be charged{' '}
							<strong>
								<Price amount={annualConst.annualPrice} country={country} />
							</strong>{' '}
							every year after that first until you cancel your subscription to
							Prototypo. You also agree to respect Prototypo's{' '}
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					),
			},
			team_monthly: {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay{' '}
						<strong>
							<Price
								amount={teamMonthlyConst.monthlyPrice * quantity * percentPrice}
								country={country}
							/>
						</strong>{' '}
						once and be subscribed to Prototypo. You also agree to be charged
						every month of this amount until you cancel your subscription to
						Prototypo. You also agree to respect Prototypo's{' '}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://prototypo.io/cgu/"
						>
							EULA
						</a>.
					</div>
				),
			},
			team_annual: {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay{' '}
						<strong>
							<Price
								amount={teamAnnualConst.annualPrice * quantity * percentPrice}
								country={country}
							/>
						</strong>{' '}
						once and subscribe to Prototypo for a full year. You also agree to
						be charged every year of this amount until you cancel your
						subscription to Prototypo. You also agree to respect Prototypo's{' '}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://prototypo.io/cgu/"
						>
							EULA
						</a>.
					</div>
				),
			},
		};

		if (!plans[plan]) {
			return null;
		}

		const card
			= this.state.card.length > 0 && !this.state.changeCard ? (
				<div>
					<div className="subscription-card-and-validation-card">
						<div className="subscription-card-and-validation-card-chip">
							<div className="subscription-card-and-validation-card-chip-left" />
							<div className="subscription-card-and-validation-card-chip-right" />
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
						{typeof couponValue !== 'string' && (
							<div
								className="subscription-card-and-validation-switch half-column"
								onClick={this.addCoupon}
							>
								I have a coupon
							</div>
						)}
						<div
							className="subscription-card-and-validation-switch is-right half-column"
							onClick={this.changeCard}
						>
							Change my card
						</div>
					</div>
				</div>
			) : (
				<div>
					<AddCard
						inError={this.state.inError}
						ref={(item) => {
							this.card = item;
						}}
						className={`${
							this.state.validCoupon && this.state.validCoupon.shouldSkipCard
								? 'disabled'
								: ''
						}`}
					/>
					<div className="columns subscription-card-and-validation-buttons">
						{typeof couponValue !== 'string' && (
							<div
								className="subscription-card-and-validation-switch half-column"
								onClick={this.addCoupon}
							>
								I have a coupon
							</div>
						)}
						{this.state.card.length > 0 && (
							<div
								className="subscription-card-and-validation-switch is-right half-column"
								onClick={this.keepCard}
							>
								Keep my card
							</div>
						)}
					</div>
				</div>
			);
		const coupon = typeof couponValue === 'string' && (
			<div>
				<form onSubmit={this.handleCouponSubmit}>
					<InputWithLabel
						ref={(item) => {
							this.coupon = item;
						}}
						label="Coupon code"
						error={false}
						onChange={this.handleCouponChange}
						value={this.state.couponValue}
					/>
				</form>
				{this.state.validCoupon ? (
					<div className="subscription-card-and-validation-valid-coupon">{`(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ ${
						this.state.validCoupon.label
					}`}</div>
				) : this.state.wasValidCoupon || this.state.isFormSubmitted ? (
					<div className="subscription-card-and-validation-error-coupon">
						ʕ ಡ╭╮ಡ ʔ This is not a valid coupon
					</div>
				) : null}
			</div>
		);

		const errors = this.state.errors.map((error, index) => (
			<FormError key={index} errorText={error} />
		));

		const {blurb} = plans[plan];

		return (
			<div className="subscription-card-and-validation normal">
				{plan.startsWith('team') && (
					<div className="input-with-label">
						<label className="input-with-label-label" htmlFor="quantity">
							Quantity:
						</label>
						<InputNumber
							className="pricing-item-subtitle-price-info team"
							min={1}
							max={100}
							value={quantity}
							controls
							onChange={this.handleChangeQuantity}
						/>
					</div>
				)}
				{card}
				{coupon}
				<div className="subscription-card-and-validation-legal">{blurb}</div>
				{errors}
				<Button
					big
					label="Subscribe to prototypo"
					click={this.subscribe}
					loading={this.state.loading}
				/>
			</div>
		);
	}
}

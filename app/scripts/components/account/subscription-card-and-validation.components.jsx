import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import AddCard from '../shared/add-card.components.jsx';
import Button from '../shared/button.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Price from '../shared/price.components.jsx';
import FormError from '../shared/form-error.components.jsx';

const emptyArray = [];
const emptyObject = {};

export default class SubscriptionCardAndValidation extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			card: [],
			couponValue: undefined,
			inError: {},
			errors: [],
		};

		this.changeCard = this.changeCard.bind(this);
		this.keepCard = this.keepCard.bind(this);
		this.addCoupon = this.addCoupon.bind(this);
		this.handleCouponChange = this.handleCouponChange.bind(this);
		this.subscribe = this.subscribe.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					card: head.toJS().d.cards || emptyArray,
					couponValue: head.toJS().d.choosePlanForm.couponValue || this.props.coupon,
					validCoupon: head.toJS().d.choosePlanForm.validCoupon,
					wasValidCoupon: head.toJS().d.choosePlanForm.validCoupon || this.state.wasValidCoupon,
					loading: head.toJS().d.confirmation.loading,
					inError: head.toJS().d.confirmation.inError || emptyObject,
					errors: head.toJS().d.confirmation.errors,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
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
		this.setState({
			couponValue: '',
		});
	}

	subscribe() {
		this.client.dispatchAction('/confirm-buy', {
			plan: this.props.plan,
			vat: '',
			//vat: this.refs.vat.value,
			coupon: this.state.couponValue,
			card: this.refs.card && this.state.card.length < 1
				? this.refs.card.data()
				: false,
		});
	}

	handleCouponChange() {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.refs.coupon.inputValue,
		});
	}

	render() {
		const {country, plan} = this.props;
		const plans = {
			'personal_monthly': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to and pay <Price amount={1} country={country}/> for the first month of yout Prototypo. You'll also agree to be charged <Price amount={15} country={country}/> every month after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a href="https://prototypo.io/cgu/">EULA</a>.
					</div>
				),
			},
			'personal_annual_99': {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay <Price amount={99} country={country}/> once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a href="https://prototypo.io/cgu/">EULA</a>.
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
					<AddCard inError={this.state.inError} ref="card"/>
					<div className="columns subscription-card-and-validation-buttons">
						<div className="subscription-card-and-validation-switch half-column" onClick={this.addCoupon}>I have a coupon</div>
						{(() => {
							return this.state.card.length > 0
								? <div className="subscription-card-and-validation-switch is-right half-column" onClick={this.keepCard}>Keep my card</div>
								: false;
						})()}
					</div>
				</div>
			);

		const coupon = this.state.couponValue !== undefined && (
			<div>
				<InputWithLabel ref="coupon" label="Coupon code" error={false} onChange={this.handleCouponChange} value={this.state.couponValue}/>
				{this.state.validCoupon
					? <div className="subscription-card-and-validation-valid-coupon">{`(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ ${this.state.validCoupon.label}`}</div>
					: this.state.wasValidCoupon
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

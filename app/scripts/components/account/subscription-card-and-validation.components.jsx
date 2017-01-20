import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import AddCard from '../shared/add-card.components.jsx';
import Button from '../shared/button.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';

export default class SubscriptionCardAndValidation extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			card: [],
		};

		this.changeCard = this.changeCard.bind(this);
		this.keepCard = this.keepCard.bind(this);
		this.addCoupon = this.addCoupon.bind(this);
		this.handleCouponChange = this.handleCouponChange.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					card: head.toJS().d.infos.card,
					couponValue: head.toJS().d.choosePlanForm.couponValue || '',
					validCoupon: head.toJS().d.choosePlanForm.validCoupon,
					wasValidCoupon: head.toJS().d.choosePlanForm.validCoupon || this.state.wasValidCoupon,
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
			coupon: true,
		});
	}

	handleCouponChange() {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.refs.coupon.inputValue,
		});
	}

	render() {
		const plans = {
			'personal_monthly': {
				blurb: {
					__html: `By clicking on the subscribe button below you agree to and pay $1.00 for the first month of yout Prototypo. You'll also agree to be charged $9.90 every month after that first until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a href="https://prototypo.io/cgu/">EULA</a>.`,
				},
			},
			'personal_annual_99': {
				blurb: {
					__html: `By clicking on the subscribe button below you agree to pay $84.00 once and subscribe to Prototypo for a full year. You also agree to be charged every year of this amount until you cancel your subscription to Prototypo. You also agree to respect Prototypo's <a href="https://prototypo.io/cgu/">EULA</a>.`,
				},
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
					<AddCard inError={false} ref="card"/>
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

		const coupon = this.state.coupon && (
			<div>
				<InputWithLabel ref="coupon" label="Coupon code" error={false} handleOnChange={this.handleCouponChange} value={this.state.couponValue}/>
				{this.state.validCoupon
					? <div className="subscription-card-and-validation-valid-coupon">{`(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ ${this.state.validCoupon.label}`}</div>
					: this.state.wasValidCoupon
						? <div className="subscription-card-and-validation-error-coupon">ʕ ಡ╭╮ಡ ʔ This is not a valid coupon</div>
						: null}
			</div>
		);

		if (plans[this.props.plan]) {

			const {blurb} = plans[this.props.plan];

			return (
				<div className="subscription-card-and-validation normal">
					{card}
					{coupon}
					<div className="subscription-card-and-validation-legal" dangerouslySetInnerHTML={blurb}>
					</div>
					<Button big label="Subscribe to prototypo"/>
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

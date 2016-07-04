import React from 'react';
import Lifespan from 'lifespan';
import classNames from 'classnames';

import LocalClient from '../../stores/local-client.stores.jsx';

import FormError from '../shared/form-error.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionChoosePlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			plans: {},
		};

		this.handleCouponChange = this.handleCouponChange.bind(this);
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
				this.setState({
					selected: head.toJS().choosePlanForm.selected,
					error: head.toJS().choosePlanForm.error,
					loading: head.toJS().choosePlanForm.loading,
					couponValue: head.toJS().choosePlanForm.couponValue,
					isCouponValid: head.toJS().choosePlanForm.isCouponValid,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	confirmPlan() {
		this.client.dispatchAction('/confirm-plan', {plan: this.state.selected});
	}

	handleCouponChange() {
		this.client.dispatchAction('/choose-plan', {
			coupon: this.refs.coupon.inputValue,
		});
	}

	render() {
		const error = this.state.error ? <FormError errorText={this.state.error}/> : false;

		return (
			<div className="account-base subscription-choose-plan">
				<div className="subscription-title">
					Get 5 months free by choosing annual billing!
				</div>
				<div className="subscription-choose-plan-plans">
					<SubscriptionPlan plan={this.state.plans.personal_monthly} selected={this.state.selected}/>
					<SubscriptionPlan plan={this.state.plans.personal_annual_99} selected={this.state.selected}/>
				</div>
				<InputWithLabel
					ref="coupon"
					label="Coupon code"
					placeholder="ABC123"
					value={this.state.couponValue}
					handleOnChange={this.handleCouponChange} />
				{this.state.isCouponValid ? `✓ ${this.state.isCouponValid}` : null }
				<div className="subscription-choose-plan-info">
					* Taxes are offered for private individuals. Currency ultimately depends on the country where your credit card has been issued.
				</div>
				{error}
				<AccountValidationButton
					loading={this.state.loading}
					label="Checkout"
					click={() => {this.confirmPlan();}} />
			</div>
		);
	}
}

class SubscriptionPlan extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	choosePlan() {
		this.client.dispatchAction('/choose-plan', {
			plan: this.props.plan.id,
		});
	}

	render() {
		if (!this.props.plan) {
			return false;
		}

		const classes = classNames({
			'subscription-plan': true,
			'is-active': this.props.selected === this.props.plan.id,
		});

		return (
			<div className={classes} onClick={() => { this.choosePlan();}}>
				<div className="subscription-plan-name">
					{this.props.plan.name}
				</div>
				<div className="subscription-plan-price">
					<div className="subscription-plan-amount">
						{this.props.plan.amount}
					</div>
					<div className="subscription-plan-period">
						{this.props.plan.period}
					</div>
				</div>
				<div className="subscription-plan-info">
					{this.props.plan.info}
				</div>
			</div>
		);
	}
}

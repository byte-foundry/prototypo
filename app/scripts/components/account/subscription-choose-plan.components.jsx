import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';

import LocalClient from '../../stores/local-client.stores.jsx';

import FormError from '../shared/form-error.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionChoosePlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					selected: head.toJS().choosePlanForm.selected,
					error: head.toJS().choosePlanForm.error,
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

	render() {
		const planMonthly = {
			id: 'personal_monthly_USD_taxfree',
			name: 'Monthly billing',
			amount: '15',
			period: 'month',
			info: 'Without commitment!',
		};

		const planYearly = {
			id: 'personal_annual_USD_taxfree',
			name: 'Yearly billing',
			amount: '12',
			period: 'month',
			info: 'Pay once 144 for a whole year!',
		};

		const error = this.state.error ? <FormError errorText={this.state.error}/> : false;

		return (
			<div className="account-base subscription-choose-plan">
				<div className="subscription-title">
					Get 2 months free by choosing annual billing!
				</div>
				<div className="subscription-choose-plan-plans">
					<SubscriptionPlan plan={planMonthly} selected={this.state.selected}/>
					<SubscriptionPlan plan={planYearly} selected={this.state.selected}/>
				</div>
				<div className="subscription-choose-plan-info">
					* Taxes are offered for private individuals. Currency ultimately depends on the country where your credit card has been issued.
				</div>
				{error}
				<AccountValidationButton label="Checkout" click={() => {this.confirmPlan();}}/>
			</div>
		);
	}
}

class SubscriptionPlan extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	choosePlan() {
		this.client.dispatchAction('/choose-plan', this.props.plan.id);
	}

	render() {
		const classes = Classnames({
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

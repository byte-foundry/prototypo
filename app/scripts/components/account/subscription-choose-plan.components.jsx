import React from 'react';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionChoosePlan extends React.Component {
	render() {
		const plan = {
			name: 'Monthly billing',
			amount: '15',
			period: 'month',
			info: 'Without commitment!',
		};

		return (
			<div className="account-base subscription-choose-plan">
				<div className="subscription-title">
					Get 2 months free by choosing annual billing!
				</div>
				<div className="subscription-choose-plan-plans">
					<SubscriptionPlan plan={plan}/>
					<SubscriptionPlan plan={plan}/>
				</div>
				<div className="subscription-choose-plan-info">
					* Taxes are offered for private individuals. Currency ultimately depends on the country where your credit card has been issued.
				</div>
				<AccountValidationButton label="Checkout"/>
			</div>
		);
	}
}

class SubscriptionPlan extends React.Component {
	render() {
		return (
			<div className="subscription-plan">
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

import React from 'react';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';

import InputNumber from '../shared/input-number.components';
import PricingItem from '../shared/pricing-item.components';
import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

import LocalClient from '../../stores/local-client.stores';
import getCurrency from '../../helpers/currency.helpers';

import {
	monthlyConst,
	annualConst,
	agencyMonthlyConst,
	agencyAnnualConst,
} from '../../data/plans.data';

const UNSUBSCRIBE_MESSAGE = `
Hi,

I would like to cancel my subscription to Prototypo.
`.trim();

export default class AccountChangePlan extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
		};

		this.confirmChange = this.confirmChange.bind(this);
		this.downgrade = this.downgrade.bind(this);
		this.changeNumberOfUsers = this.changeNumberOfUsers.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {subscription, cards} = head.toJS().d;

				if (!subscription) {
					this.props.history.push('/account/subscribe');
					return;
				}

				this.setState({
					loading: false,
					subscription,
					plan: subscription.plan.id,
					numberOfUsers: parseInt((subscription && subscription.quantity) || 0, 10),
					selection: subscription.plan.id.includes('monthly') ? 'monthly' : 'annual',
					isAgency: subscription.plan.id.includes('agency'),
					currency: getCurrency(cards[0].country),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'choosePlanForm');
		this.lifespan.release();
	}

	confirmChange() {
		const {selection, numberOfUsers, isAgency} = this.state;

		const plan = `${isAgency ? 'agency' : 'personal'}_${selection}`;

		Intercom('trackEvent', 'change-plan-select', {
			plan,
			quantity: numberOfUsers,
		});

		this.props.history.push({
			pathname: '/account/details/confirm-plan',
			query: {
				plan,
				quantity: numberOfUsers,
			},
		});
	}

	downgrade(e) {
		if (Intercom) {
			e.preventDefault();

			Intercom('showNewMessage', UNSUBSCRIBE_MESSAGE);
		}
	}

	changeNumberOfUsers(value) {
		this.setState({numberOfUsers: parseInt(value, 10)});
	}

	renderChoices() {
		const {subscription, numberOfUsers, selection, currency} = this.state;

		const {plan} = subscription;
		const hasAgencyPlan
			= plan.id.includes(agencyMonthlyConst.prefix) || plan.id.includes(agencyAnnualConst.prefix);
		const monthlyPlan = (hasAgencyPlan && agencyMonthlyConst) || monthlyConst;
		const annualPlan = (hasAgencyPlan && agencyAnnualConst) || annualConst;

		return (
			<div>
				<div className="pricing">

					<PricingItem
						title="Monthly"
						description="Flexible pricing with no commitment"
						selected={selection === 'monthly'}
						currency={currency}
						amount={monthlyPlan.monthlyPrice * numberOfUsers}
						current={plan.id.includes(monthlyPlan.prefix)}
						onClick={() => this.setState({selection: 'monthly', selectedPlan: monthlyPlan})}
					/>

					<PricingItem
						title="Yearly"
						description="Flexible pricing with no commitment"
						selected={selection === 'annual'}
						currency={currency}
						amount={annualPlan.monthlyPrice * numberOfUsers}
						current={plan.id.includes(annualPlan.prefix)}
						onClick={() => this.setState({selection: 'annual', selectedPlan: annualPlan})}
					/>

				</div>

				{hasAgencyPlan
					&& <div className="account-change-plan-number-of-users">
						<p>You can update the number of users you manage:</p>

						<InputNumber
							min={1}
							max={100}
							value={numberOfUsers}
							onChange={this.changeNumberOfUsers}
							controls
						/>
					</div>}

				<div className="account-change-plan-actions">
					<Button
						onClick={this.confirmChange}
						disabled={plan.id.includes(selection) && numberOfUsers === subscription.quantity}
					>
						Apply change
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const {loading} = this.state;

		return (
			<div className="account-base account-change-plan">
				<header className="manage-sub-users-header">
					<h1 className="manage-sub-users-title">Change Plan</h1>
					<p className="manage-sub-users-sidephrase">
						Want to downgrade? <a
							href={`mailto:account@prototypo.io?subject=Cancelling my subscription&body=${encodeURI(UNSUBSCRIBE_MESSAGE)}`}
							className="account-email"
							onClick={this.downgrade}
						>
							Contact us!
						</a>
					</p>
				</header>

				{loading ? <WaitForLoad loading /> : this.renderChoices()}
			</div>
		);
	}
}

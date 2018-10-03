import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React from 'react';
import {Query} from 'react-apollo';
import {Redirect, withRouter} from 'react-router';

import InputNumber from '../shared/input-number.components';
import PricingItem from '../shared/pricing-item.components';
import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';
import Dashboard from './account-dashboard.components';

import getCurrency from '../../helpers/currency.helpers';

import {
	monthlyConst,
	annualConst,
	teamMonthlyConst,
	teamAnnualConst,
} from '../../data/plans.data';

const UNSUBSCRIBE_MESSAGE = `
Hi,

I would like to cancel my subscription to Prototypo.
`.trim();

const GET_SUBSCRIPTION_AND_CARDS = gql`
	query getSubscriptionAndCards {
		user {
			id
			subscription @client {
				id
				quantity
				plan {
					id
				}
			}
			cards @client {
				id
				name
				last4
				exp_month
				exp_year
				country
			}
		}
	}
`;

class AccountChangePlan extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selection: undefined,
			selectedPlan: undefined,
			numberOfUsers: undefined,
		};

		this.confirmChange = this.confirmChange.bind(this);
		this.downgrade = this.downgrade.bind(this);
		this.changeNumberOfUsers = this.changeNumberOfUsers.bind(this);
	}

	confirmChange({subscription: {quantity, plan}}) {
		const initialPlan = (plan.id.includes('monthly')
			? teamMonthlyConst
			: teamAnnualConst
		).prefix;
		const {selectedPlan = initialPlan, numberOfUsers = quantity} = this.state;

		window.Intercom('trackEvent', 'change-plan-select', {
			plan: selectedPlan.prefix,
			quantity,
		});

		this.props.history.push({
			pathname: '/account/details/confirm-plan',
			search: new URLSearchParams({
				plan: selectedPlan.prefix,
				quantity: numberOfUsers,
			}).toString(),
		});
	}

	downgrade(e) {
		e.preventDefault();
		window.Intercom('showNewMessage', UNSUBSCRIBE_MESSAGE);
	}

	changeNumberOfUsers(value) {
		this.setState({numberOfUsers: parseInt(value, 10)});
	}

	renderChoices({subscription, currency}) {
		const {plan, quantity} = subscription;
		const initialSelection = plan.id.includes('monthly') ? 'monthly' : 'annual';
		const {numberOfUsers = quantity, selection = initialSelection} = this.state;

		const hasTeamPlan
			= plan.id.includes(teamMonthlyConst.prefix)
			|| plan.id.includes(teamAnnualConst.prefix);
		const monthlyPlan = (hasTeamPlan && teamMonthlyConst) || monthlyConst;
		const annualPlan = (hasTeamPlan && teamAnnualConst) || annualConst;

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
						onClick={() =>
							this.setState({
								selection: 'monthly',
								selectedPlan: monthlyPlan,
							})
						}
					/>

					<PricingItem
						title="Yearly"
						description="Flexible pricing with no commitment"
						selected={selection === 'annual'}
						currency={currency}
						amount={annualPlan.monthlyPrice * numberOfUsers}
						current={plan.id.includes(annualPlan.prefix)}
						onClick={() =>
							this.setState({
								selection: 'annual',
								selectedPlan: annualPlan,
							})
						}
					/>
				</div>

				{hasTeamPlan && (
					<div className="account-change-plan-number-of-users">
						<p>You can update the number of users you manage:</p>

						<InputNumber
							className="pricing-item-subtitle-price-info team"
							min={quantity}
							max={100}
							value={numberOfUsers}
							onChange={this.changeNumberOfUsers}
							controls
						/>
					</div>
				)}

				<div className="account-change-plan-actions">
					<Button
						onClick={() => this.confirmChange({subscription})}
						disabled={plan.id.includes(selection) && numberOfUsers <= quantity}
					>
						Apply change
					</Button>
				</div>
			</div>
		);
	}

	render() {
		return (
			<Query query={GET_SUBSCRIPTION_AND_CARDS}>
				{({loading, data: {user}}) => {
					if (!loading && user && !user.subscription) {
						return <Redirect to="/account/subscribe" />;
					}

					const currency = getCurrency(
						user && user.cards[0] && user.cards[0].country,
					);

					return (
						<Dashboard title="Change my plan">
							<div className="account-base account-change-plan">
								<header className="manage-sub-users-header">
									<h1 className="manage-sub-users-title">Change Plan</h1>
									<p className="manage-sub-users-sidephrase">
										Want to downgrade?{' '}
										<a
											href={`mailto:account@prototypo.io?subject=Cancelling my subscription&body=${encodeURI(
												UNSUBSCRIBE_MESSAGE,
											)}`}
											className="account-email"
											onClick={this.downgrade}
											title="If this link doesn't work, you may need to turn off your privacy blocker"
										>
											Contact us!
										</a>
									</p>
								</header>

								{loading ? (
									<WaitForLoad loading />
								) : (
									this.renderChoices({
										subscription: user.subscription,
										currency,
									})
								)}
							</div>
						</Dashboard>
					);
				}}
			</Query>
		);
	}
}

export default withRouter(AccountChangePlan);

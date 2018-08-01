import gql from 'graphql-tag';
import React from 'react';
import {Link} from 'react-router-dom';
import uniqWith from 'lodash/uniqWith';
import {graphql} from 'react-apollo';

import getCurrency from '../../helpers/currency.helpers';
import HoodieApi from '../../services/hoodie.services';

import Dashboard from './account-dashboard.components';
import DisplayWithLabel from '../shared/display-with-label.components';
import FormSuccess from '../shared/form-success.components';
import Price from '../shared/price.components';
import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

export class AccountSubscription extends React.PureComponent {
	render() {
		const {
			loading,
			cards,
			credits,
			subscription,
			manager,
			acceptManager,
			removeManager,
			location,
		} = this.props;

		if (loading) {
			return (
				<Dashboard title="My account settings">
					<div className="account-dashboard-container-main">
						<div className="account-base account-subscription">
							<WaitForLoad loading />
						</div>
					</div>
				</Dashboard>
			);
		}

		const noCard = (
			<div>
				<h3 className="account-dashboard-container-small-title">
					You do not have a card right now.
				</h3>
				{subscription && !subscription.cancel_at_period_end ? (
					<p>
						<Link className="account-link" to="details/add-card">
							Add a card
						</Link>{' '}
						to set up your renewal automatically.
					</p>
				) : (
					<p>
						<Link className="account-link" to="details/add-card">
							Add a card
						</Link>{' '}
						before subscribing.
					</p>
				)}
			</div>
		);
		let currency;

		if (subscription) {
			currency = subscription.plan.currency.toUpperCase();
		}
		else if (cards.length > 0) {
			currency = getCurrency(cards[0].country);
		}

		const cardDetail
			= cards.length > 0 ? (
				<DisplayWithLabel label="Your card">
					{uniqWith(
						cards,
						(first, sec) => first.fingerprint === sec.fingerprint,
					).map(card => (
						// dedupe cards
						<div className="account-subscription-card" key={card.id}>
							<div className="account-subscription-card-number">
								**** **** **** {card.last4}
							</div>
							<div className="account-subscription-name">{card.name}</div>
							<div className="account-subscription-card-expiry">
								Expires on {String(card.exp_month).padStart(2, 0)}/{
									card.exp_year
								}
							</div>
						</div>
					))}
				</DisplayWithLabel>
			) : (
				noCard
			);

		const creditsDetails = (
			<div>
				<div className="display-credits">
					<DisplayWithLabel label="Your export credits">
						{credits}
					</DisplayWithLabel>
				</div>
			</div>
		);

		const query = new URLSearchParams(location.search);
		const successCard = query.has('newCard') && (
			<FormSuccess successText="You've successfully added a card" />
		);

		const noPlan = (
			<div>
				<h3 className="account-dashboard-container-small-title">
					You do not have a plan for the moment.
				</h3>
				<p>
					<img style={{width: '100%'}} src="assets/images/go-pro.gif" />
				</p>
				<p>
					Subscribe to our{' '}
					<Link className="account-link" to="subscribe">
						pro plan
					</Link>{' '}
					to benefit of the full power of Prototypo without restrictions to
					export and use your fonts everywhere!
				</p>
			</div>
		);

		const formatter = new Intl.DateTimeFormat('en-US');
		const trialEnd = formatter.format(
			new Date(subscription.current_period_end * 1000),
		);
		const currentPeriodEnd = formatter.format(
			new Date(subscription.current_period_end * 1000),
		);
		const {plan} = subscription || {};

		const content = plan ? (
			<div>
				<div className="account-subscription-plan">
					<DisplayWithLabel label="Your plan">
						{plan.name}
						{subscription.quantity > 1 && (
							<span> x{subscription.quantity}</span>
						)}
						{subscription.status === 'trialing' && (
							<span className="badge">trial until {trialEnd}</span>
						)}
						{subscription.status !== 'trialing'
							&& subscription.cancel_at_period_end && (
							<span className="badge danger">
									cancels on {currentPeriodEnd}
							</span>
						)}
					</DisplayWithLabel>
				</div>
				{subscription.cancel_at_period_end && (
					<p>
						Your subscription has been canceled and will automatically end on{' '}
						<strong>{currentPeriodEnd}</strong>.
					</p>
				)}
				{!subscription.cancel_at_period_end
					&& cards.length < 1 && (
					<p>
							Your subscription will be canceled on{' '}
						<strong>{currentPeriodEnd}</strong> because you don't have any
							card registered.
					</p>
				)}
				{!subscription.cancel_at_period_end
					&& cards.length > 1 && (
					<p>
							Your subscription will automatically renew on{' '}
						<strong>{currentPeriodEnd}</strong> and you will be charged{' '}
						<strong>
							<Price amount={plan.amount / 100} currency={currency} />
						</strong>.
					</p>
				)}
			</div>
		) : (
			<div>
				{manager
					&& manager.pending && (
					<p>
						<b>{manager.email}</b> wants to manage your subscription{' '}
						<Button size="small" onClick={acceptManager}>
								Accept
						</Button>{' '}
						<Button size="small" onClick={removeManager}>
								Decline
						</Button>
					</p>
				)}
				{manager
					&& !manager.pending && (
					<p>
							Your subscription is managed by <b>{manager.email}</b>{' '}
						<Button size="small" onClick={removeManager}>
								Revoke
						</Button>
					</p>
				)}
				{(!manager || (manager && manager.pending)) && noPlan}
			</div>
		);

		return (
			<Dashboard title="My account settings">
				<div className="account-dashboard-container-main">
					<div className="account-base account-subscription">
						{content}
						{!!credits && creditsDetails}
						{cardDetail}
						{successCard}
					</div>
				</div>
			</Dashboard>
		);
	}
}

const query = gql`
	query getManager {
		user {
			id
			subscription @client {
				id
				current_period_end
				cancel_at_period_end
				trial_end
				quantity
				plan {
					id
					name
					currency
				}
			}
			cards @client {
				id
				fingerprint
				last4
				exp_month
				exp_year
				country
			}
			credits @client
			manager {
				id
				email
			}
			pendingManager {
				id
				email
			}
		}
	}
`;

export default graphql(query, {
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		const {
			id,
			manager,
			pendingManager,
			subscription,
			cards,
			credits,
		} = data.user;
		const possibleManager = manager || pendingManager;

		return {
			cards,
			credits,
			subscription,
			manager: possibleManager && {
				email: possibleManager.email,
				pending: !manager && !!pendingManager,
			},
			acceptManager: async () => {
				await HoodieApi.acceptManager(id, pendingManager.id);
				return data.refetch();
			},
			removeManager: async () => {
				await HoodieApi.removeManager(id);
				return data.refetch();
			},
		};
	},
})(AccountSubscription);

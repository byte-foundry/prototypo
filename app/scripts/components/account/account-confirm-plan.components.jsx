import gql from 'graphql-tag';
import React from 'react';
import {Query} from 'react-apollo';
import {Redirect} from 'react-router-dom';

import WaitForLoad from '../wait-for-load.components';
import Dashboard from './account-dashboard.components';
import ConfirmPlanForm from './confirm-plan-form.components';

const GET_SUBSCRIPTION_AND_CARDS = gql`
	query getCards {
		user {
			id
			subscription @client {
				id
				plan {
					id
					currency
				}
			}
			cards @client {
				id
			}
		}
	}
`;

export default class AccountConfirmPlan extends React.Component {
	render() {
		const {history, location} = this.props;

		const query = new URLSearchParams(location.search);
		const plan = query.get('plan');
		const quantity = parseInt(query.get('quantity'), 10) || undefined;

		return (
			<Dashboard title="Change my plan">
				<div className="account-base account-confirm-plan">
					<h1 className="subscription-title">
						This is what you will be charged
					</h1>
					<Query query={GET_SUBSCRIPTION_AND_CARDS}>
						{({data, loading}) => {
							if (loading) {return <WaitForLoad loading={loading} />;}

							const {cards = [], subscription} = data.user;

							if (!subscription) {return <Redirect to="/account/subscribe" />;}

							if (cards.length <= 0) return <p>No card</p>;

							return (
								<ConfirmPlanForm
									newPlan={`${plan}_${subscription.plan.currency.toUpperCase()}_taxfree`}
									newQuantity={quantity}
									subscriptionId={subscription.plan.id}
									onUpdateSubscription={() => {
										window.Intercom(
											'trackEvent',
											'change-plan-confirm',
											{
												plan,
											},
										);

										history.push('/account/details');
									}}
								/>
							);
						}}
					</Query>
				</div>
			</Dashboard>
		);
	}
}

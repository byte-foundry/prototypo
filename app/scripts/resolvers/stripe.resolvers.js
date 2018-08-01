import gql from 'graphql-tag';

import {fetchAWS} from '../services/hoodie.services';

const resolverMap = {
	User: {
		// Load the subscription from a lambda and put it into the cache
		subscription: async (obj, args, {cache}) => {
			const query = gql`
				query getStripeId {
					user {
						stripe
					}
				}
			`;
			const {user: {stripe}} = cache.readQuery({query});

			// To think about: does Apollo merge null (from the server)
			// with {subscription:...} into null or into the second object?
			// if not, check first from obj that it's null

			const customer = await fetchAWS(`/customers/${stripe}`);
			const [subscription] = customer.subscriptions.data;

			if (!subscription) {
				return null;
			}

			// TODO: object property filter
			const data = {
				__typename: 'StripeSubscription',
				// ...subscription,
				id: subscription.id,
				quantity: subscription.quantity,
				current_period_end: subscription.current_period_end,
				cancel_at_period_end: subscription.cancel_at_period_end,
				trial_end: subscription.trial_end,
				plan: {
					__typename: 'StripePlan',
					// ...subscription.plan,
					id: subscription.plan.id,
					name: subscription.plan.name,
					currency: subscription.plan.currency,
				},
			};

			cache.writeData({data});

			return data;
		},
		cards: async (obj, args, {cache}) => {
			const query = gql`
				query getStripeId {
					user {
						stripe
					}
				}
			`;
			const {user: {stripe}} = cache.readQuery({query});

			const customer = await fetchAWS(`/customers/${stripe}`);
			const cards = customer.sources.data.filter(
				src => src.object === 'card',
			);

			const data = cards.map((src) => {
				const card = {
					__typename: 'StripeCard',
					...src,
				};

				// remove warning
				delete card.metadata;

				return card;
			});

			cache.writeData({
				data: {
					__typename: 'User',
					cards: data,
				},
			});

			return data;
		},
		credits: async (obj, args, {cache}) => {
			const query = gql`
				query getStripeId {
					user {
						stripe
					}
				}
			`;
			const {user: {stripe}} = cache.readQuery({query});

			const customer = await fetchAWS(`/customers/${stripe}`);
			const credits = parseInt(customer.metadata.credits, 10) || 0;

			cache.writeData({
				data: {
					__typename: 'User',
					credits,
				},
			});

			return credits;
		},
		invoices: async (obj, args, {cache}) => {
			const query = gql`
				query getStripeIdAndSubscriptionId {
					user {
						stripe
					}
				}
			`;
			const {user: {stripe}} = cache.readQuery({query});

			const invoices = await fetchAWS(`/customers/${stripe}/invoices`);

			const data = invoices.map(invoice => ({
				__typename: 'StripeQuadernoInvoice',
				id: invoice.id,
				created_at: invoice.created_at,
				currency: invoice.currency,
				permalink: invoice.permalink,
				number: invoice.number,
				secure_id: invoice.secure_id,
				total_cents: invoice.total_cents,
			}));

			// TODO: caching?
			return data;
		},
	},
};

export default resolverMap;

import gql from 'graphql-tag';

import {fetchAWS} from '../services/hoodie.services';

const resolverMap = {
	Mutation: {
		updateSubscription: async (_, {id, plan, quantity}, {cache}) => {
			const subscription = await fetchAWS(`/subscriptions/${id}`, {
				method: 'PUT',
				payload: {
					plan,
					quantity,
				},
			});

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

			// DEPRECATED
			HoodieApi.instance.plan = data.plan.id;

			// Analytics in a custom link?
			const transacId = `${plan}_${data.id}`;

			window.ga('ecommerce:addTransaction', {
				id: transacId,
				affiliation: 'Prototypo',
				revenue: data.plan.amount / 100,
				currency: data.plan.currency,
			});

			window.ga('ecommerce:addItem', {
				id: transacId,
				name: data.plan.id,
				sku: `${plan}_${data.plan.currency}_taxfree`,
				category: 'Subscriptions',
				price: data.plan.amount / 100,
			});

			window.ga('ecommerce:send');

			return data;
		},
	},
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
		hasBeenSubscribing: async (obj, args, {cache}) => {
			const query = gql`
				query getStripeId {
					user {
						stripe
					}
				}
			`;
			const {user: {stripe}} = cache.readQuery({query});

			const customer = await fetchAWS(`/customers/${stripe}`);
			const {hasBeenSubscribing = false} = customer.metadata;

			cache.writeData({data: hasBeenSubscribing});

			return hasBeenSubscribing;
		},
		upcomingInvoice: async (obj, {plan, quantity}, {cache}) => {
			const query = gql`
				query getStripeIdAndSubscriptionId {
					user {
						stripe
						subscription {
							id
						}
					}
				}
			`;
			const {user: {stripe, subscription}} = cache.readQuery({query});

			const search = new URLSearchParams({
				subscription_plan: plan,
				subscription_quantity: quantity,
				subscriptionId: subscription.id,
				customer: stripe,
			});

			const invoice = await fetchAWS(`/invoices/upcoming?${search}`);

			const data = {
				__typename: 'StripeUpcomingInvoice',
				...invoice,
				lines: invoice.lines.data.map(line => ({
					__typename: 'StripeUpcomingInvoiceLine',
					id: line.id,
					quantity: line.quantity,
					amount: line.amount,
					period: {
						__typename: 'StripePeriod',
						...line.period,
					},
					plan: {
						__typename: 'StripePlan',
						id: line.plan.id,
						description: line.plan.description,
					},
				})),
			};

			return data;
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

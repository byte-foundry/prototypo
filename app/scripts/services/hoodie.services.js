/* global trackJs, _ */
import gql from 'graphql-tag';

import apolloClient from './graphcool.services';
import isProduction from '../helpers/is-production.helpers';
import LocalClient from '../stores/local-client.stores';
import {loadStuff} from '../helpers/appSetup.helpers';

const AWS_URL = `https://${
	isProduction() ? 'e4jpj60rk8' : 'tc1b6vq6o8'
}.execute-api.eu-west-1.amazonaws.com/${isProduction() ? 'prod' : 'dev'}`;

export const TWITTER_REQUEST_TOKEN_URL = `${AWS_URL}/auth/twitter/requestToken`;

let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localClient = LocalClient.instance();
});

export async function fetchAWS(endpoint, params = {}) {
	const {headers = {}, payload, ...rest} = params;

	const response = await fetch(AWS_URL + endpoint, {
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: JSON.stringify(payload),
		...rest,
	});

	const data = await response.json();

	if (response.ok) {
		return data;
	}

	const error = new Error(data.message);

	error.type = data.type;

	return Promise.reject(error);
}

export default class HoodieApi {
	static async setup() {
		HoodieApi.instance = {};

		const response = await apolloClient.query({
			fetchPolicy: 'network-only',
			query: gql`
				query setup {
					user {
						id
						email
						stripe
						manager {
							id
						}
					}
				}
			`,
		});

		if (!response.data.user) {
			window.localStorage.removeItem('graphcoolToken');
			throw new Error('Not authenticated yet');
		}

		const data = response.data.user;

		trackJs.addMetadata('username', data.email);

		HoodieApi.instance.plan = 'free_none';

		if (data.manager) {
			HoodieApi.instance.plan = 'managed';
		}

		if (window.Intercom) {
			window.Intercom('boot', {
				app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
				email: data.email,
				widget: {
					activator: '#intercom-button',
				},
			});
		}

		window.ga('set', 'userId', data.email);

		if (data.stripe) {
			HoodieApi.instance.customerId = data.stripe;

			try {
				const customer = await HoodieApi.getCustomerInfo();
				const [subscription] = customer.subscriptions.data;

				if (subscription) {
					HoodieApi.instance.subscriptionId = subscription.id;
					HoodieApi.instance.plan = subscription.plan.id;
				}
			}
			catch (e) {
				/* don't need to catch anything, just next step */
			}
		}

		await loadStuff();
	}

	static async logout() {
		window.localStorage.removeItem('graphcoolToken');
		apolloClient.resetStore();
	}

	static async askPasswordReset(email) {
		return fetchAWS(`/users/${email}/reset_password`, {
			method: 'PUT',
		});
	}

	static checkResetToken(id, resetToken) {
		return fetchAWS(`/users/${id}/reset_password?resetToken=${resetToken}`);
	}

	static resetPassword(email, resetToken, password) {
		return fetchAWS(`/users/${email}/password`, {
			method: 'PUT',
			payload: {
				resetToken,
				password,
			},
		});
	}

	static updateCustomer(options) {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}`, {
			method: 'PUT',
			payload: options,
		});
	}

	static validateCoupon({coupon, plan}) {
		return fetchAWS(`/coupons/${coupon}?plan=${plan}`);
	}

	static updateSubscription(options) {
		const {subscriptionId} = HoodieApi.instance;

		if (!subscriptionId) {
			const customer = HoodieApi.instance.customerId;

			return fetchAWS('/subscriptions', {
				method: 'POST',
				payload: {customer, ...options},
			});
		}

		return fetchAWS(`/subscriptions/${subscriptionId}`, {
			method: 'PUT',
			payload: options,
		});
	}

	static getCustomerInfo() {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}`);
	}

	static getUpcomingInvoice(options) {
		const query = new URLSearchParams({
			...options,
			subscriptionId: HoodieApi.instance.subscriptionId,
			customer: HoodieApi.instance.customerId,
		});

		return fetchAWS(`/invoices/upcoming?${query}`);
	}

	static spendCredits(options) {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}/credits`, {
			method: 'DELETE',
			payload: options,
		});
	}

	static getInvoiceList() {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}/invoices`);
	}

	static addManagedUser(userId, infos) {
		return fetchAWS(`/users/${userId}/children`, {
			method: 'POST',
			payload: infos,
		});
	}

	// TODO: replace this with permissions rules on graph.cool
	static removeManagedUser(userId, id) {
		return fetchAWS(`/users/${userId}/children/${id}`, {
			method: 'DELETE',
		});
	}

	// TODO: replace this lambda with permissions rules on graph.cool
	static acceptManager(userId, managerId) {
		return fetchAWS(`/users/${userId}/manager/${managerId}`, {
			method: 'PUT',
		});
	}

	// Can be used to remove the manager or decline invite
	// since it's not possible to have invite if we are already managed
	// TODO: replace this lambda with permissions rules on graph.cool
	static removeManager(userId) {
		return fetchAWS(`/users/${userId}/manager`, {
			method: 'DELETE',
		});
	}
}

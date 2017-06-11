import PouchDB from 'pouchdb';
import HoodiePouch from 'pouchdb-hoodie-api';
import queryString from 'query-string';
import {gql} from 'react-apollo';

import apolloClient from './graphcool.services';
import isProduction from '../helpers/is-production.helpers';
import LocalClient from '../stores/local-client.stores.jsx';

import Log from './log.services.js';

PouchDB.plugin(HoodiePouch);

const BACK_URL = isProduction() ? 'https://db.prototypo.io' : 'https://devdb.prototypo.io';
const AWS_URL = `https://${isProduction() ? 'e4jpj60rk8' : 'tc1b6vq6o8'}.execute-api.eu-west-1.amazonaws.com/${isProduction() ? 'prod' : 'dev'}`;

const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

if (bearer) {
	window.location.search = '';
	localStorage.bearerToken = bearer;
}

const hoodie = new window.Hoodie(BACK_URL);

let localClient;
let graphCoolUserId; // this is used temporarily to link graphcool <-> stripe

window.addEventListener('fluxServer.setup', async () => {
	localClient = LocalClient.instance();
});

async function fetchAWS(endpoint, params = {}) {
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

const signUpAndLoginMutation = gql`
	mutation signUpAndLogin(
		$email: String!,
		$password: String!,
		$firstName: String!,
		$lastName: String,
		$occupation: String,
		$phone: String,
		$skype: String,
	) {
		createUser(
			authProvider: {email: {email: $email, password: $password}},
			firstName: $firstName,
			lastName: $lastName,
			occupation: $occupation,
			phone: $phone,
			skype: $skype,
		) {
			id
			email
		}

		signinUser(email: {email: $email, password: $password}) {
			token
		}
	}
`;

export default class HoodieApi {

	static setup() {
		HoodieApi.instance = hoodie;
		return hoodie.account.fetch()
				.then(setupHoodie)
				.then(setupStripe);
	}

	static async login(user, password) {
		const data = await hoodie.account.signIn(user, password);

		// If the graph.cool account creation fails, it's ok for now
		try {
			const response = await apolloClient.mutate({
				mutation: gql`
					mutation login($email: String!, $password: String!) {
						signinUser(email: {email: $email, password: $password}) {
							token
						}
					}
				`,
				variables: {
					email: user,
					password,
				},
			});

			window.localStorage.setItem('graphcoolToken', response.data.signinUser.token);
		}
		catch (e) {
			if (e.graphQLErrors.map(e => e.code).includes(3022)) {
				try {
					const response = await apolloClient.mutate({
						mutation: signUpAndLoginMutation,
						variables: {
							email: user,
							password,
							firstName: 'there',
						},
					});

					window.localStorage.setItem('graphcoolToken', response.data.signinUser.token);
					graphCoolUserId = response.data.createUser.id;
				}
				catch (err) { trackJs.track(err); }
			} else {
				trackJs.track(e);
			}
		}

		return setupStripe(setupHoodie(data));
	}

	static async logout() {
		const data = await hoodie.account.signOut();

		window.localStorage.removeItem('graphcoolToken');

		// TMP until we kick out Hoodie
		localStorage.clear();

		return data;
	}

	static async signUp(email, password, firstName, {lastName, occupation, phone, skype}) {
		const data = await hoodie.account.signUp(email, password);

		// If the graph.cool account creation fails, it's ok for now
		try {
			const response = await apolloClient.mutate({
				mutation: signUpAndLoginMutation,
				variables: {
					email,
					password,
					firstName,
					lastName: lastName || undefined,
					occupation: occupation || undefined,
					phone: phone || undefined,
					skype: skype || undefined,
				},
			});

			window.localStorage.setItem('graphcoolToken', response.data.signinUser.token);
			graphCoolUserId = response.data.createUser.id;
		}
		catch (e) { trackJs.track(e); }

		return data;
	}

	static isLoggedIn() {
		return window.localStorage.getItem('graphcoolToken') && hoodie.account.hasValidSession();
	}

	static async askPasswordReset(email) {
		return fetchAWS(`/users/${email}/reset_password`, {
			method: 'PUT',
		});
	}

	static changePassword(password, newPassword) {
		return hoodie.account.changePassword(password, newPassword);
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

	static createCustomer(options) {
		return fetchAWS('/customers', {
			method: 'POST',
			payload: options,
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

			return fetchAWS(`/subscriptions`, {
				method: 'POST',
				payload: {customer, ...options},
			});
		}

		return fetchAWS(`/subscriptions/${subscriptionId}`, {
			method: 'PUT',
			payload: options,
		});
	}

	static getCustomerInfo(options) {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}`, {
			payload: options,
		});
	}

	static getUpcomingInvoice(options) {
		const query = queryString.stringify({
			...options,
			subscriptionId: HoodieApi.instance.subscriptionId,
			customer: HoodieApi.instance.customerId,
		});

		return fetchAWS(`/invoices/upcoming?${query}`);
	}

	static buyCredits(options) {
		const customerId = HoodieApi.instance.customerId;

		return fetchAWS(`/customers/${customerId}/credits`, {
			method: 'PUT',
			payload: options,
		});
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

	// temporary way of registering stripe id into graphcool
	// this should be removed as soon as we get out of Hoodie
	static async addStripeIdToGraphCool(id) {
		if (graphCoolUserId) {
			try {
				await apolloClient.mutate({
					mutation: gql`
						mutation addStripeId($id: ID!, $stripeId: String!) {
							updateUser(id: $id, stripe: $stripeId) {
								id
								stripe
							}
						}
					`,
					variables: {
						id: graphCoolUserId,
						stripeId: id,
					},
				});

				graphCoolUserId = null;
			}
			catch (e) { trackJs.track(e); }
		}
	}
}

function setupHoodie(data) {
	const response = data.response ? data.response : data;
	const id = response.roles[0];
	const hoodieConfig = JSON.parse(localStorage._hoodie_config);
	const db = PouchDB(`${BACK_URL}/_api/user%2F${id}`, {
		ajax: {
			headers: {
				'Authorization': `Bearer ${hoodieConfig['_account.bearerToken']}`,
			},
			withCredentials: true,
		},
	});

	HoodieApi.instance.pouch = db.hoodieApi();
	HoodieApi.instance.hoodieId = id;
	HoodieApi.instance.email = response.name.split('/')[1];
	HoodieApi.instance.plan = 'free_none';

	if (window.Intercom) {
		window.Intercom('boot', {
			app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
			email: HoodieApi.instance.email,
			widget: {
				activator: '#intercom-button',
			},
		});
	}

	Log.setUserId(HoodieApi.instance.email);

	if (HoodieApi.eventSub) {
		_.each(HoodieApi.eventSub.connected, (cb) => {
			cb();
		});
	}

	return data;
}

async function setupStripe(data, time = 1000) {
	if (data.stripe) {
		HoodieApi.instance.customerId = data.stripe.customerId;

		HoodieApi.addStripeIdToGraphCool(data.stripe.customerId);

		try {
			const customer = await HoodieApi.getCustomerInfo();
			const [subscription] = customer.subscriptions.data;

			if (subscription) {
				HoodieApi.instance.subscriptionId = subscription.id;
				HoodieApi.instance.plan = subscription.plan.id;
			}

			localClient.dispatchAction('/load-customer-data', customer);

			return;
		}
		catch (e) { /* don't need to catch anything, just next step */ }
	}

	// if error we poll customerId
	setTimeout(async () => {
		const newData = await HoodieApi.instance.account.fetch();

		setupStripe(newData, 2 * time || 1000);
	}, time);
}

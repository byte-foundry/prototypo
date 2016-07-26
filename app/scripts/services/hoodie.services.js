import PouchDB from 'pouchdb';
import HoodiePouch from 'pouchdb-hoodie-api';

import HOODIE from '../helpers/hoodie.helpers.js';
import LocalClient from '../stores/local-client.stores.jsx';

import Log from './log.services.js';

PouchDB.plugin(HoodiePouch);

const backUrl = process.env.TRAVIS_BRANCH === 'master' || process.env.TRAVIS_BRANCH === 'release'
	? 'https://prototypo.appback.com'
	: 'https://prototypo-dev.appback.com';

const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

if (bearer) {
	window.location.search = '';
	localStorage.bearerToken = bearer;
}

const hoodie = new window.Hoodie(backUrl);

let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localClient = LocalClient.instance();
});

export default class HoodieApi {

	static setup() {
		HoodieApi.instance = hoodie;
		return hoodie.account.fetch().then(setupHoodie);
	}

	static login(user, password) {
		return hoodie.account.signIn(user, password)
			.then(setupHoodie);
	}

	static logout() {
		return hoodie.account.signOut()
		.then((data) => {
			localStorage.clear();
			return data;
		});
	}

	static signUp(username, password) {
		return hoodie.account.signUp(username, password);
	}

	static isLoggedIn() {
		return hoodie.account.hasValidSession();
	}

	static askPasswordReset(username) {
		return hoodie.stripe.usernames.exist(username)
			.then(function(response) {
				if (!response) {
					throw new Error('No such username, cannot reset password.');
				}

				const resetId = `${username}/${HOODIE.generateId()}`;
				const key = `org.couchdb.user:$passwordReset/${resetId}`;

				return fetch(`${backUrl}/_api/_users/${encodeURIComponent(key)}`, {
					method: 'put',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						_id: key,
						name: `$passwordReset/${resetId}`,
						type: 'user',
						roles: [],
						password: resetId,
						updatedAt: new Date(),
						createdAt: new Date(),
					}),
				});
			});
		//TODO(franz): Thou shall code the checkPasswordReset at a later point in time
	}

	static changePassword(password, newPassword) {
		return hoodie.account.changePassword(password, newPassword);
	}

	static createCustomer(options) {
		return hoodie.stripe.customers.create(options);
	}

	static updateCustomer(options) {
		return hoodie.stripe.customers.update(options);
	}

	static updateSubscription(options) {
		return hoodie.stripe.customers.updateSubscription(options);
	}

	static getCustomerInfo(options) {
		return hoodie.stripe.customers.retrieve(options);
	}

	static getInvoice(options) {
		return hoodie.stripe.invoices.retrieveUpcoming(options);
	}

	static buyCredits(options) {
		return hoodie.stripe.credits.buy(options);
	}

	static spendCredits(options) {
		return hoodie.stripe.credits.spend(options);
	}
}

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}
	else {
		const error = new Error(response.statusText);

		error.response = response;
		throw error;
	}
}

function checkUser(response) {
	if (response.userCtx && response.userCtx.name) {
		return response.userCtx;
	}
	else {
		const error = new Error('anonymous user');

		error.response = response;
		throw error;
	}
}

function parseJson(response) {
	return response.json();
}

function parseText(response) {
	return response.text();
}

function storeBearer(response) {
	if (response.bearerToken) {
		localStorage.bearerToken = response.bearerToken;
	}
	return response;
}

function getPlan(roles) {
	const _roles = roles.join(',');

	return _roles.indexOf('stripe:plan:') !== -1
			&& _roles.replace(/^.*stripe:plan:(.+?)(,.*)?$/, '$1');
}

function setupHoodie(data) {
	const response = data.response ? data.response : data;
	const id = response.roles[0];
	const hoodieConfig = JSON.parse(localStorage._hoodie_config);
	const db = PouchDB(`${backUrl}/_api/user%2F${id}`, {
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
	HoodieApi.instance.plan = getPlan(response.roles);

	if (hoodie.stripe) {
		hoodie.stripe.customers.retrieve({includeCharges: true})
			.then((customer) => {
				localClient.dispatchAction('/load-customer-data', customer);
				window.Intercom('boot', {
					app_id: 'mnph1bst',
					email: HoodieApi.instance.email,
					widget: {
						activator: '#intercom-button',
					},
				});
			})
			.catch((err) => {
			});
	}

	Log.setUserId(HoodieApi.instance.email);

	if (HoodieApi.eventSub) {
		_.each(HoodieApi.eventSub.connected, (cb) => {
			cb();
		});
	}
}

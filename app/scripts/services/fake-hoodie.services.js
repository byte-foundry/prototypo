import PouchDB from 'pouchdb';
import HoodiePouch from 'pouchdb-hoodie-api';

import LocalClient from '../stores/local-client.stores.jsx';

PouchDB.plugin(HoodiePouch);

const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

if (bearer) {
	window.location.search = '';
	localStorage.bearerToken = bearer;
}

let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localClient = LocalClient.instance();
});

export default class HoodieApi {

	static setup() {
		HoodieApi.instance = {
			pouch: false,
			hoodieId: false,
			email: '',
			plan: '',
			store: {
				find(a, b) {
					return HoodieApi.instance.pouch.find(`${a}/${b}`);
				},
				updateOrAdd(a, b, c) {
					return HoodieApi.instance.pouch.updateOrAdd(`${a}/${b}`, c)
						.catch((err) => {
							if (err.name !== 'conflict') {
								console.log(err);
							}
						});
				},
				remove(a, b) {
					return HoodieApi.instance.pouch.remove(`${a}/${b}`);
				},
				removeAll() {
					return HoodieApi.instance.pouch.removeAll();
				},
			},
		};
		return new Promise((resolve) => {
			setupHoodie();
			resolve();
		});
	}

	static login(user, password) {
		return;
	}

	static logout() {
		return;
	}

	static signUp(username, password) {
		return;
	}

	static isLoggedIn() {
		return true;
	}

	static askPasswordReset(username) {
		return;
		//TODO(franz): Thou shall code the checkPasswordReset at a later point in time
	}

	static changePassword(password, newPassword) {
		return;
	}

	static createCustomer(options) {
		return;
	}

	static updateCustomer(options) {
		return;
	}

	static validateCoupon() {
		return;
	}

	static updateSubscription(options) {
		return;
	}

	static getCustomerInfo(options) {
		return;
	}

	static getInvoice(options) {
		return;
	}

	static buyCredits(options) {
		return;
	}

	static spendCredits(options) {
		return;
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

function setupHoodie(data) {
	const hoodieConfig = JSON.parse(localStorage._hoodie_config);
	const db = new PouchDB('prototypo-offline');

	HoodieApi.instance.pouch = db.hoodieApi();

	localClient.dispatchAction('/load-customer-data', {
		account_balance: 0,
		authorization: '',
		charges: {
			data: [],
			has_more: false,
			object: 'list',
			url: '',
		},
		created: 0,
		credits: 0,
		currency: 'usd',
		default_source: null,
		delinquent: false,
		description: '',
		discount: null,
		email: '',
		id: '',
		livemode: false,
		metadata: {hoodieId: ''},
		object: '',
		plan: '',
		shipping: null,
		sources: {
			data: [],
			has_more: false,
			object: 'list',
			total_count: 0,
			url: '',
		},
		subscriptions: {
			data: [],
			has_more: false,
			object: 'list',
			total_count: 0,
			url: '',
		},
	});

	if (HoodieApi.eventSub) {
		_.each(HoodieApi.eventSub.connected, (cb) => {
			cb();
		});
	}
}

import PouchDB from 'pouchdb';
import HoodiePouch from 'pouchdb-hoodie-api';

import HOODIE from '../helpers/hoodie.helpers.js';

import Log from './log.services.js';

PouchDB.plugin(HoodiePouch);

const backUrl = process.env.TRAVIS_BRANCH === 'master'
	? 'https://prototypo.appback.com'
	: 'https://prototypo-dev.appback.com';

const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

if (bearer) {
	window.location.search = '';
	localStorage.bearerToken = bearer;
}

const hoodie = new window.Hoodie(backUrl);

window.hoodiecli = function() {
	return hoodie.connectionStatus.ok;
};

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
		return hoodie.account.signOut();
	}

	static signUp(username, password) {
		return hoodie.account.signUp(username, password);
	}

	static isLoggedIn() {
		return hoodie.account.hasValidSession();
	}

	static askPasswordReset(username) {
		hoodie.stripe.usernames.exist(username)
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

	static changePassword(password) {
		const db = `org.couchdb.user:user/${HoodieApi.instance.email}`;

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('GET', `${backUrl}/_users/${encodeURIComponent(db)}`);
			xhr.withCredentials = true;

			xhr.onload = (e) => {
				resolve(e);
			};

			xhr.onerror = () => {
				reject();
			};

			xhr.send();
		})
		.then((e) => {
			const user = JSON.parse(e.target.responseText);

			user.salt = undefined;
			user.updatedAt = new Date();
			user.password = password;

			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();

				xhr.open('PUT', `${backUrl}/_users/${encodeURIComponent(db)}`);
				xhr.withCredentials = true;

				xhr.onload = (evt) => {
					resolve(evt);
				};

				xhr.onerror = () => {
					reject();
				};

				xhr.send(JSON.stringify(user));
			});
		});
	}

	static createCustomer(options) {
		return hoodie.stripe.customers.create(options);
	}

	static updateCustomer(options) {
		return hoodie.stripe.customers.update(options);
	}

	static getCustomerInfo() {
		return hoodie.stripe.customers.retrieve();
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

	HoodieApi.instance.hoodieId = id;
	HoodieApi.instance.email = response.name.split('/')[1];
	HoodieApi.instance.plan = getPlan(response.roles);

	Log.setUserId(HoodieApi.instance.email);

	if (HoodieApi.eventSub) {
		_.each(HoodieApi.eventSub.connected, (cb) => {
			cb();
		});
	}
}

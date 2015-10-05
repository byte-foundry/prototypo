import nothing from 'whatwg-fetch';
import PouchDB from 'pouchdb';
import HOODIE from '../helpers/hoodie.helpers.js';
import HoodiePouch from 'pouchdb-hoodie-api';
PouchDB.plugin(HoodiePouch);

// const backUrl = 'http://localhost:6080';
const backUrl = 'http://localhost:6022/_api';
// const backUrl = 'https://prototypo.appback.com/_api';
const jsonHeaders = {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
};

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		var error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
}

function checkUser(response) {
	if (response.userCtx && response.userCtx.name) {
		return response.userCtx;
	} else {
		var error = new Error('anonymous user');
		error.response = response;
		throw error;
	}
}

function parseJson(response) {
	return response.json();
}

function storeBearer(response) {
	if ( response.bearerToken) {
		localStorage.bearerToken = response.bearerToken;
	}
	return response;
}

function getPlan( roles ) {
	var _roles = roles.join(',');

	return _roles.indexOf('stripe:plan:') !== -1 &&
			_roles.replace(/^.*stripe:plan:(.+?)(,.*)?$/, '$1');
}

function setupHoodie(response) {
	const id = response.roles[0];
	const db = PouchDB(`${backUrl}/user%2F${id}`, {
		ajax: {
			headers: {
				'Authorization': `Bearer ${localStorage.bearerToken}`
			}
		}
	});

	HoodieApi.instance = db.hoodieApi();
	HoodieApi.instance.hoodieId = id;
	HoodieApi.instance.email = response.name.split('/')[1];
	HoodieApi.instance.plan = getPlan( response.roles );

	if (HoodieApi.eventSub) {
		_.each(HoodieApi.eventSub.connected, (cb) => {
			cb();
		});
	}
}

export default class HoodieApi {

	static setup() {
		return fetch(`${backUrl}/_session`, {
				method: 'get',
				headers: {
					'Authorization': `Bearer ${localStorage.bearerToken}`,
					'Accept': 'application/json'
				},
				credentials: 'include'
			})
			.then(checkStatus)
			.then(parseJson)
			.then(checkUser)
			.then(setupHoodie);
	}

	static login(user, password) {
		return fetch(`${backUrl}/_session`, {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					name: user,
					password: password
				})
			})
			.then(checkStatus)
			.then(parseJson)
			.then(storeBearer)
			.then(setupHoodie);
	}

	static logout() {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('DELETE', `${backUrl}/_session`);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.withCredentials = true;

			xhr.onload = (e) => {
				delete localStorage.bearerToken;
				resolve();
			};

			xhr.onerror = (e) => {
				reject();
			};

			xhr.send();

		});
	}

	static register(username, password) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			const hoodieId = Math.random().toString().substr(2);

			const payload = {
				_id: `org.couchdb.user:user/${username}`,
				name: `user/${username}`,
				type: 'user',
				roles: [],
				password: password,
				hoodieId,
				database: `user/${hoodieId}`,
				updatedAt: new Date(),
				createdAt: new Date(),
				signedUpAt: new Date(),
			}

			xhr.open('PUT', `${backUrl}/_users/${encodeURIComponent(payload._id)}`);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.withCredentials = true;

			xhr.onload = (e) => {
				if (e.target.status !== 201) {
					reject(JSON.parse(e.target.responseText));
					return;
				}

				resolve(e.responseText);
			};

			xhr.reject = (e) => {
				reject();
			};

			xhr.send(JSON.stringify(payload));
		});
	}

	static askPasswordReset(username) {
		return new Promise((resolve, reject) => {

			const resetId = `${username}/${HOODIE.generateId()}`;

			const key = `org.couchdb.user:$passwordReset/${resetId}`;
			const xhr = new XMLHttpRequest();
			const payload = {
				_id: key,
				name: `$passwordReset/${resetId}`,
				type: 'user',
				roles: [],
				password: resetId,
				updatedAt: new Date(),
				createdAt: new Date(),
			};

			xhr.open('PUT', `${backUrl}/_users/${encodeURIComponent(key)}`);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.withCredentials = true;

			xhr.onload = (e) => {
				resolve();
			};

			xhr.onerror = (e) => {
				reject();
			};

			xhr.send(JSON.stringify(payload));

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

			xhr.onerror = (e) => {
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

				xhr.onload = (e) => {
					resolve(e);
				};

				xhr.onerror = (e) => {
					reject();
				};

				xhr.send(JSON.stringify(user));
			});
		});
	}

	static stripeCreateCustomer( args, callback ) {
		return fetch(`${backUrl}/_plugins/stripe/_api`, {
				method: 'post',
				headers: {
					'Authorization': `Bearer ${localStorage.bearerToken}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: localStorage.bearerToken ? 'omit' : 'include',
				body: JSON.stringify({
					method: 'customers.create',
					args: [ args ]
				})
			})
			.then(checkStatus)
			.then(parseJson)
			.then(function() {
				console.log(arguments);
			}).catch(function() {
				console.error(arguments);
			});
	}

	static startTask(type, subType, params = {}) {
		params.subType = subType;
		params.id = `$${type}/${type}`;
		params.type = `$${type}`;
		return HoodieApi.instance.add(params);
	}

	static on(event, callback) {
		if (!HoodieApi.eventSub) {
			HoodieApi.eventSub = {};
		}

		if (!HoodieApi.eventSub[event]) {
			HoodieApi.eventSub[event] = [];
		}

		HoodieApi.eventSub[event].push(callback);
	}
}

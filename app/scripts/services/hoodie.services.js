import PouchDB from 'pouchdb';
import HoodiePouch from 'pouchdb-hoodie-api';
PouchDB.plugin(HoodiePouch);

export default class HoodieApi {

	static setup() {
		return new Promise((resolve, reject) => {

			const xhr = new XMLHttpRequest();

			xhr.open('GET', 'https://prototypo.appback.com/_api/_session');

			xhr.onload = (e) => {
				const respJSON = JSON.parse(e.responseText);
				const id = respJSON.roles[0];
				const db = PouchDB(`https://prototypo.appback.com/_api/${id}`);
				HoodieApi.instance = db.hoodieApi();
				resolve();
				console.log('We in');
			}

			xhr.onerror = (e) => {
				reject();
				console.log('We not in');
			}

			xhr.send();

		});
	}

	static login(user,password) {
		return new Promise((resolve, reject) => {

			const xhr = new XMLHttpRequest();

			xhr.open('POST', 'https://prototypo.appback.com/_api/_session');
			xhr.setRequestHeader('Content-type','application/json');

			xhr.onload = (e) => {
				const respJSON = JSON.parse(e.responseText);
				const id = respJSON.roles[0];
				const db = PouchDB(`https://prototypo.appback.com/_api/${id}`);
				HoodieApi.instance = db.hoodieApi();
				console.log('We in');
			}

			xhr.onerror = (e) => {
				reject();
				console.log('We not in');
			}

			xhr.send(`{"name":"${user}","password":"${password}"}`);

		});
	}
}


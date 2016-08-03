import {prototypoStore} from '../stores/creation.stores.jsx';
/* #if offline */
import HoodieApi from '../services/fake-hoodie.services.js';
/* #end*/
/* #if prod,debug */
import HoodieApi from '../services/hoodie.services.js';
/* #end*/
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {setupFontInstance} from '../helpers/font.helpers.js';
import pleaseWait from 'please-wait';
import {loadStuff} from '../helpers/appSetup.helpers.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
	localClient = LocalClient.instance();
});

const debugServerUrl = 'http://localhost:9002';

export const debugActions = {
	'/save-debug-log': () => {
		const debugLog = {
			events: prototypoStore.get('debugEvents'),
			message: `voluntarily submitted by ${HoodieApi.instance.email}`,
			stack: (new Error()).stack,
			date: new Date(),
			values: prototypoStore.get('debugValues'),
		};

		const data = JSON.stringify(debugLog);

		fetch(`${debugServerUrl}/errors/`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		});
	},
	'/store-in-debug-font': ({prefix, typeface, data}) => {
		const values = prototypoStore.get('debugValues');

		if (!values[prefix]) {
			values[prefix] = {};
		}
		values[prefix][typeface] = data;
		prototypoStore.set('values', values).commit();
	},
	'/show-details': (details) => {
		const patch = prototypoStore.set('debugDetails', details).set('debugShowDetails', true).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'close-details': () => {
		const patch = prototypoStore.set('debugDetails', '').set('debugShowDetails', false).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};

export default class EventDebugger {
	storeEvent(path, params) {
		if (path.indexOf('debug') === -1
			&& location.hash.indexOf('#/replay') === -1) {

			if (path === '/login') {
				prototypoStore.set('debugEvents', []);
			}
			else {
				const events = prototypoStore.get('debugEvents');

				events.push({path, params});
				prototypoStore.set('debugEvents', events).commit();
			}
		}
	}

	async execEvent(events, i, to) {
		if (i < events.length) {
			const patch = prototypoStore.set('debugIndex', i).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			console.log(`replaying event at path ${events[i].path}`);
			console.log(events[i].params);

			if (events[i].path !== '/login') {
				localClient.dispatchAction(events[i].path, events[i].params);
			}

			return await new Promise((resolve) => {
				setTimeout(() => {
					resolve(this.execEvent(events, i + 1, to));
				}, 200);
			});
		}
		else {
			return;
		}
	}

	replayEvents(values, events) {
		const patch = prototypoStore
			.set('debugEvents', events)
			.set('debugValues', values)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		this.execEvent(events, 0);
	}

	async replayEventFromFile() {
		const hash = location.hash.split('?')[0].split('/');

		try {
			const result = await fetch(`${debugServerUrl}/events-logs/${hash[hash.length - 1]}.json`);
			const data = await result.json();
			let eventsToPlay = data.events;
			const values = data.values;

			for (let i = 0; i < eventsToPlay.length; i++) {
				if (eventsToPlay[i].path === '/login') {
					eventsToPlay = eventsToPlay.slice(i + 1);
				}
			}

			await this.replayEvents(values, eventsToPlay);
		}
		catch (err) {
			await loadStuff();
		}
	}
}

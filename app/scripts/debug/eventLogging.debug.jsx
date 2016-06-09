import {prototypoStore} from '../stores/creation.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
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

const debugServerUrl = 'http://debugloglist-p7rs57pe.cloudapp.net';

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
			if (i === 1) {
				const familySelected = prototypoStore.get('family');
				const text = prototypoStore.get('uiText');
				const word = prototypoStore.get('uiWord');
				const selected = prototypoStore.get('glyphSelected');

				await setupFontInstance({
					values: {
						familySelected,
						text,
						word,
						selected,
					},
				});
			}

			if (to && (i === to)) {
				console.log('WAITING FOR RENDER PLZ!!');
				pleaseWait.instance.finish();
				return;
			}

			console.log(`replaying event at path ${events[i].path}`);
			console.log(events[i].params);

			if (events[i].path !== '/login') {
				localClient.dispatchAction(events[i].path, events[i].params);
			}

			return await new Promise((resolve) => {
				setTimeout(() => {
					resolve(this.execEvent(events, i + 1, to));
				}, 1000);
			});
		}
		else {
			return;
		}
	}

	async replayEvents(values, events) {
		const patch = prototypoStore
			.set('debugEvents', events)
			.set('debugValues', values)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		await this.execEvent(events, 0, 6);
		setTimeout(() => {
			this.execEvent(events, 6);
		}, 6000);
	}

	async replayEventFromFile() {
		const hash = location.hash.split('/');

		try {
			const result = await fetch(`${debugServerUrl}/events-logs/${hash[hash.length - 1]}.json`);
			const data = await result.json();
			let eventsToPlay = data.events;
			const values = data.values;

			for (let i = 0; i < eventsToPlay.length; i++) {
				if (eventsToPlay[i].path === '/login') {
					eventsToPlay = eventsToPlay.slice(i+1);
				}
			}

			await this.replayEvents(values, eventsToPlay);
		}
		catch (err) {
			await loadStuff();
		}
	}
}

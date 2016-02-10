import {debugStore, fontVariant, panel, glyphs} from '../stores/creation.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {setupFontInstance} from '../helpers/font.helpers.js';
import pleaseWait from 'please-wait';

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
			events: debugStore.get('events'),
			message: `voluntarily submitted by ${HoodieApi.instance.email}`,
			stack: (new Error()).stack,
			date: new Date(),
			values: debugStore.get('values'),
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
		const values = debugStore.get('values');

		if (!values[prefix]) {
			values[prefix] = {};
		}
		values[prefix][typeface] = data;
		debugStore.set('values', values).commit();
	},
};

export default class EventDebugger {
	storeEvent(path, params) {
		if (path.indexOf('debug') === -1
			&& location.hash.indexOf('#/replay') === -1) {

			if (path === '/login') {
				debugStore.set('events', []);
			}
			else {
				const events = debugStore.get('events');

				events.push({path, params});
				debugStore.set('events', events).commit();
			}
		}
	}

	async execEvent(events, i, to) {
		if (i < events.length) {
			if (i === 1) {
				const familySelected = fontVariant.get('family');
				const text = panel.get('text');
				const word = panel.get('word');
				const selected = glyphs.get('selected');

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
		debugStore.set('values', values).commit();

		await this.execEvent(events, 0, 6);
		setTimeout(() => {
			this.execEvent(events, 6);
		}, 1500);
	}

	async replayEventFromFile() {
		const hash = location.hash.split('/');
		const result = await fetch(`${debugServerUrl}/events-logs/${hash[hash.length - 1]}.json`);
		const data = await result.json();
		const eventsToPlay = data.events;
		const values = data.values;

		await this.replayEvents(values, eventsToPlay);
	}
}

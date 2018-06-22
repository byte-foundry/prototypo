import Remutable from 'remutable';

const {Patch} = Remutable;

import {prototypoStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
	localClient = LocalClient.instance();
});

export default {
	'/go-back': ({eventIndex}) => {
		const event = prototypoStore.get('undoEventList')[eventIndex];

		if (eventIndex >= 0) {
			const revert = Patch.revert(Patch.fromJSON(event.patch));
			const patch = prototypoStore.set('undoAt', eventIndex - 1).commit();

			undoableStore.apply(revert);
			localServer.dispatchUpdate('/prototypoStore', patch);
			localServer.dispatchUpdate('/undoableStore', revert);
		}
	},
	'/go-forward': ({eventIndex}) => {
		if (eventIndex !== undefined) {
			const event = prototypoStore.get('undoEventList')[eventIndex + 1];

			if (event) {
				const patch = prototypoStore.set('undoAt', eventIndex + 1).commit();

				undoableStore.apply(Patch.fromJSON(event.patch));
				localServer.dispatchUpdate('/prototypoStore', patch);
				localServer.dispatchUpdate(
					'/undoableStore',
					Patch.fromJSON(event.patch),
				);
			}
		}
	},
	'/store-action': ({store, patch, label}) => {
		const newEventList = Array.from(prototypoStore.get('undoEventList'));
		const eventIndex = prototypoStore.get('undoAt');

		if (newEventList.length - 1 > eventIndex) {
			newEventList.splice(eventIndex + 1, newEventList.length);
		}

		newEventList.push({
			patch: (patch.toJSON && patch.toJSON()) || patch,
			store,
			label,
		});
		const eventPatch = prototypoStore
			.set('undoEventList', newEventList)
			.set('undoAt', newEventList.length - 1)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', eventPatch);
	},
	'/clear-undo-stack': () => {
		const patch = prototypoStore
			.set('undoEventList', [])
			.set('undoAt', -1)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};

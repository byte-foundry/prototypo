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
	'/go-back': () => {
		const eventIndex = prototypoStore.get('undoTo') || prototypoStore.get('undoFrom');
		const event = prototypoStore.get('undoEventList')[eventIndex];

		if (eventIndex > 1) {

			const revert = Patch.revert(Patch.fromJSON(event.patch));
			const patch = prototypoStore.set('undoFrom', eventIndex).set('undoTo', eventIndex - 1).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			localServer.dispatchUpdate('/undoableStore', revert);
			localClient.dispatchAction('/update-font', undoableStore.get('controlsValues'));

		}
	},
	'/go-forward': () => {

		const eventIndex = prototypoStore.get('undoTo');

		if (eventIndex) {
			const event = prototypoStore.get('undoEventList')[eventIndex + 1];

			if (event) {

				const patch = prototypoStore.set('undoFrom', eventIndex).set('undoTo', eventIndex + 1).commit();

				localServer.dispatchUpdate('/prototypoStore', patch);
				localServer.dispatchUpdate('/undoableStore', Patch.fromJSON(event.patch));
				localClient.dispatchAction('/update-font', undoableStore.get('controlsValues'));

			}
		}

	},
	'/store-action': ({store, patch, label}) => {

		const newEventList = Array.from(prototypoStore.get('undoEventList'));
		const eventIndex = prototypoStore.get('undoTo') || prototypoStore.get('undoFrom');

		if (newEventList.length - 1 > eventIndex) {

			newEventList.splice(eventIndex + 1, newEventList.length);

		}

		newEventList.push(
			{
				patch: patch.toJSON && patch.toJSON() || patch,
				store,
				label,
			});
		const eventPatch = prototypoStore.set('undoEventList', newEventList)
			.set('undoTo', undefined)
			.set('undoFrom', newEventList.length - 1).commit();

		localServer.dispatchUpdate('/prototypoStore', eventPatch);
	},
	'/clear-undo-stack': () => {
		const patch = prototypoStore
			.set('undoEventList', [])
			.set('undoFrom', 0)
			.set('undoTo', 0)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};

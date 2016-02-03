import Remutable from 'remutable';
const {Patch} = Remutable;

import {eventBackLog} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/go-back': () => {
		const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');
		const event = eventBackLog.get('eventList')[eventIndex];

		if (eventIndex > 1) {

			const revert = Patch.revert(Patch.fromJSON(event.patch));

			localServer.dispatchUpdate('/eventBackLog',
				eventBackLog.set('from', eventIndex)
					.set('to', eventIndex - 1).commit());
			localServer.dispatchUpdate(event.store, revert);

		}
	},
	'/go-forward': () => {

		const eventIndex = eventBackLog.get('to');

		if (eventIndex) {
			const event = eventBackLog.get('eventList')[eventIndex + 1];

			if (event) {

				localServer.dispatchUpdate('/eventBackLog',
					eventBackLog.set('from', eventIndex)
						.set('to', eventIndex + 1).commit());
				localServer.dispatchUpdate(event.store, Patch.fromJSON(event.patch));

			}
		}

	},
	'/store-action': ({store, patch, label}) => {

		const newEventList = Array.from(eventBackLog.get('eventList'));
		const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');

		if (newEventList.length - 1 > eventIndex) {

			newEventList.splice(eventIndex + 1, newEventList.length);

		}

		newEventList.push(
			{
				patch: patch.toJSON && patch.toJSON() || patch,
				store,
				label,
			});
		const eventPatch = eventBackLog.set('eventList', newEventList)
			.set('to', undefined)
			.set('from', newEventList.length - 1).commit();

		localServer.dispatchUpdate('/eventBackLog', eventPatch);
	},
};

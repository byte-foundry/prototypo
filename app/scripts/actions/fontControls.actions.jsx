import cloneDeep from 'lodash/cloneDeep';

import {undoableStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';
import LocalClient from '../stores/local-client.stores';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

export default {
	'/load-values': (p) => {
		const params = cloneDeep(p);

		const patch = undoableStore.set('controlsValues', params).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/store-action', {
			store: '/undoableStore',
			patch,
		});
	},
};

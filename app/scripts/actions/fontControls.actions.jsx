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

		if (params.manualChanges && Object.keys(params.manualChanges).length > 0) {
			_.forEach(params.manualChanges, function(value, key) {
				if (params.manualChanges[key] instanceof Object) {
					params.manualChanges[key].dirty = Object.keys(value.cursors).length;
				}
			});
		}
		const patch = undoableStore
			.set('controlsValues', params)
			.commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/store-action', {store: '/undoableStore', patch});
	},
};

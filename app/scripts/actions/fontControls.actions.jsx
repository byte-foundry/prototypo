import {prototypoStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

export default {
	'/load-values': (params) => {
		const patch = undoableStore
			.set('controlsValues', params)
			.commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/store-action', {store: '/undoableStore', patch});
		localClient.dispatchAction('/update-font', params);
	},
};

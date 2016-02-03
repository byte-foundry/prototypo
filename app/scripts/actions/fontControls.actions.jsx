import {fontControls} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

const localServer = LocalServer.instance;
const localClient = LocalClient.instance();

export default {
	'/load-values': (params) => {
		const patch = fontControls
			.set('values', params)
			.commit();

		localServer.dispatchUpdate('/fontControls', patch);
		localClient.dispatchAction('/store-action', {store: '/fontControls', patch});
		localClient.dispatchAction('/update-font', params);
	},
};

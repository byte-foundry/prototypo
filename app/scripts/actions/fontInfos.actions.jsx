import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {FontInfoValues} from '../services/values.services.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-font-infos': ({altList}) => {
		const patch = prototypoStore.set('altList', altList).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/set-alternate': ({unicode, glyphName}) => {
		fontInstance.setAlternateFor(unicode, glyphName);
		const altList = prototypoStore.get('altList');

		altList[unicode] = glyphName;

		const patch = prototypoStore.set('altList', altList).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		FontInfoValues.save({
			typeface: prototypoStore.get('variant').db || 'default',
			values: {
				altList,
			},
		});
	},
};

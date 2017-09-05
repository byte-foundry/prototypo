import {prototypoStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {FontValues} from '../services/values.services.js';

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
		const altList = _.cloneDeep(prototypoStore.get('altList'));

		altList[unicode] = glyphName;

		const patch = prototypoStore.set('altList', altList).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const values = undoableStore.get('controlsValues');

		FontValues.save({
			variantId: prototypoStore.get('variant').id,
			typeface: prototypoStore.get('variant').db || 'default',
			values: {
				...values,
				altList,
			},
		});
	},
};

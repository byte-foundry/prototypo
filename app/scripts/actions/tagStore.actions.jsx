import _xor from 'lodash/xor';
import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-tags': (params) => {
		const patch = prototypoStore.set('tags', params).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/select-tag': (params) => {
		const patch = prototypoStore.set('tagSelected', params).commit();
		const patchSearch = prototypoStore.set('glyphSearch', undefined).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		localServer.dispatchUpdate('/prototypoStore', patchSearch);
		saveAppValues();
	},
	'/toggle-pinned': (params) => {
		const pinned = _xor(prototypoStore.get('tagPinned'), [params]);
		const patch = prototypoStore.set('tagPinned', pinned).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
};

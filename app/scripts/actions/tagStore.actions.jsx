import {tagStore, searchStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-tags': (params) => {
		const patch = tagStore
			.set('tags', params)
			.commit();

		localServer.dispatchUpdate('/tagStore', patch);
	},
	'/select-tag': (params) => {
		const patch = tagStore
			.set('selected', params)
			.commit();
		const patchSearch = searchStore.set('glyphSearch', undefined).commit();

		localServer.dispatchUpdate('/tagStore', patch);
		localServer.dispatchUpdate('/searchStore', patchSearch);
		saveAppValues(appValuesLoaded);
	},
	'/toggle-pinned': (params) => {
		const pinned = _.xor(tagStore.get('pinned'), [params]);
		const patch = tagStore
			.set('pinned', pinned)
			.commit();

		localServer.dispatchUpdate('/tagStore', patch);
		saveAppValues(appValuesLoaded);
	},
};

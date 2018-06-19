import _cloneDeep from 'lodash/cloneDeep';
import _xor from 'lodash/xor';
import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/search-glyph': ({query}) => {
		const patch = prototypoStore.set('glyphSearch', query).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const patchTag = prototypoStore.set('tagSelected', 'all').commit();

		localServer.dispatchUpdate('/prototypoStore', patchTag);
	},
	'/save-search-glyph': ({query}) => {
		const searchs = _cloneDeep(prototypoStore.get('savedSearch'));

		if (searchs.indexOf(query) === -1) {
			searchs.push(query);
			const patch = prototypoStore
				.set('savedSearch', searchs)
				.set('savedSearchError', undefined)
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
		}
		else {
			const patch = prototypoStore.set(
				'savedSearchError',
				'This search already exists',
			);

			localServer.dispatchUpdate('/prototypoStore', patch);
		}
		saveAppValues();
	},
	'/toggle-pinned-search': ({query}) => {
		const pinned = _xor(prototypoStore.get('pinnedSearch'), [query]);
		const patch = prototypoStore.set('pinnedSearch', pinned).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
	'/delete-search-glyph': ({query}) => {
		const searchs = _xor(prototypoStore.get('savedSearch'), [query]);
		const pinned = _xor(prototypoStore.get('pinnedSearch'), [query]);
		const patch = prototypoStore
			.set('savedSearch', searchs)
			.set('pinnedSearch', pinned)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
};

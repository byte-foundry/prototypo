import {searchStore, tagStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/search-glyph': ({query}) => {
		const patch = searchStore.set('glyphSearch', query).commit();

		localServer.dispatchUpdate('/searchStore', patch);

		const patchTag = tagStore.set('selected', 'all').commit();

		localServer.dispatchUpdate('/tagStore', patchTag);
	},
	'/save-search-glyph': ({query}) => {
		const searchs = _.cloneDeep(searchStore.get('savedSearch'));

		if (searchs.indexOf(query) === -1) {
			searchs.push(query);
			const patch = searchStore
				.set('savedSearch', searchs)
				.set('savedSearchError', undefined)
				.commit();

			localServer.dispatchUpdate('/searchStore', patch);
		}
		else {
			const patch = searchStore.set('savedSearchError', 'This search already exists');

			localServer.dispatchUpdate('/searchStore', patch);
		}
		saveAppValues();
	},
	'/toggle-pinned-search': ({query}) => {
		const pinned = _.xor(searchStore.get('pinned'), [query]);
		const patch = searchStore
			.set('pinned', pinned)
			.commit();

		localServer.dispatchUpdate('/searchStore', patch);
		saveAppValues();
	},
	'/delete-search-glyph': ({query}) => {
		const searchs = _.xor(searchStore.get('savedSearch'), [query]);
		const pinned = _.xor(searchStore.get('pinned'), [query]);
		const patch = searchStore
			.set('savedSearch', searchs)
			.set('pinned', pinned)
			.commit();

		localServer.dispatchUpdate('/searchStore', patch);
		saveAppValues();
	},
}

import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-glyphs': (params) => {
		const patch = prototypoStore
			.set('glyphs', params)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/select-glyph': ({unicode}) => {
			const patch = prototypoStore.set('glyphSelected', unicode).commit();
			const newViewMode = _.union(prototypoStore.get('uiMode'), ['glyph']);

			localServer.dispatchUpdate('/prototypoStore', patch);

			fontInstance.displayChar(String.fromCharCode(unicode));

			if (newViewMode.length > 0) {
				const patchPanel = prototypoStore.set('uiMode', newViewMode).commit();

				localServer.dispatchUpdate('/prototypoStore', patchPanel);
			}

			saveAppValues();
	},
	'/toggle-lock-list': () => {
		const lockState = prototypoStore.get('glyphLocked');
		const patch = prototypoStore.set('glyphLocked', !lockState).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/toggle-focus-direct-access': () => {
		const focused = prototypoStore.get('glyphFocused');
		const patch = prototypoStore.set('glyphFocused', !focused).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};

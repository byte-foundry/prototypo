import _union from 'lodash/union';

import {prototypoStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';
import LocalClient from '../stores/local-client.stores';
import {saveAppValues} from '../helpers/loadValues.helpers';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
	localClient = LocalClient.instance();
});

export default {
	'/load-glyphs': (params) => {
		const patch = prototypoStore.set('glyphs', params).commit();

		localClient.dispatchAction('/check-glyph-valid', {glyphs: params});
		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/select-glyph': ({unicode}) => {
		const patch = prototypoStore.set('glyphSelected', unicode).commit();
		const newViewMode = _union(prototypoStore.get('uiMode'), ['glyph']);

		localServer.dispatchUpdate('/prototypoStore', patch);

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
	'/check-glyph-valid': ({glyphs}) => {
		const glyphSelected = prototypoStore.get('glyphSelected');
		const unicode = '65';

		if (Object.keys(glyphs).indexOf(glyphSelected) === -1) {
			localClient.dispatchAction('/select-glyph', {unicode});
		}
	},
};

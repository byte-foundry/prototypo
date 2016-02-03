import {glyphs, panel} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-glyphs': (params) => {
		const patch = glyphs
			.set('glyphs', params)
			.commit();

		localServer.dispatchUpdate('/glyphs', patch);
	},
	'/select-glyph': ({unicode}) => {
			const patch = glyphs.set('selected', unicode).commit();
			const newViewMode = _.union(panel.get('mode'), ['glyph']);

			localServer.dispatchUpdate('/glyphs', patch);

			fontInstance.displayChar(String.fromCharCode(unicode));

			if (newViewMode.length > 0) {
				const patchPanel = panel.set('mode', newViewMode).commit();

				localServer.dispatchUpdate('/panel', patchPanel);
			}

			saveAppValues(appValuesLoaded);
	},
	'/toggle-lock-list': () => {
		const lockState = glyphs.get('locked');
		const patch = glyphs.set('locked', !lockState).commit();

		localServer.dispatchUpdate('/glyphs', patch);
	},
};

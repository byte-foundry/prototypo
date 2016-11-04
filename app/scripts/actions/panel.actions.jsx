import {prototypoStore, undoableStore, fastStuffStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

import {rawToEscapedContent} from '../helpers/input-transform.helpers';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/store-value': (params) => {
		_.forEach(params, (value, name) => {
			prototypoStore.set(name, value);
		});

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
	'/store-value-undoable': (params) => {
		_.forEach(params, (value, name) => {
			undoableStore.set(name, value);
		});

		const patch = undoableStore.commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		saveAppValues();
	},
	'/store-value-fast': (params) => {
		_.forEach(params, (value, name) => {
			fastStuffStore.set(name, value);
		});

		const patch = fastStuffStore.commit();

		localServer.dispatchUpdate('/fastStuffStore', patch);
		saveAppValues();
	},
	'/store-text': ({value, propName}) => {
		if (prototypoStore.get(propName) !== value) {
			const glyphs = prototypoStore.get('glyphs');
			const patch = prototypoStore.set(propName, value).commit();
			const subset = prototypoStore.head.toJS().uiText + rawToEscapedContent(prototypoStore.head.toJS().uiWord, glyphs);

			localServer.dispatchUpdate('/prototypoStore', patch);

			fontInstance.subset = typeof subset === 'string' ? subset : '';
			saveAppValues();
		}
	},
	'/change-canvas-mode': ({canvasMode}) => {
		fontInstance.showNodes = canvasMode === 'select-points';
		fontInstance.allowMove = canvasMode === 'move';
		const showComponent = canvasMode === 'components';
		const oldShowComponent = fontInstance._showComponents;

		fontInstance._showComponents = showComponent;
		if (showComponent !== oldShowComponent) {
			fontInstance.displayGlyph();
		}

		prototypoStore.set('canvasMode', canvasMode);

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/toggle-canvas-mode': ({canvasMode = prototypoStore.get('oldCanvasMode')}) => {
		fontInstance.showNodes = canvasMode === 'select-points';
		fontInstance.allowMove = canvasMode === 'move';
		const showComponent = canvasMode === 'components';
		const oldShowComponent = fontInstance._showComponents;

		fontInstance._showComponents = showComponent;
		if (showComponent !== oldShowComponent) {
			fontInstance.displayGlyph();
		}

		prototypoStore.set('oldCanvasMode', prototypoStore.get('canvasMode'));
		prototypoStore.set('canvasMode', canvasMode);

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/change-tab-font': ({name}) => {
		const patch = prototypoStore.set('fontTab', name).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();

	},
};

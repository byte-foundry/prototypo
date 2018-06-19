import _forOwn from 'lodash/forOwn';
import {
	prototypoStore,
	undoableStore,
	fastStuffStore,
	fontInstanceStore,
} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/store-value': (params) => {
		_forOwn(params, (value, name) => {
			prototypoStore.set(name, value);
		});

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
	'/store-value-font': (params) => {
		_forOwn(params, (value, name) => {
			fontInstanceStore.set(name, value);
		});

		const patch = fontInstanceStore.commit();

		localServer.dispatchUpdate('/fontInstanceStore', patch);
		saveAppValues();
	},
	'/store-value-undoable': (params) => {
		_forOwn(params, (value, name) => {
			undoableStore.set(name, value);
		});

		const patch = undoableStore.commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		saveAppValues();
	},
	'/store-value-fast': (params) => {
		_forOwn(params, (value, name) => {
			fastStuffStore.set(name, value);
		});

		const patch = fastStuffStore.commit();

		localServer.dispatchUpdate('/fastStuffStore', patch);
		saveAppValues();
	},
	'/store-text': ({value, propName}) => {
		if (prototypoStore.get(propName) !== value) {
			const patch = prototypoStore.set(propName, value).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			saveAppValues();
		}
	},
	'/change-canvas-mode': ({canvasMode}) => {
		prototypoStore
			.set('canvasMode', canvasMode)
			.set('oldCanvasMode', undefined);

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/toggle-canvas-mode': ({
		canvasMode = prototypoStore.get('oldCanvasMode'),
	}) => {
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

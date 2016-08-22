import {prototypoStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

import {rawToEscapedContent} from '../helpers/input-transform.helpers';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
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
	'/store-text': ({value, propName}) => {
		const glyphs = prototypoStore.get('glyphs');
		const patch = prototypoStore.set(propName, value).commit();
		const subset = prototypoStore.head.toJS().uiText + rawToEscapedContent(prototypoStore.head.toJS().uiWord, glyphs);

		localServer.dispatchUpdate('/prototypoStore', patch);

		fontInstance.subset = typeof subset === 'string' ? subset : '';
		saveAppValues();
	},
	'/change-tab-font': ({name}) => {
		const patch = prototypoStore.set('fontTab', name).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();

	},
};

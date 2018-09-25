import _forOwn from 'lodash/forOwn';
import {prototypoStore, undoableStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';
import {FontValues} from '../services/values.services';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/set-alternate': ({unicode, glyphName, relatedGlyphs = {}}) => {
		const newParams = {...undoableStore.get('controlsValues')};
		const altList = {...newParams.altList} || {};

		altList[unicode] = glyphName;

		_forOwn(relatedGlyphs, (alternate, relatedUnicode) => {
			altList[relatedUnicode] = alternate;
		});

		newParams.altList = {...altList};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);

		FontValues.save({
			variantId: prototypoStore.get('variant').id,
			typeface: prototypoStore.get('variant').db || 'default',
			values: newParams,
		});
	},
};

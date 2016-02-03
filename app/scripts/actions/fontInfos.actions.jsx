import {fontInfos} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {FontInfoValues} from '../services/values.services.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-font-infos': ({altList}) => {
		const patch = fontInfos.set('altList', altList).commit();

		localServer.dispatchUpdate('/fontInfos', patch);
	},
	'/set-alternate': ({unicode, glyphName}) => {
		fontInstance.setAlternateFor(unicode, glyphName);
		const altList = fontInfos.get('altList');

		altList[unicode] = glyphName;

		const patch = fontInfos.set('altList', altList).commit();

		localServer.dispatchUpdate('/fontInfos', patch);

		FontInfoValues.save({
			typeface: fontVariant.get('variant').db || 'default',
			values: {
				altList,
			},
		});
	},
};

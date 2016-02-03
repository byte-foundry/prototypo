import {panel} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from './helpers/loadValues.helpers.js';

const localServer = LocalServer.instance;

export default {
	'/store-panel-param': (params) => {
		_.forEach(params, (value, name) => {
			panel.set(name, value);
		});
		const patch = panel.commit();

		localServer.dispatchUpdate('/panel', patch);
		saveAppValues(appValuesLoaded);
	},
	'/store-text': ({value, propName}) => {
		const patch = panel.set(propName, value).commit();
		const subset = panel.head.toJS().text + panel.head.toJS().word;

		localServer.dispatchUpdate('/panel', patch);

		fontInstance.subset = typeof subset === 'string' ? subset : '';
		saveAppValues(appValuesLoaded);
	},
};

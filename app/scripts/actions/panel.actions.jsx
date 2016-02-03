import {panel, sideBarTab, fontTab} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {saveAppValues} from './helpers/loadValues.helpers.js';

const localServer = LocalServer.instance;
const localClient = LocalClient.instance();

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
	'/change-tab-sidebar': (params) => {

		if (sideBarTab.get('tab') === 'fonts-collection'
			&& params.name !== 'font-collection'
			&& !panel.get('onboard')
			&& panel.get('onboardstep').indexOf('creatingFamily') !== -1) {

			localClient.dispatchAction('/store-panel-param', {onboardstep: 'createFamily'});

		}

		if (panel.get('onboardstep') && panel.get('onboardstep') === params.from) {
			localClient.dispatchAction('/store-panel-param', {onboardstep: params.to});
		}

		const name = params.name;
		const patch = sideBarTab.set('tab', name).commit();

		localServer.dispatchUpdate('/sideBarTab', patch);

		Log.ui('Sidebar/change-tab-sidebar', name);
	},
	'/change-tab-font': ({name}) => {
		const patch = fontTab.set('tab', name).commit();

		localServer.dispatchUpdate('/fontTab', patch);
		saveAppValues(appValuesLoaded);

	},
};

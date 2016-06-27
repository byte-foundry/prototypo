import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {FontValues, AppValues, FontInfoValues} from '../services/values.services.js';

let localClient;
let appValuesLoaded = false;

export const valuesToLoad = [
	{remote: 'shadow', local: 'uiShadow'},
	{remote: 'variantSelected', local: 'variant'},
	{remote: 'familySelected', local: 'family'},
	{remote: 'mode', local: 'uiMode'},
	{remote: 'switchedToHoodie', local: 'switchedToHoodie'},
	{remote: 'onboard', local: 'uiOnboard'},
	{remote: 'word', local: 'uiWord'},
	{remote: 'text', local: 'uiText'},
	{remote: 'savedSearch', local: 'savedSearch'},
	{remote: 'nodes', local: 'uiNodes'},
	{remote: 'onboardstep', local: 'uiOnboardstep'},
	{remote: 'zoom', local: 'uiZoom'},
	{remote: 'pos', local: 'uiPos'},
	{remote: 'tagSelected', local: 'tagSelected'},
	{remote: 'tab', local: 'fontTab'},
	{remote: 'pinned', local: 'tagPinned'},
	{remote: 'wordFontSize', local: 'uiWordFontSize'},
	{remote: 'library', local: 'fonts'},
	{remote: 'showCollection', local: 'uiShowCollection'},
	{remote: 'selected', local: 'glyphSelected'},
	{remote: 'textFontSize', local: 'uiTextFontSize'},
	{remote: 'collection', local: 'uiShowCollection'},
	{remote: 'latestCommit', local: 'latestCommit'},
];

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

window.addEventListener('appValues.loaded', () => {
	appValuesLoaded = true;
});

export async function copyFontValues(typeface) {
	const values = prototypoStore.get('controlsValues');

	await FontValues.save({
		typeface,
		values,
	});
}

export async function loadFontValues(typedata, typeface) {

	const initValues = {};

	_.each(typedata.controls, (group) => {
		return _.each(group.parameters, (param) => {
			initValues[param.name] = param.init;
		});
	});

	try {
		const fontValues = await FontValues.get({typeface});

		localClient.dispatchAction('/load-values', _.extend(initValues, fontValues.values));
	}
	catch (err) {
		const values = _.extend({}, initValues);

		localClient.dispatchAction('/load-values', values);
		FontValues.save({
			typeface,
			values,
		});
	}

	try {
		const fontInfosValues = await FontInfoValues.get({typeface});
		const altList = _.extend(typedata.fontinfo.defaultAlts, fontInfosValues.values.altList);

		fontInstance.setAlternateFor(altList);
		localClient.dispatchAction('/load-font-infos', {altList});
	}
	catch (err) {
		const values = {
			altList: typedata.fontinfo.defaultAlts,
		};

		await FontInfoValues.save({
			typeface,
			values,
		});

		localClient.dispatchAction('/load-font-infos', values);
	}

	localClient.dispatchAction('/load-indiv-groups');
}

export const saveAppValues = _.debounce(() => {
	if (!appValuesLoaded) {
		return;
	}

	//TODO(franzp): WOW BE CAREFUL
	//debugger;
	//qsdmjkfqsd,qsdlhvklm:({}:w
	//const appValues = prototypoStore.head.toJS();
	const appValues = {};

	_.forEach(valuesToLoad, (ref) => {
		appValues[ref.remote] = prototypoStore.get(ref.local);
	});

	AppValues.save({typeface: 'default', values: appValues});
}, 300);

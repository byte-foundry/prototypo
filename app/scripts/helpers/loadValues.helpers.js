import _throttle from 'lodash/throttle';
import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {FontValues, AppValues} from '../services/values.services.js';

let localClient;
let appValuesLoaded = false;

export const valuesToLoad = [
	{remote: 'shadow', local: 'uiShadow'},
	{remote: 'variantSelected', local: 'variant'},
	{remote: 'familySelected', local: 'family'},
	{remote: 'mode', local: 'uiMode'},
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
	{remote: 'showCollection', local: 'uiShowCollection'},
	{remote: 'selected', local: 'glyphSelected'},
	{remote: 'textFontSize', local: 'uiTextFontSize'},
	{remote: 'latestCommit', local: 'latestCommit'},
	{remote: 'firstTimeFile', local: 'firstTimeFile'},
	{remote: 'firstTimeCollection', local: 'firstTimeCollection'},
	{remote: 'firstTimeIndivCreate', local: 'firstTimeIndivCreate'},
	{remote: 'firstTimeIndivEdit', local: 'firstTimeIndivEdit'},
	{remote: 'firstTimeAcademyJoyride', local: 'firstTimeAcademyJoyride'},
	{remote: 'firstTimeAcademyModal', local: 'firstTimeAcademyModal'},
	{remote: 'canvasPanelWidth', local: 'canvasPanelWidth'},
	{remote: 'wordPanelHeight', local: 'wordPanelHeight'},
	{remote: 'rulerDisplayed', local: 'uiRuler'},
	{remote: 'guides', local: 'guides'},
	{remote: 'advancedMode', local: 'advancedMode'},
];

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

window.addEventListener('appValues.loaded', () => {
	appValuesLoaded = true;
});

export async function loadFontValues(typedata, typeface, variantId) {
	const initValues = {};

	typedata.controls.forEach(group =>
		group.parameters.forEach((param) => {
			initValues[param.name] = param.init;
		}),
	);

	try {
		const fontValues = await FontValues.get({typeface, variantId});

		localClient.dispatchAction('/load-values', {
			...initValues,
			...fontValues.values,
		});
	}
	catch (err) {
		const values = {altList: typedata.fontinfo.defaultAlts, ...initValues};

		localClient.dispatchAction('/load-values', values);
		FontValues.save({
			typeface,
			values,
			variantId,
		});
	}

	localClient.dispatchAction('/load-indiv-groups');

	const event = new CustomEvent('values.loaded');

	window.dispatchEvent(event);
}

export const saveAppValues = _throttle(() => {
	if (!appValuesLoaded) {
		return;
	}

	// TODO(franzp): WOW BE CAREFUL
	// debugger;
	// qsdmjkfqsd,qsdlhvklm:({}:w
	// const appValues = prototypoStore.head.toJS();
	const appValues = {};

	valuesToLoad.forEach((ref) => {
		appValues[ref.remote] = prototypoStore.get(ref.local);
	});

	AppValues.save({typeface: 'default', values: appValues});
}, 2000);

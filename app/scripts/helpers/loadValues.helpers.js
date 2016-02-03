import LocalClient from './stores/local-client.stores.jsx';
import {FontValues, AppValues, FontInfoValues} from './services/values.services.js';

const localClient = LocalClient.instance();

export async function copyFontValues(typeface) {
	const values = fontControls.get('values');

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
}

export const saveAppValues = _.debounce((appValuesLoaded) => {
	if (!appValuesLoaded) {
		return;
	}

	const appValues = panel.head.toJS();

	appValues.selected = glyphs.get('selected');
	appValues.tab = fontTab.get('tab');
	appValues.pinned = tagStore.get('pinned');
	appValues.latestCommit = commits.get('latest');
	appValues.library = fontLibrary.get('fonts');
	appValues.variantSelected = fontVariant.get('variant');
	appValues.familySelected = fontVariant.get('family');
	appValues.tagSelected = tagStore.get('selected');
	appValues.savedSearch = searchStore.get('savedSearch');
	appValues.pinnedSearch = searchStore.get('pinned');

	AppValues.save({typeface: 'default', values: appValues});
}, 300);

import {glyphs} from '../stores/creation.stores.jsx';
import {AppValues} from '../services/values.services.js';
import {loadFontValues} from './loadValues.helpers.js';
import {setupFontInstance} from './font.helpers.js';
import LocalClient from '../stores/local-client.stores.jsx';

let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

const defaultValues = {
		values: {
			mode: ['glyph', 'word'],
			selected: 'A'.charCodeAt(0).toString(),
			onboard: false,
			onboardstep: 'welcome',
			word: 'Hello',
			text: 'World',
			pos: ['Point', 457, -364],
			familySelected: {
				template: 'venus.ptf',
			},
			variantSelected: {
				db: 'venus.ptf',
			},
			savedSearch: [],
		},
};

function mapGlyphForApp(glyph) {
	return _.map(
		glyph,
		(alt) => {
			return {
				src: {
					tags: alt.src && alt.src.tags || [],
					characterName: alt.src && alt.src.characterName || '',
					unicode: alt.src && alt.src.unicode	|| '',
					glyphName: alt.src && alt.src.glyphName || '',
				},
				name: alt.name,
				altImg: alt.altImg,
			};
		}
	);
}

export async function loadStuff() {
	//Login checking and app and font values loading
	let appValues;

	try {
		appValues = await AppValues.get({typeface: 'default'});
		appValues.values = _.extend(defaultValues.values, appValues.values);
	}
	catch (err) {
		appValues = defaultValues;
		console.error(err);
		location.href = '#/signin';
	}

	localClient.dispatchAction('/load-app-values', appValues);

	let typedata;

	try {
		const fontResult = await setupFontInstance(appValues);

		typedata = fontResult.typedata;
	}
	catch (err) {
	}

	localClient.dispatchAction('/create-font', fontInstance.font.ot.getEnglishName('fontFamily'));
	localClient.dispatchAction('/load-params', {controls: typedata.controls, presets: typedata.presets});
	localClient.dispatchAction('/load-glyphs', _.mapValues(
		fontInstance.font.altMap,
		mapGlyphForApp
	));
	localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);
	localClient.dispatchAction('/load-commits');
	fontInstance.displayChar(String.fromCharCode(glyphs.get('selected')));

	loadFontValues(typedata, appValues.values.variantSelected.db);
}

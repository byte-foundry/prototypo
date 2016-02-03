import {fontStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {Typefaces} from './services/typefaces.services.js';
import {loadFontValues} from './helpers/loadValues.helpers.js';

const localServer = LocalServer.instance;
const localClient = LocalClient.instance();

export default {
	'/create-font': (familyName) => {
		const patch = fontStore
			.set('fontName', familyName)
			.commit();

		localServer.dispatchUpdate('/fontStore', patch);
	},
	'/update-font': (params) => {
		// we need a non-empty params object
		if (!params || !Object.keys(params).length) {
			return;
		}

		fontInstance.update(params);
	},
	'/change-font': async ({template, db}) => {
		const typedataJSON = await Typefaces.getFont(template);
		const typedata = JSON.parse(typedataJSON);

		try {
			await fontInstance.loadFont(typedata.fontinfo.familyName, typedataJSON);
		}
		catch (err) {
			saveErrorLog(err);
		}

		localClient.dispatchAction('/create-font', fontInstance.font.ot.getEnglishName('fontFamily'));

		localClient.dispatchAction('/load-params', {controls: typedata.controls, presets: typedata.presets});
		localClient.dispatchAction('/load-glyphs', _.mapValues(
			fontInstance.font.altMap,
			(glyph) => {
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
		));
		localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);

		loadFontValues(typedata, db);
	},
};

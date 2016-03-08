import XXHash from 'xxhashjs';
import slug from 'slug';

import {fontStore, fontVariant, fontLibrary} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {Typefaces} from '../services/typefaces.services.js';
import {copyFontValues, loadFontValues, saveAppValues} from '../helpers/loadValues.helpers.js';
import {FontValues} from '../services/values.services.js';

slug.defaults.mode = 'rfc3986';
slug.defaults.modes.rfc3986.remove = /[-_\/\\\.]/g;
let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

const hasher = XXHash(0xDEADBEEF);

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
	'/change-font': async ({templateToLoad, db}) => {
		const typedataJSON = await Typefaces.getFont(templateToLoad);
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
	'/create-family': async ({name, template, loadCurrent}) => {
		let templateToLoad = template;

		localClient.dispatchAction('/cancel-indiv-mode');
		if (loadCurrent) {
			templateToLoad = fontVariant.get('family').template;
		}

		if (templateToLoad === undefined) {
			const patch = fontLibrary.set('errorAddFamily', 'You must choose a base template').commit();

			localServer.dispatchUpdate('/fontLibrary', patch);
			return;
		}

		if (name === undefined || name === '') {
			const patch = fontLibrary.set('errorAddFamily', 'You must choose a name for your family').commit();

			localServer.dispatchUpdate('/fontLibrary', patch);
			return;
		}

		const fonts = Array.from(fontLibrary.get('fonts'));
		const newFont = {
			name,
			template: templateToLoad,
			variants: [
				{
					id: hasher.update(`REGULAR${(new Date()).getTime()}`).digest().toString(16),
					name: 'REGULAR',
					db: `${name}regular`,
				},
			],
		};

		const already = _.find(fonts, (font) => {
			return font.name === name;
		});

		if (already) {
			const patch = fontLibrary.set('errorAddFamily', 'A Family with this name already exists').commit();

			localServer.dispatchUpdate('/fontLibrary', patch);
			return;
		}

		fonts.push(newFont);

		const patch = fontLibrary
			.set('errorAddFamily', undefined)
			.commit();

		localServer.dispatchUpdate('/fontLibrary', patch);

		setTimeout(() => {
			const patchLib = fontLibrary
				.set('fonts', fonts)
				.commit();

			localServer.dispatchUpdate('/fontLibrary', patchLib);
		}, 200);

		if (loadCurrent) {
			await copyFontValues(newFont.variants[0].db);
		}

		localClient.dispatchAction('/change-font', {
			templateToLoad,
			db: newFont.variants[0].db,
		});

		const patchVariant = fontVariant
			.set('variant', newFont.variants[0])
			.set('family', {name: newFont.name, template: newFont.template}).commit();

		localServer.dispatchUpdate('/fontVariant', patchVariant);

		saveAppValues();
	},
	'/select-variant': ({variant, family}) => {
		localClient.dispatchAction('/cancel-indiv-mode');
		const patchVariant = fontVariant
			.set('variant', variant)
			.set('family', {name: family.name, template: family.template}).commit();

		localServer.dispatchUpdate('/fontVariant', patchVariant);

		localClient.dispatchAction('/change-font', {
			templateToLoad: family.template,
			db: variant.db,
		});
		saveAppValues();
	},
	'/create-variant': async ({name, familyName}) => {
		localClient.dispatchAction('/cancel-indiv-mode');
		const family = _.find(Array.from(fontLibrary.get('fonts') || []), (font) => {
			return font.name === familyName;
		});

		const already = _.find(family.variants, (item) => {
			return item.name === name;
		});

		if (already) {
			const patch = fontLibrary.set('errorAddVariant', 'Variant with this name already exists').commit();

			localServer.dispatchUpdate('/fontLibrary', patch);
			return;
		}

		const variant = {
			id: hasher.update(`${name}${(new Date()).getTime()}`).digest().toString(16),
			name,
			db: slug(`${familyName}${name}`, ''),
		};
		const thicknessTransform = [
			{string: 'THIN', thickness: 20},
			{string: 'LIGHT', thickness: 50},
			{string: 'BOOK', thickness: 70},
			{string: 'BOLD', thickness: 115},
			{string: 'SEMI-BOLD', thickness: 100},
			{string: 'EXTRA-BOLD', thickness: 135},
			{string: 'BLACK', thickness: 150},
		];

		family.variants.push(variant);

		const patch = fontLibrary
			.set('fonts', fontLibrary.get('fonts'))
			.set('errorAddVariant', undefined).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);

		const ref = await FontValues.get({typeface: family.variants[0].db});

		_.each(thicknessTransform, (item) => {
			if (name.indexOf(item.string) !== -1) {
				ref.values.thickness = item.thickness;
			}
		});

		if (name.indexOf('ITALIC') !== -1) {
			ref.values.slant = 10;
		}

		setTimeout(async () => {
			await FontValues.save({typeface: variant.db, values: ref.values});
			localClient.dispatchAction('/select-variant', {variant, family});
		}, 200);

	},
	'/edit-variant': ({variant, family, newName}) => {
		const found = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
			return item.name === family.name;
		});

		const newVariant = _.find(found.variants || [], (item) => {
			return variant.id === item.id;
		});

		newVariant.name = newName;

		const patch = fontLibrary.set('fonts', fontLibrary.get('fonts')).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);
		saveAppValues();
	},
	'/delete-variant': ({variant, familyName}) => {
		const family = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
			return item.name === familyName;
		});

		_.pull(family.variants, variant);

		const patch = fontLibrary.set('fonts', fontLibrary.get('fonts')).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);
		saveAppValues();

	},
	'/delete-family': ({family}) => {
		const families = Array.from(fontLibrary.get('fonts'));

		_.remove(families, (checkee) => {
			return checkee.name === family.name && checkee.template === family.template;
		});
		const patch = fontLibrary.set('fonts', families).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);

		family.variants.forEach((variant) => {
			FontValues.deleteDb({typeface: variant.db});
		});

		saveAppValues();
	},
	'/clear-error-family': () => {
		const patch = fontLibrary.set('errorAddFamily', undefined).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);
	},
	'/clear-error-variant': () => {
		const patch = fontLibrary.set('errorAddVariant', undefined).commit();

		localServer.dispatchUpdate('/fontLibrary', patch);
	},
};

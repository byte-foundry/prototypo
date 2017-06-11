//import PrototypoCanvas from 'prototypo-canvas';

import {Typefaces} from '../services/typefaces.services.js';

import {rawToEscapedContent} from '../helpers/input-transform.helpers.js';

export function mapGlyphForApp(glyph) {
	return _.map(
		glyph,
		(alt) => {
			return {
				src: {
					tags: alt.src && alt.src.tags || [],
					characterName: alt.src && alt.src.characterName || '',
					unicode: alt.src && alt.src.unicode	|| '',
					glyphName: alt.src && alt.src.glyphName || '',
					relatedGlyphs: alt.src && alt.src.relatedGlyphs || [],
				},
				name: alt.name,
				altImg: alt.altImg,
			};
		}
	);
}

export async function setupFontInstance(appValues) {
		const template = appValues.values.familySelected ? appValues.values.familySelected.template : undefined;
		const typedataJSON = await Typefaces.getFont(template || 'venus.ptf');
		const typedata = JSON.parse(typedataJSON);

		// const prototypoSource = await Typefaces.getPrototypo();
		const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;

		const workerUrl = '/prototypo-canvas/src/worker.js';

	//await font.loadFont(typedata.fontinfo.familyName, typedataJSON, appValues.values.variantSelected.db);

		/*const glyphs = _.mapValues(
			font.font.altMap,
			mapGlyphForApp
		);
		const subset = appValues.values.text + rawToEscapedContent(appValues.values.word, glyphs);*/

	//font.subset = typeof subset === 'string' ? subset : '';
	//font.displayChar(appValues.values.selected);
	return {
		typedataJSON,
		familyName: typedata.fontinfo.familyName,
		controls: typedata.controls,
		presets: typedata.presets,
		tags: typedata.fontinfo.tags,
		workerUrl,
		workerDeps,
		db: appValues.values.variantSelected.db,
		variantId: appValues.values.variantSelected.id,
		//subset,
		typedata
	};
}

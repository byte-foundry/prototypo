import {Typefaces} from '../services/typefaces.services.js';

import {rawToEscapedContent} from '../helpers/input-transform.helpers.js';
import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';

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

	const font = new FontPrecursor(typedata);

	return {
		typedataJSON,
		familyName: typedata.fontinfo.familyName,
		controls: typedata.controls,
		presets: typedata.presets,
		tags: typedata.fontinfo.tags,
		db: appValues.values.variantSelected.db,
		typedata,
	};
}

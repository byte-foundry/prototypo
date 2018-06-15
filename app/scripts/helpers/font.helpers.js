import {rawToEscapedContent} from '../helpers/input-transform.helpers.js';
import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';

export function mapGlyphForApp(glyph) {
	return glyph.map(alt => ({
		src: {
			tags: (alt.src && alt.src.tags) || [],
			characterName: (alt.src && alt.src.characterName) || '',
			unicode: (alt.src && alt.src.unicode) || '',
			glyphName: (alt.src && alt.src.glyphName) || '',
			relatedGlyphs: (alt.src && alt.src.relatedGlyphs) || [],
		},
		name: alt.name,
		altImg: alt.altImg,
	}));
}

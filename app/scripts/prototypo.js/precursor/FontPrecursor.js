/* global _ */
import {constantOrFormula} from '../helpers/values.js';

import Glyph from './Glyph.js';

export default class FontPrecursor {
	constructor(fontSrc) {
		const {fontinfo, lib} = fontSrc;

		this.familyName = constantOrFormula(fontinfo.familyName);
		this.version = constantOrFormula(fontinfo.version);
		this.description = constantOrFormula(fontinfo.description);
		this.ascender = constantOrFormula(fontinfo.ascender);
		this.descender = constantOrFormula(fontinfo.descender);
		this['cap-height'] = constantOrFormula(fontinfo['cap-height']);
		this['descendent-height'] = constantOrFormula(fontinfo['descendent-height']);
		this.parameters = _.mapValues(lib.parameters, (param) => {
			return constantOrFormula(param);
		});

		this.unicodeToGlyphName = {};

		this.glyphs = _.mapValues(fontSrc.glyphs, (glyph) => {
			this.unicodeToGlyphName[glyph.unicode] = glyph.name;

			return new Glyph(glyph);
		});

		//this.analyzeDependency();
	}

	analyzeDependency() {
		_.forOwn(this.glyphs, (glyph) => {
			glyph.analyzeDependency();
		});
	}

	constructFont(params, subset) {
		const localParams = {
			...params,
			..._.mapValues(this.parameters, (param) => {
				return param.getResult(params);
			}),
		};
		const transformedThis = _.mapValues(this, (prop, name) => {
			if (name !== 'parameters' && name !== 'glyphs' && name !== 'unicodeToGlyphName') {
				return prop.getResult(localParams);
			}
		});
		const glyphNames = _.map(subset, (char) => {
			return this.unicodeToGlyphName[char.charCodeAt(0)];
		});
		const glyphs = _.reduce(glyphNames, (result, name) => {
			result.push(this.glyphs[name].constructGlyph(localParams, undefined, this.glyphs));
			return result;
		}, []);

		return {
			...transformedThis,
			glyphs,
		};
	}
}

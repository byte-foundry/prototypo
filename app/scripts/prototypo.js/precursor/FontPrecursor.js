/* global _ */
import {constantOrFormula} from '../helpers/values';

import Glyph from './Glyph';

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
		this.parameters = _.mapValues(lib.parameters, param => constantOrFormula(param));
		this.paramBase = {
			manualChanges: {},
			altList: {},
			glyphComponentChoice: {},
		};

		this.unicodeToGlyphName = {};

		this.glyphs = _.mapValues(fontSrc.glyphs, (glyph) => {
			if (glyph.name.indexOf('alt') === -1) {
				this.unicodeToGlyphName[glyph.unicode] = glyph.name;
			}

			return new Glyph(glyph, this.paramBase);
		});

		// this.analyzeDependency();
	}

	analyzeDependency() {
		_.forOwn(this.glyphs, (glyph) => {
			glyph.analyzeDependency();
		});
	}

	constructFont(params, subset) {
		const localParams = {
			...params,
			..._.mapValues(this.parameters, param => param.getResult(params)),
			manualChanges: {
				...this.paramBase.manualChanges,
				...params.manualChanges,
			},
			glyphComponentChoice: {
				...this.paramBase.glyphComponentChoice,
				...params.glyphComponentChoice,
			},
			altList: {
				...this.paramBase.altList,
				...params.altList,
			},
		};
		const transformedThis = _.mapValues(this, (prop, name) => {
			if (name !== 'parameters' && name !== 'glyphs' && name !== 'unicodeToGlyphName' && name !== 'paramBase') {
				return prop.getResult(localParams);
			}

			return undefined;
		});
		const glyphNames = _.map(subset, char => localParams.altList[char] || this.unicodeToGlyphName[char]);
		const glyphs = _.reduce(glyphNames, (result, name) => {
			if (this.glyphs[name]) {
				result.push(this.glyphs[name].constructGlyph(localParams, undefined, this.glyphs));
			}
			return result;
		}, []);

		return {
			...transformedThis,
			glyphs,
		};
	}
}

import _mapValues from 'lodash/mapValues';
import _forOwn from 'lodash/forOwn';
import _reduce from 'lodash/reduce';

import {constantOrFormula} from '../utils/generic';

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
		this.parameters = _mapValues(lib.parameters, param => constantOrFormula(param));
		this.paramBase = {
			manualChanges: {},
			altList: {},
			glyphComponentChoice: {},
		};

		this.unicodeToGlyphName = {};

		this.glyphs = _mapValues(fontSrc.glyphs, (glyph) => {
			if (glyph.name.indexOf('alt') === -1) {
				this.unicodeToGlyphName[glyph.unicode] = glyph.name;
			}

			return new Glyph(glyph, this.paramBase);
		});

		// this.analyzeDependency();
	}

	analyzeDependency() {
		_forOwn(this.glyphs, (glyph) => {
			glyph.analyzeDependency();
		});
	}

	constructFont(params, subset) {
		const localParams = {
			...params,
			..._mapValues(this.parameters, param => param.getResult(params)),
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
		const transformedThis = _mapValues(this, (prop, name) => {
			if (name !== 'parameters' && name !== 'glyphs' && name !== 'unicodeToGlyphName' && name !== 'paramBase') {
				return prop.getResult(localParams);
			}

			return undefined;
		});
		const glyphNames = subset.map(char => localParams.altList[char] || this.unicodeToGlyphName[char]);
		const glyphs = _reduce(glyphNames, (result, name) => {
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

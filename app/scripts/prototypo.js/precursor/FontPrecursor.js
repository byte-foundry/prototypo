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

		this.glyphs = _.mapValues(fontSrc.glyphs, (glyph) => {
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
			if (name !== 'parameters' && name !== 'glyphs') {
				return prop.getResult(localParams);
			}
		});
		/*const {
			familyName,
			styleName,
			version,
			description,
			ascender,
			descender,
			fullName,
			designer,
			designerURL,
			manufacturer,
			manufacturerURL,
			license,
			licenseURL,
			copyright,
			trademark,
		} = {...transformedThis, ...params.ot};

		let font = new Font({
			familyName,
			styleName,
			version,
			ascender,
			descender,
			description,
			fullName,
			designer,
			designerURL,
			manufacturer,
			manufacturerURL,
			license,
			licenseURL,
			copyright,
			trademark,
		});*/

		const glyphs = _.reduce(subset, (result, name) => {
			result[name] = this.glyphs[name].constructGlyph(localParams);
			return result;
		}, {});

		return glyphs;
	}
}

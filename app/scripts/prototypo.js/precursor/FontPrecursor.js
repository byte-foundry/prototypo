import _mapValues from 'lodash/mapValues';
import _forOwn from 'lodash/forOwn';

import {constantOrFormula} from '../utils/generic';

import Glyph from './Glyph';

const keyToTransform = [
	'familyName',
	'version',
	'description',
	'ascender',
	'descender',
	'cap-height',
	'descendent-height',
];

export default class FontPrecursor {
	constructor(fontSrc, {resolveOp} = {resolveOp: true}) {
		const {fontinfo, lib} = fontSrc;

		keyToTransform.forEach((key) => {
			this[key] = constantOrFormula(fontinfo[key]);
		});
		this.parameters = _mapValues(lib.parameters, param =>
			constantOrFormula(param),
		);
		this.paramBase = {
			manualChanges: {},
			postDepManualChanges: {},
			altList: {},
			glyphComponentChoice: {},
		};

		this.unicodeToGlyphName = {};

		this.glyphs = _mapValues(fontSrc.glyphs, (glyph) => {
			if (glyph.name.indexOf('alt') === -1) {
				this.unicodeToGlyphName[glyph.unicode] = glyph.name;
			}

			return new Glyph(glyph, this.paramBase, {resolveOp});
		});

		// this.analyzeDependency();
	}

	analyzeDependency() {
		_forOwn(this.glyphs, (glyph) => {
			glyph.analyzeDependency();
		});
	}

	constructFont(params, subset) {
		let localParams = {
			...params,
			..._mapValues(this.parameters, param => param.getResult(params)),
			manualChanges: {
				...this.paramBase.manualChanges,
				...params.manualChanges,
			},
			postDepManualChanges: {
				...this.paramBase.postDepManualChanges,
				...params.postDepManualChanges,
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
		const transformedThis = {};
		const glyphNames = [];
		const glyphs = [];

		for (let i = 0; i < keyToTransform.length; i++) {
			const key = keyToTransform[i];
			const prop = this[key];

			transformedThis[key] = prop.getResult(localParams);
		}

		for (let i = 0; i < subset.length; i++) {
			const char = subset[i];
			const altOrDefault
				= localParams.altList[char] || this.unicodeToGlyphName[char];

			glyphNames.push(altOrDefault);
		}

		for (let i = 0; i < glyphNames.length; i++) {
			const name = glyphNames[i];
			const indivParam = {...params};

			if (name !== undefined) {
				if (localParams.indiv_glyphs) {
					const group
						= localParams.indiv_glyphs[this.glyphs[name].unicode.value];

					if (group) {
						const indivModifs = localParams.indiv_group_param[group];
						const keys = Object.keys(indivModifs);

						for (let j = 0; j < keys.length; j++) {
							const param = keys[j].substr(0, keys[j].length - 4);
							const mod = indivModifs[keys[j]];

							indivParam[param]
								= mod.state === 'relative'
									? params[param] * mod.value
									: params[param] + mod.value;
						}
					}

					localParams = {
						...localParams,
						...indivParam,
						..._mapValues(this.parameters, param =>
							param.getResult(indivParam),
						),
						manualChanges: {
							...this.paramBase.manualChanges,
							...localParams.manualChanges,
						},
						postDepManualChanges: {
							...this.paramBase.postDepManualChanges,
							...params.postDepManualChanges,
						},
						glyphComponentChoice: {
							...this.paramBase.glyphComponentChoice,
							...localParams.glyphComponentChoice,
						},
						altList: {
							...this.paramBase.altList,
							...localParams.altList,
						},
					};
				}

				if (this.glyphs[name]) {
					glyphs.push(
						this.glyphs[name].constructGlyph(
							{...localParams},
							undefined,
							this.glyphs,
						),
					);
				}
			}
		}

		return {
			...transformedThis,
			glyphs,
		};
	}
}

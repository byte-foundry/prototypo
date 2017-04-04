import {constantOrFormula} from '../helpers/values.js';

export default class Component {
	constructor(source, cursor) {
		if (Array.isArray(source.base)) {
			this.base = _.map(source.base, (base) => {
				return constantOrFormula(base);
			});
		}
		else {
			this.base = [constantOrFormula(source.base)];
		}

		this.id = constantOrFormula(source.id);
		this.anchors = (source.anchor || []).map((item, i) => {
			return _.mapValues(item, (props, name) => {
				return constantOrFormula(props, `{cursor}.anchors.${i}.${name}`);
			});
		});
	}

	constructComponent(params, contours, parentAnchors, utils, glyphs) {
		const localParams = {
			...params,
			..._.mapValues(this.parameters, (param) => {
				return param.getResult(params);
			}),
		};
		console.log(this.base[0].value);

		let opDone = {anchors: []};

		Object.keys(this.anchors).map((key) => {
			const anchor = this.anchors[key];

			_.set(
				opDone,
				`anchors[${key}]`,
				_.reduce(Object.keys(anchor), (acc, name) => {
					acc[name] = anchor[name].getResult(localParams, contours, acc, parentAnchors, utils);
					return acc;
				}, {}),
			);
		});

		const computedBase = this.base[0].getResult(localParams, contours, opDone.anchors, parentAnchors, utils);
		const compGlyph = glyphs[computedBase];

		opDone = {
			...opDone,
			...compGlyph.constructGlyph(localParams, opDone.anchors, glyphs),
		};

		if (this.id) {
			opDone.id = this.id.getResult(localParams, contours, opDone.anchors, parentAnchors, utils);
		}


		return opDone;
	}
}

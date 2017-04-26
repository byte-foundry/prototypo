/* global _*/
import {transformNode} from '../helpers/utils.js';
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

		this.transforms = constantOrFormula(source.transforms);
		this.transformOrigin = constantOrFormula(source.transformOrigin);
	}

	constructComponent(params, contours, parentAnchors, utils, glyphs) {
		const localParams = {
			...params,
			..._.mapValues(this.parameters, (param) => {
				return param.getResult(params);
			}),
		};

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

		const transformedThis = _.mapValues(this, (prop, name) => {
			if (prop !== undefined
				&& name !== 'anchors'
				&& name !== 'base'
				&& name !== 'components'
				&& name !== 'operationOrder') {
				return prop.getResult(localParams, contours, parentAnchors, utils, glyphs);
			}
		});


		opDone = {
			...opDone,
			...compGlyph.constructGlyph(localParams, opDone.anchors, glyphs),
			...transformedThis,
		};

		if (transformedThis.transforms) {
			opDone.contours.forEach((contour) => {
				contour.nodes.forEach((node) => {
					if (node.expandedTo) {
						transformNode(node.expandedTo[0], transformedThis.transforms, transformedThis.transformOrigin);
						transformNode(node.expandedTo[1], transformedThis.transforms, transformedThis.transformOrigin);
					}
					else {
						transformNode(node, transformedThis.transforms, transformedThis.transformOrigin);
					}
				});
			});
		}

		return opDone;
	}
}

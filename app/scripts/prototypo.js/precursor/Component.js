import _mapValues from 'lodash/mapValues';

import {constantOrFormula} from '../utils/generic';

const keyToTransform = [
	'id',
	'transforms',
	'transformOrigin',
	'componentClass',
];

export default class Component {
	constructor(source) {
		if (Array.isArray(source.base)) {
			this.base = source.base.map(base => constantOrFormula(base));
		}
		else {
			this.base = [constantOrFormula(source.base)];
		}

		this.parameters = _mapValues(source.parameters, param =>
			constantOrFormula(param),
		);
		this.id = constantOrFormula(source.id);
		this.componentClass = constantOrFormula(source.class);
		this.anchors = (source.anchor || []).map((item, i) =>
			_mapValues(item, (props, name) =>
				constantOrFormula(props, `anchors.${i}.${name}`),
			),
		);

		this.transforms = constantOrFormula(source.transforms);
		this.transformOrigin = constantOrFormula(source.transformOrigin);
	}

	constructComponent(
		params,
		contours,
		parentAnchors,
		utils,
		glyphs,
		parentTransformTuple,
	) {
		const localParams = {
			...params,
			..._mapValues(this.parameters, param =>
				param.getResult(params, contours, [], parentAnchors, utils),
			),
		};

		let opDone = {anchors: []};

		for (let i = 0; i < Object.keys(this.anchors).length; i++) {
			const key = Object.keys(this.anchors)[i];
			const anchor = this.anchors[key];
			const accumulator = {};
			const anchorKeys = Object.keys(anchor);

			for (let j = 0; j < anchorKeys.length; j++) {
				const name = anchorKeys[j];

				accumulator[name] = anchor[name].getResult(
					localParams,
					contours,
					accumulator,
					parentAnchors,
					utils,
				);
			}

			opDone.anchors[key] = accumulator;
		}

		const computedBase
			= params.componentChoice
			|| this.base[0].getResult(
				localParams,
				contours,
				opDone.anchors,
				parentAnchors,
				utils,
			);
		const compGlyph = glyphs[computedBase];

		const transformedThis = {};

		for (let i = 0; i < keyToTransform.length; i++) {
			const key = keyToTransform[i];
			const prop = this[key];

			transformedThis[key] = prop.getResult(
				localParams,
				contours,
				parentAnchors,
				utils,
				glyphs,
			);
		}

		const computedBaseArray = [];

		for (let i = 0; i < this.base.length; i++) {
			const base = this.base[i];

			const componentId = base.getResult(
				localParams,
				contours,
				parentAnchors,
				utils,
				glyphs,
			);

			computedBaseArray.push({
				id: componentId,
				label: glyphs[componentId].componentLabel,
				componentClass: this.componentClass
					? this.componentClass.value
					: undefined,
			});
		}
		transformedThis.base = computedBaseArray;

		opDone = {
			...opDone,
			...compGlyph.constructGlyph(localParams, opDone.anchors, glyphs, [
				[transformedThis.transforms || [], transformedThis.transformOrigin],
				...parentTransformTuple,
			]),
			...transformedThis,
		};

		return opDone;
	}
}

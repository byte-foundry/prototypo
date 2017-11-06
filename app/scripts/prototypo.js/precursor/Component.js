import _mapValues from 'lodash/mapValues';
import _set from 'lodash/set';
import _reduce from 'lodash/reduce';

import {constantOrFormula} from '../helpers/values';

export default class Component {
	constructor(source) {
		if (Array.isArray(source.base)) {
			this.base = source.base.map(base => constantOrFormula(base));
		}
		else {
			this.base = [constantOrFormula(source.base)];
		}

		this.parameters = _mapValues(source.parameters, param => constantOrFormula(param));
		this.id = constantOrFormula(source.id);
		this.anchors = (source.anchor || []).map(
			(item, i) => _mapValues(
				item,
				(props, name) => constantOrFormula(props, `{cursor}.anchors.${i}.${name}`),
			),
		);

		this.transforms = constantOrFormula(source.transforms);
		this.transformOrigin = constantOrFormula(source.transformOrigin);
	}

	constructComponent(params, contours, parentAnchors, utils, glyphs, parentTransformTuple) {
		const localParams = {
			...params,
			..._mapValues(this.parameters,
				param => param.getResult(params),
			),
		};

		let opDone = {anchors: []};

		Object.keys(this.anchors).forEach((key) => {
			const anchor = this.anchors[key];

			_set(
				opDone,
				`anchors[${key}]`,
				_reduce(Object.keys(anchor), (acc, name) => {
					acc[name] = anchor[name].getResult(localParams, contours, acc, parentAnchors, utils);
					return acc;
				}, {}),
			);
		});

		const computedBase = params.componentChoice || this.base[0].getResult(
			localParams,
			contours,
			opDone.anchors,
			parentAnchors,
			utils,
		);
		const compGlyph = glyphs[computedBase];

		const transformedThis = _mapValues(this, (prop, name) => {
			if (prop !== undefined
				&& name !== 'anchors'
				&& name !== 'base'
				&& name !== 'components'
				&& name !== 'parameters'
				&& name !== 'operationOrder') {
				return prop.getResult(localParams, contours, parentAnchors, utils, glyphs);
			}
			else if (name === 'base') {
				return prop.map(
					base => ({
						id: base.getResult(localParams, contours, parentAnchors, utils, glyphs),
						label: glyphs[base.getResult(
							localParams,
							contours,
							parentAnchors,
							utils,
							glyphs,
						)].componentLabel,
					}),
				);
			}

			return undefined;
		});


		opDone = {
			...opDone,
			...compGlyph.constructGlyph(
				localParams,
				opDone.anchors,
				glyphs,
				[
					[transformedThis.transforms || [], transformedThis.transformOrigin],
					...parentTransformTuple,
				],
			),
			...transformedThis,
		};

		return opDone;
	}
}

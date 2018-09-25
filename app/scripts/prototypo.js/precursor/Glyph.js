import _chunk from 'lodash/chunk';
import _mapValues from 'lodash/mapValues';
import _reduce from 'lodash/reduce';
import _forOwn from 'lodash/forOwn';
import _flatMap from 'lodash/flatMap';
import _reverse from 'lodash/reverse';
import _get from 'lodash/get';
import _set from 'lodash/set';
import memoize from 'memoize-immutable';

import {
	constantOrFormula,
	createContour,
	transformGlyph,
	memoizeSplit,
} from '../utils/generic';
import * as utils from '../utils/updateUtils';

import Component from './Component';
import ExpandingNode from './ExpandingNode';
import {SkeletonPath, SimplePath, ClosedSkeletonPath} from './Path';

function getFromGlyphAndXPath(glyph, path) {
	let result;

	let pathArray = memoizeSplit(path);

	if (pathArray.length === 1) {
		result = glyph[pathArray[0]];
	}
	else if (pathArray.length > 1) {
		result = glyph[pathArray[0]];
		pathArray = pathArray.slice(1, pathArray.length);

		pathArray.forEach((propName) => {
			if (
				!(
					(!result[propName] || result[propName] === null)
					&& result.solveOperationOrder instanceof Function
				)
			) {
				result = result[propName];
			}
		});
	}

	if (!(result.solveOperationOrder instanceof Function)) {
		console.error(
			`While trying to solve ${
				this.name.value
			} operation order, couldn't find ${path}`,
		); // eslint-disable-line no-console, max-len
	}
	return result;
}

const memGetFromXPath = memoize(getFromGlyphAndXPath);

/* eslint-disable */
function checkAndChangeOrient(beziers, clockwise) {
	var result = [];

	for (var i = 0; i < beziers.length; i++) {
		var bezier = beziers[i];
		var count = 0;
		var flatBezier = [];

		for (var k = 0; k < bezier.length; k++) {
			Array.prototype.push.apply(flatBezier, bezier[k]);
		}

		for (var j = 0; j < flatBezier.length; j++) {
			var point = flatBezier[j];
			var next = flatBezier[(j + 1) % flatBezier.length];

			count += (next.x - point.x) * (next.y + point.y);
		}

		if ((count > 0 && clockwise) || (count < 0 && !clockwise)) {
			result.push(_chunk(flatBezier.reverse(), 4));
		} else {
			result.push(bezier);
		}
	}

	return result;
}
/* eslint-enable */

const keyToTransform = [
	'unicode',
	'name',
	'componentLabel',
	'characterName',
	'tags',
	'transforms',
	'transformOrigin',
	'base',
	'global',
];

export default class Glyph {
	constructor(glyphSrc, paramBase, {resolveOp}) {
		const {name, parameter, anchor, outline, base} = glyphSrc;

		paramBase.manualChanges[name] = {
			// eslint-disable-line no-param-reassign
			cursors: {},
		};
		paramBase.postDepManualChanges[name] = {
			// eslint-disable-line no-param-reassign
			cursors: {},
		};

		if (base !== undefined) {
			paramBase.manualChanges[base] = {
				// eslint-disable-line no-param-reassign
				cursors: {},
			};
			paramBase.postDepManualChanges[base] = {
				// eslint-disable-line no-param-reassign
				cursors: {},
			};
		}

		paramBase.glyphComponentChoice[name] = {}; // eslint-disable-line no-param-reassign

		keyToTransform.forEach((key) => {
			this[key] = constantOrFormula(glyphSrc[key]);
		});

		this.parameters = _mapValues(parameter, param =>
			constantOrFormula(param),
		);
		this.paramKeys = Object.keys(this.parameters);
		this.contours = outline.contour.map((contour, i) =>
			createContour(contour, i),
		);
		this.anchors = (anchor || []).map((item, i) =>
			_mapValues(item, (props, anchorName) =>
				constantOrFormula(props, `anchors.${i}.${anchorName}`),
			),
		);
		this.anchorKeys = Object.keys(this.anchors);

		// this.analyzeDependency();
		if (glyphSrc.operationOrder) {
			this.operationOrder = glyphSrc.operationOrder;
		}
		else {
			this.operationOrder = this.solveOperationOrder();
		}

		if (resolveOp) {
			this.resolveOperationTarget();
		}

		this.components = outline.component.map((component, i) => {
			const componentObject = new Component(component, `component.${i}`, this);

			componentObject.base.forEach((compBase) => {
				paramBase.manualChanges[compBase.value] = {
					cursors: {},
				};
			});
			return componentObject;
		});
		this.componentsName = this.components.map((c, i) => `components.${i}`);

		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (typeof op !== 'object') {
				const obj = this.getFromXPath(op);

				if (obj.dependencies) {
					_set(this.dependencyTree, op, obj.dependencies);
				}
			}
		}

		if (glyphSrc.ot) {
			this.advanceWidth = constantOrFormula(glyphSrc.ot.advanceWidth);
		}
	}

	solveOperationOrder() {
		const contourOp = _reduce(
			this.contours,
			(result, contour) => {
				result.push(...contour.solveOperationOrder(this, result));
				return result;
			},
			[],
		);

		return _reduce(
			this.anchors,
			(acc, anchor) => {
				const anchorOp = [...acc];

				_forOwn(anchor, (prop) => {
					anchorOp.push(...prop.solveOperationOrder(this, anchorOp));
				});

				return anchorOp;
			},
			contourOp,
		);
	}

	resolveOperationTarget() {
		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (typeof op !== 'object') {
				this.operationOrder[i] = this.getFromXPath(op);
			}
		}
	}

	createGlyphContour(contours) {
		const beziers = _flatMap(contours, (contour) => {
			if (!contour.skeleton) {
				const otBeziers = [
					contour.nodes.map((node, i) => {
						const nextNode = contour.nodes[(i + 1) % contour.nodes.length];

						const bezier = [
							{
								x: node.x,
								y: node.y,
							},
							{
								x: node.handleOut.x,
								y: node.handleOut.y,
							},
							{
								x: nextNode.handleIn.x,
								y: nextNode.handleIn.y,
							},
							{
								x: nextNode.x,
								y: nextNode.y,
							},
						];

						return bezier;
					}),
				];

				return checkAndChangeOrient(otBeziers, true);
			}
			else if (!contour.closed) {
				const otBeziers = [
					contour.nodes.reduceRight((acc, node, i) => {
						const bezier = [0, 1].map((index) => {
							let secondIndex = index;
							let firstIndex = i + 1 * (index ? -1 : 1);

							if (firstIndex > contour.nodes.length - 1) {
								firstIndex = contour.nodes.length - 1;
								secondIndex = 1;
							}
							else if (firstIndex < 0) {
								firstIndex = 0;
								secondIndex = 0;
							}

							const nextNode
								= contour.nodes[firstIndex].expandedTo[secondIndex];

							return [
								{
									x: node.expandedTo[index].x,
									y: node.expandedTo[index].y,
								},
								{
									x: node.expandedTo[index].handleOut.x,
									y: node.expandedTo[index].handleOut.y,
								},
								{
									x: nextNode.handleIn.x,
									y: nextNode.handleIn.y,
								},
								{
									x: nextNode.x,
									y: nextNode.y,
								},
							];
						});

						acc.push(bezier[1]);
						acc.unshift(bezier[0]);

						return acc;
					}, []),
				];

				return checkAndChangeOrient(otBeziers, true);
			}
			const otBeziers = [0, 1].map((index) => {
				const result = contour.nodes.map((node, i) => {
					const nextNode
						= contour.nodes[
							i
								+ 1
								- contour.nodes.length
									* Math.floor((i + 1) / contour.nodes.length)
						].expandedTo[index];
					const handleOut = index
						? node.expandedTo[index].handleIn
						: node.expandedTo[index].handleOut;
					const handleIn = index ? nextNode.handleOut : nextNode.handleIn;
					const bezier = [
						{
							x: node.expandedTo[index].x,
							y: node.expandedTo[index].y,
						},
						handleOut,
						handleIn,
						{
							x: nextNode.x,
							y: nextNode.y,
						},
					];

					if (index) {
						return _reverse(bezier);
					}
					return bezier;
				});

				if (index) {
					return _reverse(result);
				}
				return result;
			});

			return [
				...checkAndChangeOrient([otBeziers[0]], true),
				...checkAndChangeOrient([otBeziers[1]], false),
			];
		});

		return beziers;
	}

	getFromXPath(path) {
		return memGetFromXPath(this, path);
	}

	analyzeDependency(graph) {
		_forOwn(this, (value) => {
			if (value !== undefined) {
				if (typeof value.analyzeDependency === 'function') {
					value.analyzeDependency(this, graph);
				}
				else if (Array.isArray(value)) {
					value.forEach((item) => {
						if (typeof item.analyzeDependency === 'function') {
							item.analyzeDependency(this, graph);
						}
						else if (typeof item === 'object' && item !== null) {
							_forOwn(item, (prop) => {
								if (typeof prop.analyzeDependency === 'function') {
									prop.analyzeDependency(this, graph);
								}
							});
						}
					});
				}
				else if (typeof value === 'object' && value !== null) {
					_forOwn(value, (val) => {
						if (typeof val.analyzeDependency === 'function') {
							val.analyzeDependency(this, graph);
						}
					});
				}
			}
		});
	}

	handleHandleOp({cursor}, opDone, params) {
		const contour = this.getFromXPath(cursor);
		const dest = _get(opDone, cursor);

		if (contour.skeleton.value) {
			SkeletonPath.correctValues(dest);

			if (contour.closed.value) {
				ClosedSkeletonPath.createHandle(
					dest,
					params.manualChanges[this.name.value].cursors,
					params.curviness,
				);
			}
			else {
				SkeletonPath.createHandle(
					dest,
					params.manualChanges[this.name.value].cursors,
					params.curviness,
				);
			}
		}
		else {
			SimplePath.correctValues(dest);

			_set(opDone, `${cursor}.checkOrientation`, true);

			SimplePath.createHandle(
				dest,
				params.manualChanges[this.name.value].cursors,
				params.curviness,
			);
		}
	}

	handleExpandOp({cursor}, opDone, params) {
		const manualChanges = params.manualChanges[this.name.value].cursors;
		const node = ExpandingNode.applyExpandChange(
			_get(opDone, cursor),
			manualChanges,
			cursor,
		);
		const expandedTo = ExpandingNode.expand(node);

		_set(opDone, `${cursor}.expandedTo`, expandedTo);
	}

	handleOp(obj, opDone, localParams, parentAnchors) {
		const op = obj.cursor;
		let result = obj.getResult(
			localParams,
			opDone.contours,
			opDone.anchors,
			parentAnchors,
			utils,
		);
		const option = op.substr(op.length - 2);

		if (option === '.x' || option === '.y') {
			_set(opDone, `${op}Base`, result);

			const manualChanges
				= localParams.manualChanges[this.name.value].cursors[op] || 0;

			result += manualChanges;
		}

		_set(opDone, op, result);
	}

	constructGlyph(
		params,
		parentAnchors,
		glyphs,
		parentTransformTuple = [[[], undefined]],
	) {
		const localParams = {};
		const paramKeys = Object.keys(params);
		const thisParamKeys = this.paramKeys;

		for (let i = 0; i < paramKeys.length; i++) {
			localParams[paramKeys[i]] = params[paramKeys[i]];
		}
		localParams.manualChanges = {
			[this.name.value]: {
				cursors: {},
			},
		};
		localParams.postDepManualChanges = {
			[this.name.value]: {
				cursors: {},
			},
		};

		const manualParamKeys = Object.keys(
			params.manualChanges[this.name.value].cursors,
		);

		const postDepManualParamKeys = Object.keys(
			params.postDepManualChanges[this.name.value].cursors,
		);

		for (let i = 0; i < manualParamKeys.length; i++) {
			localParams.manualChanges[this.name.value].cursors[manualParamKeys[i]]
				= params.manualChanges[this.name.value].cursors[manualParamKeys[i]];
		}

		for (let i = 0; i < thisParamKeys.length; i++) {
			localParams[thisParamKeys[i]] = this.parameters[
				thisParamKeys[i]
			].getResult(localParams);
		}

		for (let i = 0; i < postDepManualParamKeys.length; i++) {
			localParams.postDepManualChanges[this.name.value].cursors[
				postDepManualParamKeys[i]
			]
				= params.postDepManualChanges[this.name.value].cursors[
					postDepManualParamKeys[i]
				];
		}

		if (this.base.value !== undefined) {
			const manualParamsKeys = Object.keys(
				params.manualChanges[this.base.value].cursors,
			);

			for (let i = 0; i < manualParamsKeys.length; i++) {
				localParams.manualChanges[this.name.value].cursors[
					manualParamsKeys[i]
				]
					= params.manualChanges[this.base.value].cursors[manualParamsKeys[i]]
					+ (params.manualChanges[this.name.value].cursors[manualParamsKeys[i]]
						|| 0);
			}

			const postDepManualParamsKeys = Object.keys(
				params.postDepManualChanges[this.base.value].cursors,
			);

			for (let i = 0; i < postDepManualParamsKeys.length; i++) {
				localParams.postDepManualChanges[this.name.value].cursors[
					postDepManualParamsKeys[i]
				]
					= params.postDepManualChanges[this.base.value].cursors[
						postDepManualParamsKeys[i]
					]
					+ (params.postDepManualChanges[this.name.value].cursors[
						postDepManualParamsKeys[i]
					] || 0);
			}
		}

		const specialProps = this.unicode
			? (localParams.glyphSpecialProps || {})[this.unicode.value] || {}
			: {};
		const baseSpacingLeft = localParams.spacingLeft;
		const baseSpacingRight = localParams.spacingRight;
		const transformedThis = {};

		localParams.spacingLeft += specialProps.spacingLeft || 0;
		localParams.spacingRight += specialProps.spacingRight || 0;

		const opDone = {
			contours: [],
			anchors: [],
			components: [],
		};

		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (op.action === 'handle') {
				this.handleHandleOp(op, opDone, localParams);
			}
			else if (op.action === 'expand') {
				this.handleExpandOp(op, opDone, localParams);
			}
			else {
				this.handleOp(op, opDone, localParams, parentAnchors);
			}
		}

		const localParamsKeys = Object.keys(
			localParams.postDepManualChanges[this.name.value].cursors,
		);

		for (let i = 0; i < localParamsKeys.length; i++) {
			const cursor = localParamsKeys[i];
			const parentCursor = cursor.substr(0, cursor.length - 2);
			const downCursor = cursor.substr(-1);

			const obj = _get(opDone, parentCursor);

			if (obj) {
				obj[downCursor]
					+= localParams.postDepManualChanges[this.name.value].cursors[cursor];
			}
		}

		const opAnchors = opDone.anchors;
		const anchorsKeys = this.anchorKeys;

		for (let i = 0; i < anchorsKeys.length; i++) {
			const key = anchorsKeys[i];
			const anchor = this.anchors[key];

			const anchorKeys = Object.keys(anchor);

			for (let j = 0; j < anchorKeys.length; j++) {
				const name = anchorKeys[j];
				const computedAnchor
					= opAnchors[key][name]
					|| anchor[name].getResult(
						localParams,
						opDone.contours,
						opAnchors,
						parentAnchors,
						utils,
					);

				opAnchors[key][name] = computedAnchor;
			}
		}

		for (let i = 0; i < keyToTransform.length; i++) {
			const key = keyToTransform[i];
			const prop = this[key];

			transformedThis[key] = prop.getResult(
				localParams,
				opDone.contours,
				opDone.anchors,
				utils,
				glyphs,
			);
		}

		if (this.advanceWidth) {
			transformedThis.advanceWidth = this.advanceWidth.getResult(
				localParams,
				opDone.contours,
				opDone.anchors,
				utils,
				glyphs,
			);
		}

		const transforms = [];

		transforms.push([
			transformedThis.transforms || [],
			transformedThis.transformOrigin,
		]);
		Array.prototype.push.apply(transforms, parentTransformTuple);

		for (let idx = 0; idx < this.components.length; idx++) {
			const component = this.components[idx];
			const componentManualChanges = {};
			const componentPostDepManualChanges = {};
			const glyphManualChanges
				= localParams.manualChanges[this.name.value].cursors;
			const glyphPostDepManualChanges
				= localParams.postDepManualChanges[this.name.value].cursors;

			let componentName = component.base[0].value;

			if (
				component.id
				&& localParams.glyphComponentChoice[this.name.value][component.id.value]
			) {
				componentName
					= localParams.glyphComponentChoice[this.name.value][component.id.value];
			}
			else if (
				component.componentClass
				&& localParams.glyphComponentChoice[component.componentClass.value]
			) {
				componentName
					= localParams.glyphComponentChoice[component.componentClass.value];
			}

			// We all know this is ugly AF however runing a function is cost intensive and
			// we can't really afford anything here
			// We could develop a inliner transform
			const keys = Object.keys(glyphManualChanges);

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];

				const criteria = `components.${idx}`;

				if (key.indexOf(criteria) !== -1) {
					componentManualChanges[key.substr(criteria.length + 1)]
						= glyphManualChanges[key];
				}
			}

			const globalComponentChange = (
				params.manualChanges[componentName] || {cursors: {}}
			).cursors;
			const globalCompChangeKeys = Object.keys(globalComponentChange);

			for (let i = 0; i < globalCompChangeKeys.length; i++) {
				const globalCompChangeKey = globalCompChangeKeys[i];

				const criteria = `components.${idx}`;

				componentManualChanges[
					globalCompChangeKey.substr(criteria.length + 1)
				]
					= (componentManualChanges[
						globalCompChangeKey.substr(criteria.length + 1)
					] || 0) + globalComponentChange[globalCompChangeKey];
			}

			const postDepKeys = Object.keys(glyphPostDepManualChanges);

			for (let i = 0; i < postDepKeys.length; i++) {
				const key = postDepKeys[i];

				const criteria = `components.${idx}`;

				if (key.indexOf(criteria) !== -1) {
					componentPostDepManualChanges[key.substr(criteria.length + 1)]
						= glyphPostDepManualChanges[key];
				}
			}

			const globalPostDepComponentChange = (
				params.postDepManualChanges[componentName] || {cursors: {}}
			).cursors;
			const globalPostDepCompChangeKeys = Object.keys(
				globalPostDepComponentChange,
			);

			for (let i = 0; i < globalPostDepCompChangeKeys.length; i++) {
				const globalPostDepCompChangeKey = globalPostDepCompChangeKeys[i];

				const criteria = `components.${idx}`;

				componentPostDepManualChanges[
					globalPostDepCompChangeKey.substr(criteria.length + 1)
				]
					= (componentPostDepManualChanges[
						globalPostDepCompChangeKey.substr(criteria.length + 1)
					] || 0) + globalPostDepComponentChange[globalPostDepCompChangeKey];
			}

			const componentParams = {};
			const localParamsKeys = Object.keys(localParams);

			for (let i = 0; i < localParamsKeys.length; i++) {
				componentParams[localParamsKeys[i]] = localParams[localParamsKeys[i]];
			}

			componentParams.manualChanges[componentName] = {
				cursors: componentManualChanges,
			};
			componentParams.postDepManualChanges[componentName] = {
				cursors: componentPostDepManualChanges,
			};
			componentParams.componentChoice = componentName;

			opDone.components.push(
				component.constructComponent(
					componentParams,
					opDone.contours,
					opDone.anchors,
					utils,
					glyphs,
					transforms,
				),
			);
		}

		transformGlyph(opDone, transforms);

		const otContours = this.createGlyphContour(opDone.contours);

		for (let i = 0; i < opDone.components.length; i++) {
			if (opDone.components[i].name !== 'none') {
				Array.prototype.push.apply(otContours, opDone.components[i].otContours);
			}
		}

		return {
			...transformedThis,
			...opDone,
			spacingLeft: localParams.spacingLeft,
			spacingRight: localParams.spacingRight,
			componentLabel: this.componentLabel
				? this.componentLabel.value
				: undefined,
			baseSpacingRight,
			baseSpacingLeft,
			dependencyTree: this.dependencyTree,
			otContours,
		};
	}
}

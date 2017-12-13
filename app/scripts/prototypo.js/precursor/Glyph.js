import _flatten from 'lodash/flatten';
import _chunk from 'lodash/chunk';
import _mapValues from 'lodash/mapValues';
import _reduce from 'lodash/reduce';
import _forOwn from 'lodash/forOwn';
import _flatMap from 'lodash/flatMap';
import _reverse from 'lodash/reverse';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _pickBy from 'lodash/pickBy';
import _mapKeys from 'lodash/mapKeys';

import {constantOrFormula, createContour, transformGlyph} from '../utils/generic';
import * as utils from '../utils/updateUtils';

import Component from './Component';
import ExpandingNode from './ExpandingNode';
import {SkeletonPath, SimplePath, ClosedSkeletonPath} from './Path';

function checkAndChangeOrient(beziers, clockwise) {
	return beziers.map((bezier) => {
		let count = 0;
		const flatBezier = _flatten(bezier);

		flatBezier.forEach((point, i) => {
			const next = flatBezier[(i + 1) % flatBezier.length];

			count += (next.x - point.x) * (next.y + point.y);
		});

		if ((count > 0 && clockwise) || (count < 0 && !clockwise)) {
			return _chunk(_reverse(flatBezier), 4);
		}
		return bezier;
	});
}


export default class Glyph {
	constructor(glyphSrc, paramBase) {
		const {
			unicode,
			name,
			characterName,
			tags,
			transforms,
			parameter,
			anchor,
			outline,
			transformOrigin,
			componentLabel,
		} = glyphSrc;

		paramBase.manualChanges[name] = { // eslint-disable-line no-param-reassign
			cursors: {},
		};

		paramBase.glyphComponentChoice[name] = {}; // eslint-disable-line no-param-reassign

		this.unicode = constantOrFormula(unicode);
		this.name = constantOrFormula(name);
		this.componentLabel = constantOrFormula(componentLabel);
		this.characterName = constantOrFormula(characterName);
		this.tags = constantOrFormula(tags);
		this.transforms = constantOrFormula(transforms);
		this.transformOrigin = constantOrFormula(transformOrigin);
		this.parameters = _mapValues(parameter, param => constantOrFormula(param));
		this.contours = outline.contour.map((contour, i) => createContour(contour, i));
		this.anchors = (anchor || []).map(
			(item, i) => _mapValues(
				item,
				(props, anchorName) => constantOrFormula(props, `anchors.${i}.${anchorName}`),
			),
		);

		this.analyzeDependency();
		this.operationOrder = this.solveOperationOrder();

		this.components = outline.component.map(
			(component, i) => new Component(component, `component.${i}`, this),
		);

		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (typeof op !== 'object') {
				const obj = this.getFromXPath(op);

				if (obj.dependencies) {
					_set(
						this.dependencyTree,
						op,
						obj.dependencies,
					);
				}
			}
		}

		if (glyphSrc.ot) {
			this.advanceWidth = constantOrFormula(glyphSrc.ot.advanceWidth);
		}
	}

	solveOperationOrder() {
		const contourOp = _reduce(this.contours, (result, contour) => {
			result.push(...contour.solveOperationOrder(this, result));
			return result;
		}, []);

		return _reduce(this.anchors, (acc, anchor) => {
			const anchorOp = [...acc];

			_forOwn(anchor, (prop) => {
				anchorOp.push(...prop.solveOperationOrder(this, anchorOp));
			});

			return anchorOp;
		}, contourOp);
	}

	createGlyphContour(contours) {
		const beziers = _flatMap(contours, (contour) => {
			if (!contour.skeleton) {
				const otBeziers = [contour.nodes.map((node, i) => {
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
				})];

				return checkAndChangeOrient(otBeziers, true);
			}
			else if (!contour.closed) {
				const otBeziers = [contour.nodes.reduceRight((acc, node, i) => {
					const bezier = [0, 1].map((index) => {
						let secondIndex = index;
						let firstIndex = i + (1 * (index ? -1 : 1));

						if (firstIndex > contour.nodes.length - 1) {
							firstIndex = contour.nodes.length - 1;
							secondIndex = 1;
						}
						else if (firstIndex < 0) {
							firstIndex = 0;
							secondIndex = 0;
						}

						const nextNode = contour.nodes[firstIndex].expandedTo[secondIndex];

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
				}, [])];

				return checkAndChangeOrient(otBeziers, true);
			}
			const otBeziers = [0, 1].map((index) => {
				const result = contour.nodes.map((node, i) => {
					const nextNode = contour.nodes[
						(i + 1) - (contour.nodes.length * Math.floor((i + 1) / contour.nodes.length))
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
		let result;

		const pathArray = path.split('.');

		if (pathArray.length === 1) {
			result = this[pathArray[0]];
		}
		else if (pathArray.length > 1) {
			result = this[pathArray[0]];
			pathArray.shift();

			pathArray.forEach((propName) => {
				if (
					!((!result[propName] || result[propName] === null)
						&& result.solveOperationOrder instanceof Function)
				) {
					result = result[propName];
				}
			});
		}


		if (!(result.solveOperationOrder instanceof Function)) {
			console.error(`While trying to solve ${this.name.value} operation order, couldn't find ${path}`); // eslint-disable-line no-console, max-len
		}
		return result;
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

	handleObjectOp(op, opDone, params) {
		const {action, cursor} = op;

		if (action === 'handle') {
			const contour = this.getFromXPath(cursor);
			const dest = _get(opDone, cursor);

			if (contour.skeleton.value) {
				SkeletonPath.correctValues(dest);

				if (contour.closed.value) {
					ClosedSkeletonPath.createHandle(dest, params.manualChanges[this.name.value].cursors);
				}
				else {
					SkeletonPath.createHandle(dest, params.manualChanges[this.name.value].cursors);
				}
			}
			else {
				SimplePath.correctValues(dest);

				_set(opDone, `${cursor}.checkOrientation`, true);

				SimplePath.createHandle(dest, params.manualChanges[this.name.value].cursors);
			}
		}
		else if (action === 'expand') {
			const manualChanges = params.manualChanges[this.name.value].cursors;
			const node = ExpandingNode.applyExpandChange(
				_get(opDone, cursor),
				manualChanges,
				cursor,
			);
			const expandedTo = ExpandingNode.expand(node);

			_set(
				opDone,
				`${cursor}.expandedTo`,
				expandedTo,
			);
		}
	}

	handleOp(op, opDone, params, localParams, parentAnchors) {
		const obj = this.getFromXPath(op);
		let result = obj.getResult(localParams,
			opDone.contours,
			opDone.anchors,
			parentAnchors,
			utils);
		const option = op.substr(op.length - 2);

		if (option === '.x' || option === '.y') {
			_set(
				opDone,
				`${op}Base`,
				result,
			);

			const manualChanges
				= params.manualChanges[this.name.value].cursors[op] || 0;

			result += manualChanges;
		}

		_set(
			opDone,
			op,
			result,
		);
	}

	constructGlyph(params, parentAnchors, glyphs, parentTransformTuple = [[[], undefined]]) {
		const localParams = {
			...params,
			..._mapValues(this.parameters, param => param.getResult(params)),
		};
		const specialProps = this.unicode
			? (localParams.glyphSpecialProps || {})[this.unicode.value] || {}
			: {};
		const baseSpacingLeft = localParams.spacingLeft;
		const baseSpacingRight = localParams.spacingRight;

		localParams.spacingLeft += specialProps.spacingLeft || 0;
		localParams.spacingRight += specialProps.spacingRight || 0;

		const opDone = {
			contours: [],
		};


		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (typeof op === 'object') {
				this.handleObjectOp(op, opDone, params);
			}
			else {
				this.handleOp(op, opDone, params, localParams, parentAnchors);
			}
		}

		const opAnchors = [...(opDone.anchors || [])];

		Object.keys(this.anchors).forEach((key) => {
			const anchor = this.anchors[key];
			const ref = opAnchors[key];

			opDone.anchors[key] = _reduce(Object.keys(anchor), (acc, name) => {
				if (opDone.anchors[key][name]) {
					acc[name] = ref[name];
				}
				else {
					acc[name] = anchor[name].getResult(
						localParams,
						opDone.contours,
						opAnchors,
						parentAnchors,
						utils,
					);
				}

				return acc;
			}, opAnchors[key]);
		});


		const transformedThis = _mapValues(this, (prop, name) => {
			if (prop !== undefined
				&& !/parameters|contours|anchors|components|operationOrder/.test(name)) {
				return prop.getResult(localParams, opDone.contours, opDone.anchors, utils, glyphs);
			}

			return undefined;
		});

		const transforms = [
			[transformedThis.transforms || [], transformedThis.transformOrigin],
			...parentTransformTuple,
		];

		opDone.components = this.components.map((component, idx) => {
			const pickedChanges = _pickBy(localParams.manualChanges[this.name.value].cursors, (value, key) => key.match(new RegExp(`components\.${idx}`))); // eslint-disable-line no-useless-escape
			const componentManualChanges = _mapKeys(pickedChanges, (value, key) => key.replace(/components\.\d\./g, ''));
			const componentName = component.id
				&& localParams.glyphComponentChoice[this.name.value][component.id.value]
					? localParams.glyphComponentChoice[this.name.value][component.id.value]
					: component.base[0].value;

			const componentParams = {
				...localParams,
				manualChanges: {
					[componentName]: {
						cursors: componentManualChanges,
					},
				},
				componentChoice: componentName,
			};

			return component.constructComponent(
				componentParams,
				opDone.contours,
				opDone.anchors,
				utils,
				glyphs,
				transforms,
			);
		});

		transformGlyph(
			opDone,
			transforms,
		);

		const otContours = this.createGlyphContour(opDone.contours);

		opDone.components.forEach((component) => {
			if (component.name !== 'none') {
				otContours.push(...component.otContours);
			}
		});

		return {
			...transformedThis,
			...opDone,
			spacingLeft: localParams.spacingLeft,
			spacingRight: localParams.spacingRight,
			componentLabel: this.componentLabel ? this.componentLabel.value : undefined,
			baseSpacingRight,
			baseSpacingLeft,
			dependencyTree: this.dependencyTree,
			otContours,
		};
	}
}

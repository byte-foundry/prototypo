/* global _ */
import {constantOrFormula, createContour} from '../helpers/values.js';
import {toLodashPath, transformNode} from '../helpers/utils.js';
import * as utils from '../utils/updateUtils.js';

import Component from './Component.js';
import ExpandingNode from './ExpandingNode.js';
import {SkeletonPath, SimplePath, ClosedSkeletonPath} from './Path.js';

function checkAndChangeOrient(beziers, clockwise) {
	return beziers.map((bezier) => {
		let count = 0;
		const flatBezier = _.flatten(bezier);

		flatBezier.forEach((point, i) => {
			const next = flatBezier[(i + 1) % flatBezier.length];

			count += (next.x - point.x) * (next.y + point.y);
		});

		if ((count > 0 && clockwise) || (count < 0 && !clockwise)) {
			return _.chunk(_.reverse(flatBezier), 4);
		}
		else {
			return bezier;
		}
	});
}


export default class Glyph {
	constructor(glyphSrc) {
		const {unicode, name, characterName, tags, transforms, parameter, anchor, outline, transformOrigin} = glyphSrc;

		this.unicode = constantOrFormula(unicode);
		this.name = constantOrFormula(name);
		this.characterName = constantOrFormula(characterName);
		this.tags = constantOrFormula(tags);
		this.transforms = constantOrFormula(transforms);
		this.transformOrigin = constantOrFormula(transformOrigin);
		this.parameters = _.mapValues(parameter, (param) => {
			return constantOrFormula(param);
		});
		this.contours = outline.contour.map((contour, i) => {
			return createContour(contour, i);
		});
		this.anchors = (anchor || []).map((item, i) => {
			return _.mapValues(item, (props, anchorName) => {
				return constantOrFormula(props, `anchors.${i}.${anchorName}`);
			});
		});

		//this.analyzeDependency();
		this.operationOrder = this.solveOperationOrder();

		this.components = outline.component.map((component, i) => {
			return new Component(component, `component.${i}`, this);
		});

		if (glyphSrc.ot) {
			this.advanceWidth = constantOrFormula(glyphSrc.ot.advanceWidth);
		}
	}

	solveOperationOrder() {
		const contourOp = _.reduce(this.contours, (result, contour) => {
			result.push(...contour.solveOperationOrder(this, result));
			return result;
		}, []);

		return _.reduce(this.anchors, (acc, anchor) => {
			const anchorOp = [...acc];

			_.forOwn(anchor, (prop) => {
				anchorOp.push(...prop.solveOperationOrder(this, anchorOp));
			});

			return anchorOp;
		}, contourOp);
	}

	createGlyphContour(contours) {
		const beziers = _.flatMap(contours, (contour) => {
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
						let firstIndex = i + 1 * (index ? -1 : 1);

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
			else {
				const otBeziers = [0, 1].map((index) => {
					const result = contour.nodes.map((node, i) => {
						const nextNode = contour.nodes[(i + 1) - contour.nodes.length * Math.floor((i + 1) / contour.nodes.length)].expandedTo[index];
						const handleOut = index ? node.expandedTo[index].handleIn : node.expandedTo[index].handleOut;
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
							return _.reverse(bezier);
						}
						else {
							return bezier;
						}
					});

					if (index) {
						return _.reverse(result);
					}
					else {
						return result;
					}
				});

				return [
					...checkAndChangeOrient([otBeziers[0]], true),
					...checkAndChangeOrient([otBeziers[1]], false),
				];
			}
		});

		return beziers;
	}

	getFromXPath(path, caller) {
		let result = this;

		path.split('.').forEach((propName) => {
			if (!((!result[propName] || result[propName] === null) && result.solveOperationOrder instanceof Function)) {
				result = result[propName];
			}
		});

		/*if (!(result.solveOperationOrder instanceof Function)) {
			console.error(`While trying to solve ${this.name.value} operation order, couldn't find ${path} property asked by ${caller}`);
		}*/
		return result;
	}

	analyzeDependency(graph) {
		_.forOwn(this, (value) => {
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
							_.forOwn(item, (prop) => {
								if (typeof prop.analyzeDependency === 'function') {
									prop.analyzeDependency(this, graph);
								}
							});
						}
					});
				}
				else if (typeof value === 'object' && value !== null) {
					_.forOwn(value, (val) => {
						if (typeof val.analyzeDependency === 'function') {
							val.analyzeDependency(this, graph);
						}
					});
				}
			}
		});
	}


	/* eslint-disable max-depth */
	/* eslint-disable no-loop-func */
	constructGlyph(params, parentAnchors, glyphs) {
		const localParams = {
			...params,
			..._.mapValues(this.parameters, (param) => {
				return param.getResult(params);
			}),
		};

		const opDone = {};

		for (let i = 0; i < this.operationOrder.length; i++) {
			const op = this.operationOrder[i];

			if (typeof op === 'object') {
				const {action, cursor} = op;

				if (action === 'handle') {
					const contour = this.getFromXPath(cursor);

					if (contour.skeleton.value) {
						const correctedValues = SkeletonPath.correctValues(_.get(opDone, toLodashPath(cursor)), cursor);

						Object.keys(correctedValues).forEach((key) => {
							_.set(opDone, toLodashPath(key), correctedValues[key]);
						});

						if (contour.closed.value) {
							const handledValues = ClosedSkeletonPath.createHandle(_.get(opDone, toLodashPath(cursor)), cursor);

							Object.keys(handledValues).forEach((key) => {
								_.set(opDone, toLodashPath(key), handledValues[key]);
							});
						}
						else {
							const handledValues = SkeletonPath.createHandle(_.get(opDone, toLodashPath(cursor)), cursor);

							Object.keys(handledValues).forEach((key) => {
								_.set(opDone, toLodashPath(key), handledValues[key]);
							});
						}
					}
					else {
						const lodashCursor = toLodashPath(cursor);
						const correctedValues = SimplePath.correctValues(_.get(opDone, lodashCursor), cursor);

						_.set(opDone, `${lodashCursor}.checkOrientation`, true);

						Object.keys(correctedValues).forEach((key) => {
							_.set(opDone, toLodashPath(key), correctedValues[key]);
						});

						const handledValues = SimplePath.createHandle(_.get(opDone, toLodashPath(cursor)), cursor);

						Object.keys(handledValues).forEach((key) => {
							_.set(opDone, toLodashPath(key), handledValues[key]);
						});
					}
				}
				else if (action === 'expand') {
					const manualChanges = (params.manualChanges[this.name.value] || {}).cursors || {};
					const node = ExpandingNode.applyExpandChange(
						_.get(opDone, toLodashPath(cursor)),
						manualChanges,
						cursor
					);
					const expandedTo = ExpandingNode.expand(node);

					_.set(
						opDone,
						toLodashPath(`${cursor}.expandedTo`),
						expandedTo
					);

				}
			}
			else {
				const obj = this.getFromXPath(op);
				let result = obj.getResult(localParams,
					opDone.contours,
					opDone.anchors,
					parentAnchors,
					utils);
				const option = op.charAt(op.length - 1);

				if (option === 'x' || option === 'y') {
					_.set(
						opDone,
						toLodashPath(`${op}Base`),
						result,
					);

					const manualChanges = (
						(params.manualChanges[this.name.value] || {}).cursors || {}
					)[op] || 0;

					result += manualChanges;
				}

				_.set(
					opDone,
					toLodashPath(op),
					result,
				);
			}
		}

		const opAnchors = [...(opDone.anchors || [])];

		Object.keys(this.anchors).forEach((key) => {
			const anchor = this.anchors[key];
			const ref = opAnchors[key];

			_.set(
				opDone,
				`anchors[${key}]`,
				_.reduce(Object.keys(anchor), (acc, name) => {
					if (opDone.anchors[key][name]) {
						acc[name] = ref[name];
					}
					else {
						acc[name] = anchor[name].getResult(localParams, opDone.contours, opAnchors, parentAnchors, utils);
					}

					return acc;
				}, opAnchors[key])
			);
		});

		opDone.anchors = opAnchors;

		opDone.components = this.components.map((component) => {
			return component.constructComponent(localParams, opDone.contours, opDone.anchors, utils, glyphs);
		});

		const transformedThis = _.mapValues(this, (prop, name) => {
			if (prop !== undefined
				&& name !== 'parameters'
				&& name !== 'contours'
				&& name !== 'anchors'
				&& name !== 'components'
				&& name !== 'operationOrder') {
				return prop.getResult(localParams, opDone.contours, opDone.anchors, utils, glyphs);
			}
		});

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

		const otContours = this.createGlyphContour(opDone.contours);

		_.forEach(opDone.components, (component) => {
			otContours.push(...this.createGlyphContour(component.contours));
		});

		return {
			...transformedThis,
			...opDone,
			spacingLeft: localParams.spacingLeft,
			spacingRight: localParams.spacingRight,
			otContours,
		};
	}
	/* eslint-enable max-depth */
	/* eslint-enable no-loop-func */
}

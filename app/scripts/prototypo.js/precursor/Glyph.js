import {constantOrFormula, createContour} from '../helpers/values.js';
import {toLodashPath} from '../helpers/utils.js';
import * as utils from '../utils/updateUtils.js';

import Component from './Component.js';
import ExpandingNode from './ExpandingNode.js';
import {SkeletonPath, SimplePath, ClosedSkeletonPath} from './Path.js';

export default class Glyph {
	constructor(glyphSrc) {
		const {unicode, name, characterName, tags, transforms, parameter, anchor, outline} = glyphSrc;

		this.unicode = constantOrFormula(unicode);
		this.name = constantOrFormula(name);
		this.characterName = constantOrFormula(characterName);
		this.tags = constantOrFormula(tags);
		this.transforms = constantOrFormula(transforms);
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
		console.log(this.name.value);
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
						const correctedValues = SimplePath.correctValues(_.get(opDone, toLodashPath(cursor)), cursor);

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
					const expandedTo = ExpandingNode.expand(_.get(opDone, toLodashPath(cursor)));

					_.set(
						opDone,
						toLodashPath(`${cursor}.expandedTo`),
						expandedTo
					);

				}
			}
			else {
				const obj = this.getFromXPath(op);

				_.set(
					opDone,
					toLodashPath(op),
					obj.getResult(localParams,
						opDone.contours,
						opDone.anchors,
						parentAnchors,
						utils)
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
						acc[name] = anchor[name].getResult(localParams, opDone.contours, acc, parentAnchors, utils);
					}

					return acc;
				}, {})
			);
		});

		opDone.anchors = opAnchors;

		opDone.components = this.components.map((component) => {
			return component.constructComponent(localParams, opDone.contours, opDone.anchors, utils, glyphs);
		});

		return opDone;
	}
	/* eslint-enable max-depth */
	/* eslint-enable no-loop-func */
}

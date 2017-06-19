/* global _ */
import {toLodashPath} from '../helpers/utils.js';

export default class Formula {
	constructor(formula, cursor) {
		this.cursor = cursor;
		this.dependencies = formula._dependencies;
		/* eslint-disable no-new-func */
		this.operation = new Function(
			...['contours', 'anchors', 'parentAnchors', 'Utils']
			.concat(formula._parameters || [])
			.concat(
				(typeof formula._operation === 'string'
					&& formula._operation.indexOf('return ') === -1
					? 'return ' : ''
				)
				// The operation might be wrapped in a function (e.g. multi-
				// line code for debugging purpose). In this case, return
				// must be explicit
				+ formula._operation.toString()
					// [\s\S] need to be used instead of . because
					// javascript doesn't have a dotall flag (s)
					.replace(/^function\s*\(\)\s*\{([\s\S]*?)\}$/, '$1')
					.trim()/* +
				// add sourceURL pragma to help debugging
				// TODO: restore sourceURL pragma if it proves necessary
				'\n\n//# sourceURL=' + path*/
		));
		/* eslint-enable no-new-func */
		this.parameters = formula._parameters;
		this.analyzing = false;
	}

	analyzeDependency(glyph, graph = []) {
		graph.push(this.cursor);
		if (this.analyzing) {
			throw new Error(`There is a circular dependency for glyph ${glyph.name.value} following the subsequent graph:
${graph.join(' => ')}
`);
		}

		this.analyzing = true;
		this.dependencies.forEach((dependency) => {
			try {
				if (dependency.indexOf('parentAnchors') === -1) {
					const formula = glyph.getFromXPath(dependency);

					formula.analyzeDependency(glyph, graph);
				}
			}
			catch (e) {
				throw new Error(`There was an error while checking glyph ${glyph.name.value} dependencies for cursor: ${dependency}.
					${e.message}`
				);
			}
		});
		this.analyzing = false;
	}

	getResult(parameters, contours, anchors, parentAnchors, utils) {
		const missingParam = _.difference(this.parameters, _.keys(parameters));

		if (missingParam.length > 0) {
			console.error('parameters are missing:', missingParam);
		}

		const result = this.operation(
			contours,
			anchors,
			parentAnchors,
			utils,
			...this.parameters.map((name) => {
				return parameters[name];
			})
		);

		if (typeof result === 'number' && isNaN(result)) {
			console.error(`Operation returned NaN
operation is:
${this.operation.toString()}
parameters value are:
${this.parameters.map((name) => { return `${name}: ${parameters[name]}`;})}
cursor used are:
${this.dependencies.map((name) => {return `${name}: ${_.get(toLodashPath(name), contours)}`;})}`);
		}

		return result;
	}

	solveOperationOrder(glyph, operationOrder) {
		const result = [];
		const operationsToSolve = _.difference(_.uniq(this.dependencies), operationOrder);

		if (operationsToSolve.length > 0) {
			result.push(..._.reduce(operationsToSolve, (acc, xpath) => {
				const expandedIndex = xpath.indexOf('expandedTo');
				const processedOps = [...operationOrder, ...result, ...acc];

				if (expandedIndex !== -1) {
					const base = xpath.substr(0, expandedIndex - 1);
					const node = glyph.getFromXPath(`${base}`);

					if (node.expandedTo) {
						acc.push(...glyph.getFromXPath(xpath).solveOperationOrder(glyph, [...processedOps]));
					}
					else {
						const expandResult = glyph.getFromXPath(`${base}.expand.width`).solveOperationOrder(glyph, processedOps);

						expandResult.push(...glyph.getFromXPath(`${base}.expand.distr`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.expand.angle`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.x`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.y`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));

						const opToAdd = {
							action: 'expand',
							cursor: base,
						};

						if (!_.find([...processedOps, ...expandResult], opToAdd)) {
							expandResult.push(opToAdd);
						}

						acc.push(...expandResult);
					}
				}
				//We don't have to compute dependcy on parentAnchors they are not
				//our responsability and should be provided by parent
				else if (xpath.indexOf('parentAnchors') === -1) {
					acc.push(...glyph.getFromXPath(xpath).solveOperationOrder(glyph, processedOps));
				}

				return acc;

			}, []));
		}

		if ([...operationOrder, ...result].indexOf(this.cursor) === -1) {
			result.push(this.cursor);
		}
		return result;
	}
}

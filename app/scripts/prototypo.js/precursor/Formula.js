import _difference from 'lodash/difference';
import _get from 'lodash/get';
import _uniq from 'lodash/uniq';
import _reduce from 'lodash/reduce';
import _find from 'lodash/find';
import _keys from 'lodash/keys';

import {toLodashPath} from '../utils/generic';

export default class Formula {
	constructor(formula, cursor) {
		this.cursor = cursor;
		this.dependencies = formula._dependencies; // eslint-disable-line no-underscore-dangle
		/* eslint-disable no-new-func */
		this.operation = new Function(
			...['contours', 'anchors', 'parentAnchors', 'Utils']
			.concat(formula._parameters || []) // eslint-disable-line no-underscore-dangle
			.concat(
				(typeof formula._operation === 'string' // eslint-disable-line no-underscore-dangle
					&& formula._operation.indexOf('return ') === -1 // eslint-disable-line no-underscore-dangle
					? 'return ' : ''
				)
				// The operation might be wrapped in a function (e.g. multi-
				// line code for debugging purpose). In this case, return
				// must be explicit
				+ formula._operation.toString() // eslint-disable-line no-underscore-dangle
					// [\s\S] need to be used instead of . because
					// javascript doesn't have a dotall flag (s)
					.replace(/^function\s*\(\)\s*\{([\s\S]*?)\}$/, '$1')
				.trim(),
				/* +
				// add sourceURL pragma to help debugging
				// TODO: restore sourceURL pragma if it proves necessary
				'\n\n//# sourceURL=' + path*/
		));
		/* eslint-enable no-new-func */
		this.parameters = formula._parameters; // eslint-disable-line no-underscore-dangle
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
					${e.message}`,
				);
			}
			graph.pop();
		});
		this.analyzing = false;
	}

	getResult(parameters, contours, anchors, parentAnchors, utils) {
		const missingParam = _difference(this.parameters, _keys(parameters));

		if (missingParam.length > 0) {
			console.error(`parameters are missing: ${missingParam}`);  // eslint-disable-line no-console
		}

		const result = this.operation(
			contours,
			anchors,
			parentAnchors,
			utils,
			...this.parameters.map(name => parameters[name]),
		);

		if (typeof result === 'number' && isNaN(result)) {
			/* eslint-disable no-console */
			console.error(`Operation returned NaN
operation is:
${this.operation.toString()}
parameters value are:
${this.parameters.map(name => `${name}: ${parameters[name]}`)}
cursor used are:
${this.dependencies.map(name => `${name}: ${_get(toLodashPath(name), contours)}`)}`);
			/* eslint-enable no-console */
		}

		return result;
	}

	solveOperationOrder(glyph, operationOrder) {
		const result = [];
		const operationsToSolve = _difference(_uniq(this.dependencies), operationOrder);

		if (operationsToSolve.length > 0) {
			result.push(..._reduce(operationsToSolve, (acc, xpath) => {
				const expandedIndex = xpath.indexOf('expandedTo');
				const processedOps = [...operationOrder, ...result, ...acc];

				// We don't have to compute dependcy on parentAnchors they are not
				// our responsability and should be provided by parent
				if (xpath.indexOf('parentAnchors') !== -1) {
					return acc;
				}

				if (xpath.match(/handle(Out|In)/)) {
					const contourPath = xpath.split('.').slice(0, 2).join('.');
					const contour = glyph.getFromXPath(contourPath);

					acc.push(...contour.solveOperationOrder(glyph, [...processedOps]));
				}
				/* eslint-disable no-negated-condition, max-depth */
				else if (expandedIndex !== -1) {
					const base = xpath.substr(0, expandedIndex - 1);
					const node = glyph.getFromXPath(`${base}`);

					if (node.expandedTo) {
						if (process.env.TESTING_FONT === 'yes') {
							if (!glyph.getFromXPath(xpath)) {
								console.log(`${glyph.name.value} on cursor ${xpath}`); // eslint-disable-line no-console
							}
						}
						acc.push(...glyph.getFromXPath(xpath).solveOperationOrder(glyph, [...processedOps]));
					}
					else {
						if (process.env.TESTING_FONT === 'yes') {
							if (
								!glyph.getFromXPath(`${base}.expand.width`)
								|| !glyph.getFromXPath(`${base}.expand.distr`)
								|| !glyph.getFromXPath(`${base}.expand.angle`)
								|| !glyph.getFromXPath(`${base}.x`)
								|| !glyph.getFromXPath(`${base}.y`)
							) {
								console.log(`${glyph.name.value} on cursor ${base}`); // eslint-disable-line no-console
							}
						}
						const expandResult = glyph.getFromXPath(`${base}.expand.width`).solveOperationOrder(glyph, processedOps);

						expandResult.push(...glyph.getFromXPath(`${base}.expand.distr`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.expand.angle`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.x`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));
						expandResult.push(...glyph.getFromXPath(`${base}.y`).solveOperationOrder(glyph, [...processedOps, ...expandResult]));

						const opToAdd = {
							action: 'expand',
							cursor: base,
						};

						if (!_find([...processedOps, ...expandResult], opToAdd)) {
							expandResult.push(opToAdd);
						}

						acc.push(...expandResult);
					}
				}
				/* eslint-disable no-negated-condition, max-depth */
				else {
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

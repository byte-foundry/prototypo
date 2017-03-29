import {constantOrFormula} from '../helpers/values.js';

export default class Node {
	constructor(source, i, j, expandedCursor) {
		const {
			dirIn,
			dirOut,
			type,
			typeIn,
			typeOut,
			transforms,
			transformOrigin,
			x,
			y,
			tensionIn,
			tensionOut,
		} = source;

		const cursor = expandedCursor || `contours.${i}.nodes.${j}.`;

		/* eslint-disable no-negated-condition */
		this.cursor = cursor;
		this.dirIn = dirIn !== undefined ? constantOrFormula(dirIn, `${cursor}dirIn`) : constantOrFormula(null, `${cursor}dirIn`);
		this.dirOut = dirOut !== undefined ? constantOrFormula(dirOut, `${cursor}dirOut`) : constantOrFormula(null, `${cursor}dirOut`);
		//simplify by having just typeIn and typeOut
		this.type = type || null;
		this.typeIn = typeIn !== undefined ? constantOrFormula(typeIn, `${cursor}typeIn`) : constantOrFormula(this.type, `${cursor}typeIn`);
		this.typeOut = typeOut !== undefined ? constantOrFormula(typeOut, `${cursor}typeOut`) : constantOrFormula(this.type, `${cursor}typeOut`);
		this.tensionIn = tensionIn !== undefined ? constantOrFormula(tensionIn, `${cursor}tensionIn`) : constantOrFormula(1, `${cursor}tensionIn`);
		this.tensionOut = tensionOut !== undefined ? constantOrFormula(tensionOut, `${cursor}tensionOut`) : constantOrFormula(1, `${cursor}tensionOut`);
		this.transforms = transforms !== undefined ? constantOrFormula(transforms, `${cursor}transforms`) : constantOrFormula(null, `${cursor}transforms`);
		this.transformOrigin = transformOrigin ? constantOrFormula(transformOrigin, `${cursor}transformOrigin`) : constantOrFormula(null, `${cursor}transformOrigin`);
		this.x = x !== undefined ? constantOrFormula(x, `${cursor}x`) : constantOrFormula(null, `${cursor}x`);
		this.y = y !== undefined ? constantOrFormula(y, `${cursor}y`) : constantOrFormula(null, `${cursor}y`);
		/* eslint-enable no-negated-condition */
	}

	solveOperationOrder(glyph, operationOrder) {
		const result = [];

		_.forOwn(this, (value, key) => {
			if (value !== null && key !== 'cursor' && key !== 'type') {
				if (key === 'expand') {
					_.forOwn(value, (item) => {
						result.push(...item.solveOperationOrder(glyph, [...operationOrder, ...result]));
					});
				}
				else if (key === 'expandedTo') {
					_.forEach(value, (item) => {
						result.push(...item.solveOperationOrder(glyph, [...operationOrder, ...result]));
					});
				}
				else if (key !== 'expanding') {
					result.push(...value.solveOperationOrder(glyph, [...operationOrder, ...result]));
				}

				if (typeof this.readyToExpand === 'function') {
					const opToAdd = {
						action: 'expand',
						cursor: this.cursor.substring(0, this.cursor.length - 1),
					};

					if (this.readyToExpand([...operationOrder, ...result]) && !_.find([...operationOrder, ...result], opToAdd)) {
						result.push(opToAdd);
					}
				}
			}
		});

		return result;
	}

	analyzeDependency(glyph, graph) {
		_.forOwn(this, (value, key) => {
			if (value !== null && key !== 'cursor') {
				if (key === 'expand') {
					_.forOwn(value, (item) => {
						item.analyzeDependency(glyph, graph);
					});
				}
				else if (key === 'expandedTo') {
					_.forEach(value, (item) => {
						item.analyzeDependency(glyph, graph);
					});
				}
				else {
					value.analyzeDependency(glyph, graph);
				}
			}
		});
	}
}

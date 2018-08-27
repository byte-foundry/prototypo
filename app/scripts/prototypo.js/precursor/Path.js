import _reduce from 'lodash/reduce';
import _find from 'lodash/find';
import _flatMap from 'lodash/flatMap';
import _take from 'lodash/take';
import _difference from 'lodash/difference';

import {
	subtract2D,
	mulScalar2D,
	dot2D,
	add2D,
	round2D,
	distance2D,
} from '../utils/linear';
import {rayRayIntersection, lineAngle} from '../utils/updateUtils';
import {constantOrFormula} from '../utils/generic';

import Node from './Node';
import ExpandingNode from './ExpandingNode';

const SMOOTH = 'smooth';
const LINE = 'line';

function computeHandle(
	dest,
	current,
	prev,
	next,
	node,
	prevNode,
	nextNode,
	j,
	params,
	curviness,
) {
	let inIntersection;
	let outIntersection;
	const prevDir = j // eslint-disable-line no-nested-ternary
		? prevNode.dirIn === null ? prev.dirIn : prevNode.dirIn
		: prevNode.dirOut === null ? prev.dirOut : prevNode.dirOut;
	const nextDir = j // eslint-disable-line no-nested-ternary
		? nextNode.dirOut === null ? next.dirOut : nextNode.dirOut
		: nextNode.dirIn === null ? next.dirIn : nextNode.dirIn;
	let dirToPrev
		= (j ? current.dirOut || node.dirOut : current.dirIn || node.dirIn) || 0;
	let dirToNext
		= (j ? current.dirIn || node.dirIn : current.dirOut || node.dirOut) || 0;
	const tensionIn = j ? node.tensionOut : node.tensionIn;
	const tensionOut = j ? node.tensionIn : node.tensionOut;
	const typeIn = j ? node.typeOut : node.typeIn;
	const typeOut = j ? node.typeIn : node.typeOut;

	if (typeIn === SMOOTH && typeOut === LINE) {
		if (nextNode.expandedTo) {
			dirToPrev = lineAngle(current, nextNode.expandedTo[j]);
		}
		else {
			dirToPrev = lineAngle(current, nextNode);
		}
	}
	else if (typeOut === SMOOTH && typeIn === LINE) {
		if (prevNode.expandedTo) {
			dirToNext = lineAngle(current, prevNode.expandedTo[j]);
		}
		else {
			dirToNext = lineAngle(current, prevNode);
		}
	}

	if (
		(Math.PI - Math.abs(Math.abs(prevDir - dirToPrev) - Math.PI)) % Math.PI
		=== 0
	) {
		const unitDir = {
			x: Math.cos(dirToPrev),
			y: Math.sin(dirToPrev),
		};

		inIntersection = add2D(
			mulScalar2D(dot2D(unitDir, subtract2D(prev, current)) / 2, unitDir),
			current,
		);
	}
	else {
		inIntersection = rayRayIntersection(
			{
				x: prev.x,
				y: prev.y,
			},
			prevDir,
			{
				x: current.x,
				y: current.y,
			},
			dirToPrev,
		);
	}

	if (
		(Math.PI - Math.abs(Math.abs(nextDir - dirToNext) - Math.PI)) % Math.PI
		=== 0
	) {
		const unitDir = {
			x: Math.cos(dirToNext),
			y: Math.sin(dirToNext),
		};

		outIntersection = add2D(
			mulScalar2D(dot2D(unitDir, subtract2D(next, current)) / 2, unitDir),
			current,
		);
	}
	else {
		outIntersection = rayRayIntersection(
			{
				x: next.x,
				y: next.y,
			},
			nextDir,
			{
				x: current.x,
				y: current.y,
			},
			dirToNext,
		);
	}

	const untensionedInVector = subtract2D(inIntersection, current);
	const untensionOutVector = subtract2D(outIntersection, current);
	let inVector = mulScalar2D(curviness * tensionIn, untensionedInVector);
	let outVector = mulScalar2D(curviness * tensionOut, untensionOutVector);
	const outBase = round2D(add2D(current, outVector));
	const inBase = round2D(add2D(current, inVector));

	dest.baseTensionIn
		= distance2D(inVector, {x: 0, y: 0})
		/ (distance2D(untensionedInVector, {x: 0, y: 0}) * 0.6);
	dest.baseTensionOut
		= distance2D(outVector, {x: 0, y: 0})
		/ (distance2D(untensionOutVector, {x: 0, y: 0}) * 0.6);

	if (
		inVector.x === undefined
		|| inVector.y === undefined
		|| outVector.x === undefined
		|| outVector.y === undefined
		|| Number.isNaN(inVector.x)
		|| Number.isNaN(inVector.y)
		|| Number.isNaN(outVector.x)
		|| Number.isNaN(outVector.y)
	) {
		console.error(`handle creation went south for cursor:${dest.cursor}`); // eslint-disable-line no-console
	}

	if (node.expandedTo) {
		const outMod = {
			x: params[`${node.nodeAddress}expandedTo.${j}.out.x`] || 0,
			y: params[`${node.nodeAddress}expandedTo.${j}.out.y`] || 0,
		};
		const inMod = {
			x: params[`${node.nodeAddress}expandedTo.${j}.in.x`] || 0,
			y: params[`${node.nodeAddress}expandedTo.${j}.in.y`] || 0,
		};

		inVector = add2D(inVector, inMod);
		outVector = add2D(outVector, outMod);
	}
	else {
		const outMod = {
			x: params[`${node.nodeAddress}out.x`] || 0,
			y: params[`${node.nodeAddress}out.y`] || 0,
		};
		const inMod = {
			x: params[`${node.nodeAddress}in.x`] || 0,
			y: params[`${node.nodeAddress}in.y`] || 0,
		};

		inVector = add2D(inVector, inMod);
		outVector = add2D(outVector, outMod);
	}

	/* eslint-disable no-param-reassign */
	dest.baseTypeIn = node.typeIn;
	dest.baseTypeOut = node.typeOut;
	dest.dirOut = dirToNext;
	dest.dirIn = dirToPrev;
	dest.tensionIn
		= distance2D(inVector, {x: 0, y: 0})
		/ (distance2D(untensionedInVector, {x: 0, y: 0}) * 0.6);
	dest.tensionOut
		= distance2D(outVector, {x: 0, y: 0})
		/ (distance2D(untensionOutVector, {x: 0, y: 0}) * 0.6);
	dest.handleIn = round2D(add2D(current, inVector));
	dest.handleOut = round2D(add2D(current, outVector));
	dest.handleIn.xBase = inBase.x;
	dest.handleIn.yBase = inBase.y;
	dest.handleOut.xBase = outBase.x;
	dest.handleOut.yBase = outBase.y;
	/* eslint-enable no-param-reassign */
}

class SolvablePath {
	constructor(i) {
		this.cursor = `contours.${i}.`;
	}

	solveOperationOrder(glyph, operationOrder) {
		return [
			`${this.cursor}closed`,
			`${this.cursor}skeleton`,
			..._reduce(
				[...this.nodes, this.transforms, this.transformOrigin],
				(result, node) => {
					result.push(
						...node.solveOperationOrder(glyph, [...operationOrder, ...result]),
					);
					const allOperation = [...operationOrder, ...result];

					if (
						this.isReadyForHandles(allOperation)
						&& !_find(
							allOperation,
							op =>
								op.action === 'handle'
								&& op.cursor === this.cursor.substring(0, this.cursor.length - 1),
						)
					) {
						result.push({
							action: 'handle',
							cursor: this.cursor.substring(0, this.cursor.length - 1),
						});
					}
					return result;
				},
				[],
			),
		];
	}

	analyzeDependency(glyph, graph) {
		this.nodes.forEach((node) => {
			node.analyzeDependency(glyph, graph);
		});
	}

	static correctValues({nodes, closed, skeleton}) {
		/* eslint-disable no-param-reassign */
		const results = {};

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			nodes[i].nodeAddress = node.nodeAddress;
			nodes[i].x = Math.round(node.x);
			nodes[i].y = Math.round(node.y);
			nodes[i].xBase = Math.round(node.x);
			nodes[i].yBase = Math.round(node.y);

			nodes[i].typeIn = node.typeIn || node.type;
			nodes[i].typeOut = node.typeOut || node.type;

			if (node.typeOut === SMOOTH && node.dirOut === null) {
				nodes[i].dirOut = nodes[i].dirIn;
			}
			else if (node.typeIn === SMOOTH && node.dirIn === null) {
				nodes[i].dirIn = nodes[i].dirOut;
			}

			if (node.expand) {
				if (i === 0 && !closed) {
					nodes[i].typeIn = LINE;
				}
				else if (i === nodes.length - 1 && !closed) {
					nodes[i].typeOut = LINE;
				}

				const dirIn = node.dirIn;
				const dirOut = node.dirOut;

				nodes[i].expand.angle = node.expand.angle;
				nodes[i].dirIn
					= dirIn === null || dirIn === undefined
						? (nodes[i].expand.angle + Math.PI / 2) % (2 * Math.PI)
						: dirIn;
				nodes[i].dirOut
					= dirOut === null || dirOut === undefined
						? (nodes[i].expand.angle + Math.PI / 2) % (2 * Math.PI)
						: dirOut;
			}
			else if (node.expandedTo) {
				if (i === 0 && !closed) {
					node.expandedTo[0].typeIn = LINE;
					node.expandedTo[1].typeOut = LINE;
				}
				else if (i === nodes.length - 1 && !closed) {
					node.expandedTo[1].typeIn = LINE;
					node.expandedTo[0].typeOut = LINE;
				}
				const dirIn0 = node.expandedTo[0].dirIn;
				const dirOut0 = node.expandedTo[0].dirOut;
				const dirIn1 = node.expandedTo[1].dirIn;
				const dirOut1 = node.expandedTo[1].dirOut;

				node.expandedTo[0].dirIn = dirIn0;
				node.expandedTo[0].dirOut = dirOut0;
				node.expandedTo[1].dirIn = dirIn1;
				node.expandedTo[1].dirOut = dirOut1;
			}
			else {
				nodes[i].dirIn = node.dirIn || 0;
				nodes[i].dirOut = node.dirOut || 0;
			}

			if (node.typeOut === LINE) {
				nodes[i].tensionOut = 0;
			}
			if (node.typeIn === LINE) {
				nodes[i].tensionIn = 0;
			}

			nodes[i].tensionIn = node.tensionIn === undefined ? 1 : node.tensionIn;
			nodes[i].tensionOut = node.tensionOut === undefined ? 1 : node.tensionOut;
		}
		/* eslint-enable no-param-reassign */

		return results;
	}
}

export class SkeletonPath extends SolvablePath {
	constructor(source, i) {
		super(i);
		this.nodes = source.point.map((point, j) => new ExpandingNode(point, i, j));
		this.closed = constantOrFormula(false, `${this.cursor}closed`);
		this.skeleton = constantOrFormula(true, `${this.cursor}skeleton`);
		this.transforms
			= source.transforms === undefined
				? constantOrFormula(null, `${this.cursor}transforms`)
				: constantOrFormula(source.transforms, `${this.cursor}transforms`);
		this.transformOrigin = source.transformOrigin
			? constantOrFormula(
				source.transformOrigin,
				`${this.cursor}transformOrigin`,
			)
			: constantOrFormula(null, `${this.cursor}transformOrigin`);
	}

	isReadyForHandles(ops, index = ops.length - 1) {
		const cursorToLook = _flatMap(this.nodes, (node) => {
			if (node.expanding) {
				return [
					`${node.cursor}expand.width`,
					`${node.cursor}expand.distr`,
					`${node.cursor}expand.angle`,
					`${node.cursor}typeOut`,
					`${node.cursor}typeIn`,
					`${node.cursor}dirIn`,
					`${node.cursor}dirOut`,
					`${node.cursor}tensionIn`,
					`${node.cursor}tensionOut`,
					`${node.cursor}x`,
					`${node.cursor}y`,
				];
			}
			return [
				`${node.cursor}expandedTo.0.x`,
				`${node.cursor}expandedTo.0.y`,
				`${node.cursor}expandedTo.1.x`,
				`${node.cursor}expandedTo.1.y`,
				`${node.cursor}dirIn`,
				`${node.cursor}dirOut`,
				`${node.cursor}tensionIn`,
				`${node.cursor}tensionOut`,
			];
		});

		const done = _take(ops, index + 1);

		return (
			_difference(done, cursorToLook).length
			=== done.length - cursorToLook.length
		);
	}

	static createHandle(dest, params, curviness) {
		const {nodes} = dest;

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];

			for (let j = 0; j < node.expandedTo.length; j++) {
				let nextSecondIndex = j;
				let nextFirstIndex = k + 1 * (j ? -1 : 1);
				let prevFirstIndex = k - 1 * (j ? -1 : 1);
				let prevSecondIndex = j;

				if (nextFirstIndex > nodes.length - 1) {
					nextFirstIndex = nodes.length - 1;
					nextSecondIndex = 1;
				}
				else if (nextFirstIndex < 0) {
					nextFirstIndex = 0;
					nextSecondIndex = 0;
				}

				if (prevFirstIndex > nodes.length - 1) {
					prevFirstIndex = nodes.length - 1;
					prevSecondIndex = 0;
				}
				else if (prevFirstIndex < 0) {
					prevFirstIndex = 0;
					prevSecondIndex = 1;
				}

				const nextExpanded = nodes[nextFirstIndex].expandedTo[nextSecondIndex];
				const prevExpanded = nodes[prevFirstIndex].expandedTo[prevSecondIndex];
				const nextNode = nodes[nextFirstIndex];
				const prevNode = nodes[prevFirstIndex];
				const currentExpanded = node.expandedTo[j];

				computeHandle(
					dest.nodes[k].expandedTo[j],
					currentExpanded,
					prevExpanded,
					nextExpanded,
					node,
					prevNode,
					nextNode,
					j,
					params,
					curviness,
				);
			}
		}
	}
}

export class ClosedSkeletonPath extends SkeletonPath {
	constructor(source, i) {
		super(source, i);
		this.closed = constantOrFormula(true, `${this.cursor}closed`);
	}

	static createHandle(dest, params, curviness) {
		const {nodes} = dest;

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];

			for (let j = 0; j < node.expandedTo.length; j++) {
				const nextFirstIndex
					= k
					+ 1 * (j ? -1 : 1)
					- nodes.length * Math.floor((k + 1 * (j ? -1 : 1)) / nodes.length);
				const prevFirstIndex
					= k
					- 1 * (j ? -1 : 1)
					- nodes.length * Math.floor((k - 1 * (j ? -1 : 1)) / nodes.length);

				const nextExpanded = nodes[nextFirstIndex].expandedTo[j];
				const prevExpanded = nodes[prevFirstIndex].expandedTo[j];
				const nextNode = nodes[nextFirstIndex];
				const prevNode = nodes[prevFirstIndex];
				const currentExpanded = node.expandedTo[j];

				computeHandle(
					dest.nodes[k].expandedTo[j],
					currentExpanded,
					prevExpanded,
					nextExpanded,
					node,
					prevNode,
					nextNode,
					j,
					params,
					curviness,
				);
			}
		}
	}
}

export class SimplePath extends SolvablePath {
	constructor(source, i) {
		super(i);
		this.nodes = source.point.map((point, j) => new Node(point, i, j));
		this.closed = constantOrFormula(true, `${this.cursor}closed`);
		this.skeleton = constantOrFormula(false, `${this.cursor}skeleton`);
		this.exportReversed = constantOrFormula(source.exportReversed);
		this.transforms
			= source.transforms === undefined
				? constantOrFormula(null, `${this.cursor}transforms`)
				: constantOrFormula(source.transforms, `${this.cursor}transforms`);
		this.transformOrigin = source.transformOrigin
			? constantOrFormula(
				source.transformOrigin,
				`${this.cursor}transformOrigin`,
			)
			: constantOrFormula(null, `${this.cursor}transformOrigin`);
	}

	isReadyForHandles(ops, index = ops.length - 1) {
		const cursorToLook = _flatMap(this.nodes, node => [
			`${node.cursor}typeOut`,
			`${node.cursor}typeIn`,
			`${node.cursor}dirIn`,
			`${node.cursor}dirOut`,
			`${node.cursor}tensionIn`,
			`${node.cursor}tensionOut`,
			`${node.cursor}x`,
			`${node.cursor}y`,
		]);

		const done = _take(ops, index + 1);

		return (
			_difference(done, cursorToLook).length
			=== done.length - cursorToLook.length
		);
	}

	static createHandle(dest, params, curviness) {
		const {nodes} = dest;

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];
			const prevNode
				= nodes[k - 1 - nodes.length * Math.floor((k - 1) / nodes.length)];
			const nextNode = nodes[(k + 1) % nodes.length];

			computeHandle(
				dest.nodes[k],
				node,
				prevNode,
				nextNode,
				node,
				prevNode,
				nextNode,
				0,
				params,
				curviness,
			);
		}
	}
}

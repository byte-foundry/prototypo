/* global _ */
import {subtract2D, mulScalar2D, dot2D, add2D, round2D, distance2D} from '../../plumin/util/linear.js';
import {rayRayIntersection} from '../utils/updateUtils.js';
import {readAngle} from '../helpers/utils.js';
import {constantOrFormula} from '../helpers/values.js';

import Node from './Node.js';
import ExpandingNode from './ExpandingNode.js';

function computeHandle(
	dest,
	current,
	prev,
	next,
	node,
	prevNode,
	nextNode,
	j,
	params
) {
	let inIntersection;
	let outIntersection;
	const prevDir = j ? prevNode.dirIn : prevNode.dirOut;
	const nextDir = j ? nextNode.dirOut : nextNode.dirIn;
	let dirToPrev = j ? node.dirOut : node.dirIn;
	let dirToNext = j ? node.dirIn : node.dirOut;
	const tensionIn = j ? node.tensionOut : node.tensionIn;
	const tensionOut = j ? node.tensionIn : node.tensionOut;

	dirToNext += params[`${node.nodeAddress}expandedTo.${j}.dirOut`] || 0;
	dirToPrev += params[`${node.nodeAddress}expandedTo.${j}.dirIn`] || 0;

	if (Math.abs(prevDir % Math.PI) === Math.abs(dirToPrev % Math.PI)) {
		const unitDir = {
			x: Math.cos(dirToPrev),
			y: Math.sin(dirToPrev),
		};

		inIntersection = add2D(
			mulScalar2D(
				dot2D(
					unitDir,
					subtract2D(
						prev,
						next,
					)
				),
				unitDir
			),
			current
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
			dirToPrev
		);
	}

	if (Math.abs(nextDir % Math.PI) === Math.abs(dirToNext % Math.PI)) {
		const unitDir = {
			x: Math.cos(dirToNext),
			y: Math.sin(dirToNext),
		};

		outIntersection = add2D(
			mulScalar2D(
				dot2D(
					unitDir,
					subtract2D(
						next,
						prev,
					)
				),
				unitDir
			),
			current
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
			dirToNext
		);
	}

	let inVector = mulScalar2D(tensionIn * 0.6, subtract2D(inIntersection, current));
	let outVector = mulScalar2D(tensionOut * 0.6, subtract2D(outIntersection, current));

	if (node.expandedTo) {
		node.expandedTo[j].baseLengthIn = distance2D(inVector, {x: 0, y: 0});
		node.expandedTo[j].baseLengthOut = distance2D(outVector, {x: 0, y: 0});
		inVector = mulScalar2D(params[`${node.nodeAddress}expandedTo.${j}.tensionIn`] || 1, inVector);
		outVector = mulScalar2D(params[`${node.nodeAddress}expandedTo.${j}.tensionOut`] || 1, outVector);
	}


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
		console.error(`handle creation went south for cursor:${dest.cursor}`);
	}


	dest.handleIn = round2D(add2D(current, inVector));
	dest.handleOut = round2D(add2D(current, outVector));
}

class SolvablePath {
	constructor(i) {
		this.cursor = `contours.${i}.`;
	}

	solveOperationOrder(glyph, operationOrder) {
		return [`${this.cursor}closed`, `${this.cursor}skeleton`, ..._.reduce(this.nodes, (result, node) => {
			result.push(...node.solveOperationOrder(glyph, [...operationOrder, ...result]));
			if (this.isReadyForHandles([...operationOrder, ...result])) {
				result.push({
					action: 'handle',
					cursor: this.cursor.substring(0, this.cursor.length - 1),
				});
			}
			return result;
		}, [])];
	}

	analyzeDependency(glyph, graph) {
		this.nodes.forEach((node) => {
			node.analyzeDependency(glyph, graph);
		});
	}

	static correctValues({nodes, closed, skeleton}) {
		const results = {};

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			nodes[i].nodeAddress = node.nodeAddress;
			nodes[i].x = Math.round(node.x);
			nodes[i].y = Math.round(node.y);

			if (node.expand) {
				const dirIn = readAngle(node.dirIn);
				const dirOut = readAngle(node.dirOut);

				nodes[i].expand.angle = readAngle(node.expand.angle);
				nodes[i].dirIn = dirIn !== null ? dirIn : nodes[i].expand.angle + Math.PI / 2;
				nodes[i].dirOut = dirOut !== null ? dirOut : nodes[i].expand.angle + Math.PI / 2;
			}
			else {
				nodes[i].dirIn = readAngle(node.dirIn) || 0;
				nodes[i].dirOut = readAngle(node.dirOut) || 0;
			}

			if (node.typeOut === 'smooth') {
				nodes[i].dirOut = nodes[i].dirIn;
			}
			else if (node.typeIn === 'smooth') {
				nodes[i].dirIn = nodes[i].dirOut;
			}

			nodes[i].tensionIn = node.typeIn === 'line' ? 0 : (node.tensionIn || 1);
			nodes[i].tensionOut = node.typeOut === 'line' ? 0 : (node.tensionOut || 1);

			if (!closed && skeleton) {
				if (i === 0) {
					 nodes[i].tensionIn = 0;
				}
				else if (i === nodes.length - 1) {
					 nodes[i].tensionOut = 0;
				}
			}
		}

		return results;
	}
}

export class SkeletonPath extends SolvablePath {
	constructor(source, i) {
		super(i);
		this.nodes = source.point.map((point, j) => {
			return new ExpandingNode(point, i, j);
		});
		this.closed = constantOrFormula(false);
		this.skeleton = constantOrFormula(true);
	}

	isReadyForHandles(ops, index = ops.length - 1) {
		const cursorToLook = _.flatMap(this.nodes, (node) => {
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
			else {
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
			}
		});

		const done = _.take(ops, index + 1);

		return _.difference(done, cursorToLook).length === done.length - cursorToLook.length;

	}

	static createHandle(dest, params) {
		const {nodes, closed} = dest;

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
					params
				);
			}
		}
	}
}

export class ClosedSkeletonPath extends SkeletonPath {
	constructor(source, i) {
		super(source, i);
		this.closed = constantOrFormula(true);
	}

	static createHandle(dest, params) {
		const {nodes, closed} = dest;

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];

			for (let j = 0; j < node.expandedTo.length; j++) {
				const nextFirstIndex = k + 1 * (j ? -1 : 1) - nodes.length * Math.floor((k + 1 * (j ? -1 : 1)) / nodes.length);
				const prevFirstIndex = k - 1 * (j ? -1 : 1) - nodes.length * Math.floor((k - 1 * (j ? -1 : 1)) / nodes.length);

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
					params
				);
			}
		}
	}
}

export class SimplePath extends SolvablePath {
	constructor(source, i) {
		super(i);
		this.nodes = source.point.map((point, j) => {
			return new Node(point, i, j);
		});
		this.closed = constantOrFormula(true);
		this.skeleton = constantOrFormula(false);
		this.exportReversed = constantOrFormula(source.exportReversed);
	}

	isReadyForHandles(ops, index = ops.length - 1) {
		const cursorToLook = _.flatMap(this.nodes, (node) => {
			return [
				`${node.cursor}typeOut`,
				`${node.cursor}typeIn`,
				`${node.cursor}dirIn`,
				`${node.cursor}dirOut`,
				`${node.cursor}tensionIn`,
				`${node.cursor}tensionOut`,
				`${node.cursor}x`,
				`${node.cursor}y`,
			];
		});

		const done = _.take(ops, index + 1);

		return _.difference(done, cursorToLook).length === done.length - cursorToLook.length;

	}

	static createHandle(dest) {
		const {nodes} = dest;

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];
			const prevNode = nodes[(k - 1) - nodes.length * Math.floor((k - 1) / nodes.length)];
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
				{}
			);
		}
	}
}

import {subtract2D, mulScalar2D, dot2D, add2D} from '../../plumin/util/linear.js';
import {rayRayIntersection} from '../utils/updateUtils.js';
import {readAngle} from '../helpers/utils.js';
import {constantOrFormula} from '../helpers/values.js';

import Node from './Node.js';
import ExpandingNode from './ExpandingNode.js';

function computeHandle(
	cursor,
	result,
	current,
	prev,
	next,
	node,
	prevNode,
	nextNode,
) {
	let inIntersection;
	let outIntersection;

	if (Math.abs(prevNode.dirOut % Math.PI) === Math.abs(node.dirIn % Math.PI)) {
		const unitDir = {
			x: Math.cos(node.dirIn),
			y: Math.sin(node.dirIn),
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
			prevNode.dirOut,
			{
				x: current.x,
				y: current.y,
			},
			node.dirIn
		);
	}

	if (Math.abs(nextNode.dirIn % Math.PI) === Math.abs(node.dirOut % Math.PI)) {
		const unitDir = {
			x: Math.cos(node.dirOut),
			y: Math.sin(node.dirOut),
		};

		outIntersection = add2D(
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
		outIntersection = rayRayIntersection(
			{
				x: next.x,
				y: next.y,
			},
			nextNode.dirIn,
			{
				x: current.x,
				y: current.y,
			},
			node.dirOut
		);
	}
	const inVector = mulScalar2D(node.tensionIn * 1 / 3, subtract2D(inIntersection, current));
	const outVector = mulScalar2D(node.tensionOut * 1 / 3, subtract2D(outIntersection, current));

	if (
		inVector.x === undefined
		|| inVector.y === undefined
		|| outVector.x === undefined
		|| outVector.y === undefined
	) {
		console.error(`handle creation went south for cursor:`, cursor);
	}


	result[`${cursor}handleIn`] = add2D(current, inVector);
	result[`${cursor}handleOut`] = add2D(current, outVector);

	return result;
}

class SolvablePath {
	constructor(i) {
		this.cursor = `contours.${i}.`;
	}

	solveOperationOrder(glyph, operationOrder) {
		return [`${this.cursor}closed`, `${this.cursor}skeleton`, ..._.reduce(this.nodes, (result, node) => {
			result.push(...node.solveOperationOrder(glyph, [...operationOrder, ...result]));
			return result;
		}, [])];
	}

	analyzeDependency(glyph, graph) {
		this.nodes.forEach((node) => {
			node.analyzeDependency(glyph, graph);
		});
	}

	static correctValues({nodes, closed, skeleton}, cursor) {
		const results = {};

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			if (node.expand) {
				results[`${cursor}.nodes.${i}.expand.angle`] = readAngle(node.expand.angle);
				results[`${cursor}.nodes.${i}.dirIn`] = readAngle(node.dirIn) || results[`${cursor}.nodes.${i}.expand.angle`] + Math.PI / 2;
				results[`${cursor}.nodes.${i}.dirOut`] = readAngle(node.dirOut) || results[`${cursor}.nodes.${i}.expand.angle`] + Math.PI / 2;
			}
			else {
				results[`${cursor}.nodes.${i}.dirIn`] = readAngle(node.dirIn) || 0;
				results[`${cursor}.nodes.${i}.dirOut`] = readAngle(node.dirOut) || 0;
			}

			if (node.typeOut === 'smooth') {
				results[`${cursor}.nodes.${i}.dirOut`] = results[`${cursor}.nodes.${i}.dirIn`];
			}
			else if (node.typeIn === 'smooth') {
				results[`${cursor}.nodes.${i}.dirIn`] = results[`${cursor}.nodes.${i}.dirOut`];
			}

			results[`${cursor}.nodes.${i}.tensionIn`] = node.typeIn === 'line' ? 0 : node.tensionIn;
			results[`${cursor}.nodes.${i}.tensionOut`] = node.typeOut === 'line' ? 0 : node.tensionOut;

			if (!closed && skeleton) {
				if (i === 0) {
					 results[`${cursor}.nodes.${i}.tensionIn`] = 0;
				}
				else if (i === nodes.length) {
					 results[`${cursor}.nodes.${i}.tensionOut`] = 0;
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

	isReadyForHandles(ops, index) {
		const cursorToLook = _.flatMap(this.nodes, (node) => {
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
		});

		const done = _.take(ops, index + 1);

		return _.difference(done, cursorToLook).length === done.length - cursorToLook.length;

	}

	static createHandle({nodes, closed}, cursor) {
		let result = {};

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];
			const prevNode = nodes[(k - 1) - nodes.length * Math.floor((k - 1) / nodes.length)];
			const nextNode = nodes[(k + 1) % nodes.length];

			for (let j = 0; j < node.expandedTo.length; j++) {
				const currentExpanded = node.expandedTo[j];
				const prevExpanded = prevNode.expandedTo[j];
				const nextExpanded = nextNode.expandedTo[j];

				result = computeHandle(
					`${cursor}.nodes.${k}.expandedTo.${j}.`,
					result,
					currentExpanded,
					prevExpanded,
					nextExpanded,
					node,
					prevNode,
					nextNode
				);
			}
		}

		return result;
	}
}

export class ClosedSkeletonPath extends SkeletonPath {
	constructor(source, i) {
		super(source, i );
		this.closed = constantOrFormula(true);
	}
}

export class SimplePath extends SolvablePath {
	constructor(source, i) {
		super();
		this.nodes = source.point.map((point, j) => {
			return new Node(point, i, j);
		});
		this.closed = constantOrFormula(true);
		this.skeleton = constantOrFormula(false);
	}

	isReadyForHandles(ops, index) {
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

	static createHandle() {
		let result = {};

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];
			const prevNode = nodes[(k - 1) - nodes.length * Math.floor((k - 1) / nodes.length)];
			const nextNode = nodes[(k + 1) % nodes.length];


			result = computeHandle(
				`${cursor}.nodes.${k}.expandedTo.${j}.`,
				result,
				node,
				prevNode,
				nextNode,
				node,
				prevNode,
				nextNode
			);
		}

		return result;
	}
}

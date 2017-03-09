import {subtract2D, mulScalar2D, dot2D, add2D} from '../../plumin/util/linear.js';
import {rayRayIntersection} from '../utils/updateUtils.js';
import {readAngle} from '../helpers/utils.js';

import Node from './Node.js';
import ExpandingNode from './ExpandingNode.js';

class SolvablePath {
	constructor() {
	}

	solveOperationOrder(glyph, operationOrder) {
		return _.reduce(this.nodes, (result, node) => {
			result.push(...node.solveOperationOrder(glyph, [...operationOrder, ...result]));
			return result;
		}, []);
	}

	analyzeDependency(glyph, graph) {
		this.nodes.forEach((node) => {
			node.analyzeDependency(glyph, graph);
		});
	}
}

export class SkeletonPath extends SolvablePath {
	constructor(source, i) {
		super();
		this.nodes = source.point.map((point, j) => {
			return new ExpandingNode(point, i, j);
		});
		this.closed = false;
		this.skeleton = true;
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

	static correctValues(nodes, closed) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			node.expand.angle = readAngle(node.expand.angle);
			node.dirIn = readAngle(node.dirIn) || node.expand.angle + Math.PI / 2;
			node.dirOut = readAngle(node.dirOut) || node.expand.angle + Math.PI / 2;

			if (node.typeOut === 'smooth') {
				node.dirOut = node.dirIn;
			}
			else if (node.typeIn === 'smooth') {
				node.dirIn = node.dirOut;
			}

			node.tensionIn = node.typeIn === 'line' ? 0 : node.tensionIn;
			node.tensionOut = node.typeOut === 'line' ? 0 : node.tensionOut;

			if (!closed) {
				if (i === 0) {
					node.tensionIn = 0;
				}
				else if (i === nodes.length) {
					node.tensionOut = 0;
				}
			}
		}
	}

	static createHandle({nodes, closed}, cursor) {
		const result = {};

		SkeletonPath.correctValues(nodes, closed);

		for (let k = 0; k < nodes.length; k++) {
			const node = nodes[k];
			const prevNode = nodes[(k - 1) - nodes.length * Math.floor((k - 1) / nodes.length)];
			const nextNode = nodes[(k + 1) % nodes.length];

			for (let j = 0; j < node.expandedTo.length; j++) {
				const currentExpanded = node.expandedTo[j];
				const prevExpanded = prevNode.expandedTo[j];
				const nextExpanded = nextNode.expandedTo[j];

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
									prevExpanded,
									nextExpanded,
								)
							),
							unitDir
						),
						currentExpanded
					);

				}
				else {
					inIntersection = rayRayIntersection(
						{
							x: prevExpanded.x,
							y: prevExpanded.y,
						},
						prevNode.dirOut,
						{
							x: currentExpanded.x,
							y: currentExpanded.y,
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
									prevExpanded,
									nextExpanded,
								)
							),
							unitDir
						),
						currentExpanded
					);
				}
				else {
					outIntersection = rayRayIntersection(
						{
							x: nextExpanded.x,
							y: nextExpanded.y,
						},
						nextNode.dirIn,
						{
							x: currentExpanded.x,
							y: currentExpanded.y,
						},
						node.dirOut
					);
				}
				const inVector = mulScalar2D(node.tensionIn * 1 / 3, subtract2D(inIntersection, currentExpanded));
				const outVector = mulScalar2D(node.tensionOut * 1 / 3, subtract2D(outIntersection, currentExpanded));

				if (
					inVector.x === undefined
					|| inVector.y === undefined
					|| outVector.x === undefined
					|| outVector.y === undefined
				) {
					console.error(`handle creation went south for cursor:`, cursor);
				}


				result[`${cursor}.nodes.${k}.expandedTo.${j}.handleIn`] = add2D(currentExpanded, inVector);
				result[`${cursor}.nodes.${k}.expandedTo.${j}.handleOut`] = add2D(currentExpanded, outVector);
			}
		}

		return result;
	}
}

export class ClosedSkeletonPath extends SkeletonPath {
	constructor(source, i) {
		super(source, i );
		this.closed = true;
	}
}

export class SimplePath extends SolvablePath {
	constructor(source, i) {
		super();
		this.nodes = source.point.map((point, j) => {
			return new Node(point, i, j);
		});
		this.closed = true;
		this.skeleton = false;
	}
}

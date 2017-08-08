/* global _ */
import {distance2D, subtract2D, add2D, mulScalar2D, normalize2D} from '../plumin/util/linear';
import {getIntersectionTValue, getPointOnCurve} from '../prototypo.js/utils/updateUtils';
import DOM from '../helpers/dom.helpers';

export const mState = {
	DOWN: 0,
	UP: 1,
};

export const toileType = {
	NODE: 0,
	NODE_IN: 1,
	NODE_OUT: 2,
	NODE_SKELETON: 3,
	CONTOUR_NODE: 4,
	CONTOUR_NODE_IN: 5,
	CONTOUR_NODE_OUT: 6,
	GLYPH_CONTOUR: 7,
	GLYPH_COMPONENT_CONTOUR: 8,
	COMPONENT_CHOICE: 9,
};

export const canvasMode = {
	MOVE: 0,
	SELECT_POINTS: 1,
	COMPONENTS: 2,
};

export const appState = {
	UNSELECTED: -1,
	HANDLE_MOD: 0,
	ONCURVE_MOD: 1,
	SKELETON_POS: 2,
	SKELETON_DISTR: 3,
};

const green = '#24d390';
const blue = '#00c4d6';
const yellow = '#f5e462';
const grey = '#3b3b3b';
const mediumGrey = '#7e7e7e';
const lightGrey = '#c6c6c6';
const lightestGrey = '#f6f6f6';
// const white = '#fefefe';
const red = '#ff725e';

const transparent = 'transparent';
const inHandleColor = yellow;
const outHandleColor = blue;
const onCurveColor = green;
const skeletonColor = red;
const ringBackground = 'rgba(255,114,94,0.4)';

const pointMenuAnimationLength = 10;

const nodeDrawRadius = 3;
const nodeHotDrawRadius = 3;
const nodeHotRadius = 6;

const labelForMenu = {
	[toileType.NODE]: 'On curve control point',
	[toileType.NODE_IN]: 'Handle in',
	[toileType.NODE_OUT]: 'Handle out',
	[toileType.NODE_SKELETON]: 'Skeleton control point',
};
const menuTextSize = 30;

const infinityDistance = 10000000;

export function inverseProjectionMatrix([a, b, c, d, e, f]) {
	return [
		1 / a,
		b,
		c,
		1 / d,
		-e / a,
		-f / d,
	];
}

export function transformCoords(coordsArray, matrix, height) {
	const [a, b, c, d, tx, ty] = matrix;

	return _.map(coordsArray, coords =>
		({
			x: (a * coords.x) + (b * coords.y) + tx,
			y: (c * coords.x) + (d * coords.y) + (ty - height),
		}),
	);
}

export default class Toile {
	constructor(canvas) {
		this.context = canvas.getContext('2d');
		this.mouse = {x: 0, y: 0};
		this.mouseDelta = {x: 0, y: 0};
		this.height = canvas.height;
		this.mouseWheelDelta = 0;
		this.keyboardUp = {};
		this.keyboardDown = {};
		this.keyboardDownRisingEdge = {};

		// This is the view matrix schema
		// [ a  b  tx ]   [ x ]   [ ax + by + tx ]
		// [ c  d  ty ] x [ y ] = [ cx + dy + ty ]
		// [ 0  0  1  ]   [ 1 ]   [ 0  + 0  + 1  ]
		// a is x scaling
		// d is y scaling
		// b is y on x influence
		// c is x on y influence
		// tx is x translation
		// ty is y translation
		this.viewMatrix = [1, 0, 0, -1, 0, 0];


		canvas.addEventListener('mousemove', (e) => {
			const {offsetLeft, offsetTop} = DOM.getAbsOffset(canvas);
			const mouseX = e.clientX - offsetLeft;
			const mouseY = e.clientY - offsetTop;

			if (this.mouseState === mState.DOWN) {
				this.mouseDelta = {
					x: this.mouseDelta.x + (mouseX - this.mouse.x),
					y: this.mouseDelta.y + (mouseY - this.mouse.y),
				};
			}

			this.mouse = {
				x: mouseX,
				y: mouseY,
			};
		});

		canvas.addEventListener('mousedown', () => {
			this.mouseState = mState.DOWN;
		});

		canvas.addEventListener('mouseup', () => {
			this.mouseState = mState.UP;
		});

		canvas.addEventListener('wheel', (e) => {
			this.mouseWheelDelta -= e.deltaY;
		});

		document.addEventListener('keyup', (e) => {
			const {
				keyCode,
				ctrlKey,
				shiftKey,
				altKey,
				metaKey,
			} = e;

			this.keyboardUp = {
				keyCode,
				special: (ctrlKey ? 0b1 : 0)
					+ (shiftKey ? 0b10 : 0)
					+ (altKey ? 0b100 : 0)
					+ (metaKey ? 0b1000 : 0),
			};
		});

		document.addEventListener('keydown', (e) => {
			const {
				keyCode,
				ctrlKey,
				shiftKey,
				altKey,
				metaKey,
			} = e;
			const eventData = {
				keyCode,
				special: (ctrlKey ? 0b1 : 0)
					+ (shiftKey ? 0b10 : 0)
					+ (altKey ? 0b100 : 0)
					+ (metaKey ? 0b1000 : 0),
			};

			if (this.keyboardDown.keyCode !== keyCode) {
				this.keyboardDownRisingEdge = eventData;
			}

			this.keyboardDown = eventData;
		});

		this.interactionList = [];
	}

	clearDelta() {
		this.mouseDelta = {
			x: 0,
			y: 0,
		};
	}

	clearWheelDelta() {
		this.mouseWheelDelta = 0;
	}

	clearKeyboardInput() {
		this.keyboardUp = {};
		this.keyboardDown = {};
		this.keyboardDownRisingEdge = {};
	}

	clearKeyboardEdges() {
		this.keyboardDownRisingEdge = {};
	}

	clearCanvas(width, height) {
		this.context.clearRect(0, 0, width, height);
		this.interactionList = [];
	}

	getMouseState() {
		return {
			pos: this.mouse,
			delta: this.mouseDelta,
			state: this.mouseState,
			wheel: this.mouseWheelDelta,
		};
	}

	drawTypographicFrame(glyph, values) {
		const lowerCornerRightRectangle = {
			x: -infinityDistance,
			y: -infinityDistance,
		};
		const upperCornerRightRectangle = {
			x: 0,
			y: infinityDistance,
		};
		const bottomZeroLine = {
			x: 0,
			y: -infinityDistance,
		};
		const bottomAdvanceWidthLine = {
			x: glyph.advanceWidth,
			y: -infinityDistance,
		};
		const topAdvanceWidthLine = {
			x: glyph.advanceWidth,
			y: infinityDistance,
		};
		const lowerCornerLeftRectangle = {
			x: glyph.advanceWidth,
			y: -infinityDistance,
		};
		const upperCornerLeftRectangle = {
			x: infinityDistance,
			y: infinityDistance,
		};

		this.drawRectangleFromCorners(
			lowerCornerRightRectangle,
			upperCornerRightRectangle,
			lightestGrey,
			lightestGrey,
		);
		this.drawRectangleFromCorners(
			lowerCornerLeftRectangle,
			upperCornerLeftRectangle,
			lightestGrey,
			lightestGrey,
		);
		this.drawLine(
			bottomZeroLine,
			upperCornerRightRectangle,
			green,
		);
		this.drawLine(
			bottomAdvanceWidthLine,
			topAdvanceWidthLine,
			green,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight},
			{x: infinityDistance, y: values.xHeight},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.overshoot},
			{x: infinityDistance, y: values.xHeight + values.overshoot},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.capDelta},
			{x: infinityDistance, y: values.xHeight + values.capDelta},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.capDelta + values.overshoot},
			{x: infinityDistance, y: values.xHeight + values.capDelta + values.overshoot},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: 0},
			{x: infinityDistance, y: 0},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: -values.overshoot},
			{x: infinityDistance, y: -values.overshoot},
			lightGrey,
		);
	}

	drawControlPoint(node, hotness, fillColor) {
		this.drawCircle(
			node,
			hotness ? nodeHotDrawRadius : nodeDrawRadius,
			fillColor,
			hotness ? fillColor : transparent,
		);
	}

	drawContourNode(node, id, prevNode, nextNode, hotItems, componentPrefixAddress) {
		this.drawHandleNode({
			node,
			otherNode: prevNode,
			otherDir: prevNode.dirOut,
			handle: node.handleIn,
			id,
			handleId: `${id}.handleIn`,
			type: toileType.CONTOUR_NODE_IN,
			hotItems,
			color: inHandleColor,
		}); // in
		this.drawHandleNode({
			node,
			otherNode: nextNode,
			otherDir: nextNode.dirIn,
			handle: node.handleOut,
			id,
			handleId: `${id}.handleOut`,
			type: toileType.CONTOUR_NODE_OUT,
			hotItems,
			color: outHandleColor,
		}); // out

		const hot = _.find(hotItems, item => item.id === id);
		const modifAddress = `${componentPrefixAddress}${node.nodeAddress}`;

		this.drawControlPoint(node, hot, onCurveColor);
		this.interactionList.push({
			id,
			type: toileType.CONTOUR_NODE,
			data: {
				center: {
					x: node.x,
					y: node.y,
				},
				base: {
					x: node.xBase,
					y: node.yBase,
				},
				radius: nodeHotRadius,
				modifAddress,
			},
		});
	}

	drawExpandedNode(node,
		id,
		parentNode,
		parentId,
		hotItems,
		prevNode,
		nextNode,
		prevDir,
		nextDir,
		componentPrefixAddress,
	) {
		this.drawHandleNode({
			node,
			otherNode: prevNode,
			otherDir: prevDir || 0,
			handle: node.handleIn,
			id,
			parentId,
			handleId: `${id}.handleIn`,
			type: toileType.NODE_IN,
			hotItems,
			color: inHandleColor,
		}); // in
		this.drawHandleNode({
			node,
			otherNode: nextNode,
			otherDir: nextDir || 0,
			handle: node.handleOut,
			id,
			parentId,
			handleId: `${id}.handleOut`,
			type: toileType.NODE_OUT,
			hotItems,
			color: outHandleColor,
		}); // out

		const hot = _.find(hotItems, item => item.id === id);

		const drawNode = !(parentNode
			&& parentNode.x === node.x
			&& parentNode.y === node.y);

		if (drawNode) {
			this.drawControlPoint(node, hot, node.handleIn ? onCurveColor : skeletonColor);
		}

		if (id) {
			if (node.handleIn || node.handleOut) {
				if (drawNode) {
					const {oppositeId, angleOffset} = parentNode.expandedTo[0] === node
						? {
							oppositeId: `${parentId}.expandedTo[1]`,
							angleOffset: Math.PI,
						}
						: {
							oppositeId: `${parentId}.expandedTo[0]`,
							angleOffset: 0,
						};
					const modifAddress = `${componentPrefixAddress}${parentNode.nodeAddress}expand`;

					this.interactionList.push({
						id,
						type: toileType.NODE,
						data: {
							parentId,
							center: {
								x: node.x,
								y: node.y,
							},
							radius: nodeHotRadius,
							oppositeId,
							baseWidth: parentNode.expand.baseWidth,
							modifAddress,
							skeleton: parentNode,
							baseAngle: parentNode.expand.baseAngle,
							angleOffset,
						},
					});
				}
			}
		}
	}

	drawHandleNode({
		node,
		otherNode,
		otherDir,
		handle,
		id,
		parentId,
		handleId,
		type,
		hotItems,
		color,
	}) {
		let handleNode = handle;

		if (handle.x === node.x && handle.y === node.y) {
			const prevVec = subtract2D(otherNode, handle);
			const prevDist = distance2D(otherNode, handle);
			const normalizePrev = normalize2D(prevVec);
			const handleVec = add2D(mulScalar2D(prevDist / 3, normalizePrev), handle);

			handleNode = handleVec;
		}

		const inHot = _.find(hotItems, item => item.id === handleId);

		this.drawLine(handleNode, node, color, color);
		this.drawControlPoint(handleNode, inHot, color);

		if (handleId) {
			this.interactionList.push({
				id: handleId,
				type,
				data: {
					center: {
						x: handleNode.x,
						y: handleNode.y,
					},
					radius: nodeHotRadius,
					parentId: id,
					skeletonId: parentId,
					otherNode,
					otherDir,
				},
			});
		}
	}

	drawSkeletonNode(node, id, hotItems, j, nodes, contour, componentPrefixAddress) {
		const hot = _.find(hotItems, item => item.id === id);
		const modifAddress = `${componentPrefixAddress}${node.nodeAddress}`;

		if (node.expand) {
			this.drawControlPoint(node, hot, node.handleIn ? onCurveColor : skeletonColor);
			this.interactionList.push({
				id,
				type: toileType.NODE_SKELETON,
				data: {
					center: {
						x: node.x,
						y: node.y,
					},
					base: {
						x: node.xBase,
						y: node.yBase,
					},
					expandedTo: node.expandedTo,
					width: node.expand.width,
					baseDistr: node.expand.baseDistr,
					radius: nodeHotRadius,
					modifAddress,
				},
			});
		}


		let prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
		let nextNode = nodes[(j + 1) % nodes.length];

		if (!contour.closed) {
			if (j === nodes.length - 1) {
				nextNode = {
					dirIn: nodes[j].dirOut,
					dirOut: nodes[j].dirOut,
					expandedTo: [
						nodes[j].expandedTo[1],
						nodes[j].expandedTo[0],
					],
				};
			}
			else if (j === 0) {
				prevNode = {
					dirIn: nodes[j].dirIn,
					dirOut: nodes[j].dirIn,
					expandedTo: [
						nodes[j].expandedTo[1],
						nodes[j].expandedTo[0],
					],
				};
			}
		}

		this.drawExpandedNode(
			node.expandedTo[0],
			`${id}.expandedTo.0`,
			node,
			id,
			hotItems,
			prevNode.expandedTo[0],
			nextNode.expandedTo[0],
			prevNode.dirOut,
			nextNode.dirIn,
			componentPrefixAddress,
		);
		this.drawExpandedNode(
			node.expandedTo[1],
			`${id}.expandedTo.1`,
			node,
			id,
			hotItems,
			nextNode.expandedTo[1],
			prevNode.expandedTo[1],
			nextNode.dirIn,
			prevNode.dirOut,
			componentPrefixAddress,
		);
	}


	drawNodes(contour = {nodes: []}, contourCursor, hotItems, componentPrefixAddress) {
		const nodes = contour.nodes;

		nodes.forEach((node, j) => {
			const id = `${contourCursor}.nodes.${j}`;

			if (contour.skeleton && node.expand) {
				this.drawSkeletonNode(node, id, hotItems, j, nodes, contour, componentPrefixAddress);
			}
			else if (node.expandedTo) {
				const prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
				const nextNode = nodes[(j + 1) % nodes.length];

				this.drawContourNode(node.expandedTo[0], `${id}.expandedTo.0`, prevNode, nextNode, hotItems, componentPrefixAddress);
				this.drawContourNode(node.expandedTo[1], `${id}.expandedTo.1`, nextNode, prevNode, hotItems, componentPrefixAddress);
			}
			else {
				const prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
				const nextNode = nodes[(j + 1) % nodes.length];

				this.drawContourNode(node, id, prevNode, nextNode, hotItems, componentPrefixAddress);
			}
		});
	}

	drawGlyph(glyph) {
		this.context.fillStyle = 'black';
		this.context.strokeStyle = 'black';
		this.context.beginPath();
		glyph.otContours.forEach((bez) => {
			this.drawContour(bez, undefined, undefined, true);
		});

		this.context.stroke();
		this.context.fill();
	}

	drawSelectableContour(glyph, hotItems, parentId = '', type = toileType.GLYPH_CONTOUR, componentIdx) {
		let startIndexBeziers = 0;

		glyph.contours.forEach((contour, i) => {
			const id = `${parentId}contours.${i}`;
			const hot = _.find(hotItems, item => item.id === id);
			let length;

			if (contour.skeleton && contour.closed) {
				length = 2;
			}
			else {
				length = 1;
			}
			const deepListOfBeziers = _.slice(glyph.otContours,
				startIndexBeziers,
				startIndexBeziers + length,
			);
			const listOfBezier = _.flatten(deepListOfBeziers);


			if (hot) {
				this.context.strokeStyle = green;
				this.context.lineWidth = 1;
				this.context.beginPath();
				deepListOfBeziers.forEach((bez) => {
					this.drawContour(bez, undefined, undefined, true);
				});
				this.context.stroke();
				this.context.lineWidth = 1;
			}

			this.interactionList.push({
				id,
				type,
				data: {
					componentIdx,
					beziers: listOfBezier,
					contour,
					indexes: [startIndexBeziers, startIndexBeziers + length],
				},
			});

			startIndexBeziers += length;
		});

		glyph.components.forEach((component, i) => {
			this.drawSelectableContour(component, hotItems, `components.${i}.`, toileType.GLYPH_COMPONENT_CONTOUR, i);
		});
	}

	drawSelectedContour(contour) {
		this.context.strokeStyle = green;
		this.context.lineWidth = 1;
		this.context.beginPath();
		contour.forEach((bez) => {
			this.drawContour(bez, undefined, undefined, true);
		});
		this.context.stroke();
		this.context.lineWidth = 1;
	}

	drawComponents(components, hotItems) {

		components.forEach((component, i) => {
			let startIndexBeziers = 0;

			component.contours.forEach((contour) => {
				const id = `components.${i}`;
				const hot = _.find(hotItems, item => item.id === id);
				let length;

				if (contour.skeleton && contour.closed) {
					length = 2;
				}
				else {
					length = 1;
				}
				const deepListOfBeziers = _.slice(component.otContours,
					startIndexBeziers,
					startIndexBeziers + length,
				);
				const listOfBezier = _.flatten(deepListOfBeziers);

				if (hot) {
					this.context.strokeStyle = blue;
					this.context.fillStyle = blue;
				}
				else {
					this.context.strokeStyle = green;
					this.context.fillStyle = green;
				}
				this.context.lineWidth = 1;
				this.context.beginPath();
				deepListOfBeziers.forEach((bez) => {
					this.drawContour(bez, undefined, undefined, true);
				});
				this.context.stroke();
				this.context.fill();
				this.context.fillStyle = transparent;
				this.context.lineWidth = 1;

				this.interactionList.push({
					id,
					type: toileType.COMPONENT_CHOICE,
					data: {
						beziers: listOfBezier,
						id: component.id,
					},
				});

				startIndexBeziers += length;
			});
		});
	}

	setCamera(point, zoom, height) {
		this.height = height;
		this.viewMatrix = [zoom, 0, 0, -1 * zoom, point.x, point.y];
	}

	// A drawn contour must be closed
	drawContour(listOfBezier, strokeColor = 'transparent', fillColor = 'transparent', noPathCreation) {
		if (!noPathCreation) {
			this.context.fillStyle = fillColor;
			this.context.strokeStyle = strokeColor;
			this.context.beginPath();
		}

		_.each(listOfBezier, (bezier, i) => {
			this.drawBezierCurve(bezier, undefined, true, !i);
		});

		if (!noPathCreation) {
			this.context.stroke();
			this.context.fill();
		}
	}

	drawBezierCurve(aBezier, strokeColor, noPathCreation, move) {
		const bezier = transformCoords(
			aBezier,
			this.viewMatrix,
			this.height,
		);

		if (!noPathCreation) {
			this.context.fillStyle = 'transparent';
			this.context.strokeStyle = strokeColor;
			this.context.beginPath();
		}
		if (move) {
			this.context.moveTo(bezier[0].x, bezier[0].y);
		}

		this.context.bezierCurveTo(
			bezier[1].x,
			bezier[1].y,
			bezier[2].x,
			bezier[2].y,
			bezier[3].x,
			bezier[3].y,
		);

		if (!noPathCreation) {
			this.context.stroke();
		}
	}

	drawLine(aStart, aEnd, strokeColor = 'transparent', id, dash = []) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.setLineDash(dash);
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
		this.context.setLineDash([]);
	}

	drawRectangleFromCorners(aStart, aEnd, strokeColor = 'transparent', fillColor = 'transparent') {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height,
		);
		const widthHeight = subtract2D(end, start);

		this.context.fillStyle = fillColor;
		this.context.strokeStyle = fillColor;
		this.context.fillRect(start.x, start.y, widthHeight.x, widthHeight.y);
		this.context.strokeRect(start.x, start.y, widthHeight.x, widthHeight.y, strokeColor);
	}

	drawCircle(aCenter, radius, strokeColor = 'black', fillColor = 'transparent') {
		const [center] = transformCoords(
			[aCenter],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.fillStyle = fillColor;
		this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
		this.context.stroke();
		this.context.fill();
	}

	drawArcBetweenVector(aOrigin, startVec, endVec, strokeColor, radius = 50) {
		const startAngle = Math.atan2(startVec.y, startVec.x);
		const endAngle = Math.atan2(endVec.y, endVec.x);

		const [origin] = transformCoords(
			[aOrigin],
			this.viewMatrix,
			this.height,
		);

		this.context.strokeStyle = strokeColor;
		this.context.beginPath();
		this.context.arc(origin.x, origin.y, radius, startAngle, endAngle, true);
		this.context.stroke();
	}

	drawRing(aCenter, innerRadius, outerRadius, strokeColor = 'transparent', fillColor = 'transparent') {
		const [center] = transformCoords(
			[aCenter],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.fillStyle = fillColor;
		this.context.arc(center.x, center.y, innerRadius, 0, 2 * Math.PI);
		this.context.arc(center.x, center.y, outerRadius, 0, 2 * Math.PI, true);
		this.context.stroke();
		this.context.fill();
	}

	drawText(text, point, textSize, textColor) {
		const [transformedPoint] = transformCoords(
			[point],
			this.viewMatrix,
			this.height,
		);

		this.context.font = `${textSize}px 'Fira sans', sans-serif`;
		this.context.fillStyle = textColor;

		this.context.fillText(text, transformedPoint.x, transformedPoint.y);
	}

	measureNodeMenuName(point) {
		const text = labelForMenu[point.type] || 'hello';

		return this.measureText(text, menuTextSize, 'Fira sans');
	}

	measureText(text, size = 20, font = 'Fira sans') {
		this.context.font = `${size}px '${font}', sans-serif`;

		return this.context.measureText(text);
	}

	drawNodeMenuName(point, pos, size, hotItems) {
		const text = labelForMenu[point.type] || 'hello';
		const hot = _.find(hotItems, item => item.id === `${point.id}_menuItem`);

		this.drawText(text, pos, menuTextSize, hot ? '#24d390' : '#fefefe');
		this.interactionList.push({
			id: `${point.id}_menuItem`,
			type: toileType.POINT_MENU_ITEM,
			data: {
				point,
				size,
				pos,
			},
		});
	}

	drawMultiplePointsMenu(points, frameCounters, hotItems = []) {
		const offset = mulScalar2D(1 / this.viewMatrix[0], {x: 20, y: 20});
		const start = add2D(points[0].data.center, offset);
		let textWidth = 0;


		let textPos = add2D(
			points[0].data.center,
			add2D(offset, mulScalar2D(1 / this.viewMatrix[0], {x: 10, y: 10})),
		);
		const textStep = {x: 0, y: 50 / this.viewMatrix[0]};
		const nameSizes = [];

		points.forEach((point) => {
			const size = this.measureNodeMenuName(point).width;

			textWidth = Math.max(textWidth, (size + 20) / this.viewMatrix[0]);
			nameSizes.push(size);
		});

		const size = mulScalar2D(
			Math.min(1, frameCounters / pointMenuAnimationLength),
			{x: textWidth, y: ((40 * points.length) + (10 * points.length) - 10) / this.viewMatrix[0]},
		);
		const end = add2D(start, size);

		this.drawRectangleFromCorners(start, end, undefined, '#333');

		points.forEach((point, i) => {
			this.drawNodeMenuName(point, textPos, nameSizes[i], hotItems);
			textPos = add2D(textPos, textStep);
		});

		this.interactionList.push({
			id: 'multiple_points',
			type: toileType.POINT_MENU,
			data: {
				start,
				size,
				points,
			},
		});
	}

	drawToolsLib(toolsLib, appStateValue) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [mouseTransformed] = transformCoords(
			[this.mouse],
			inverseMatrix,
			this.height / this.viewMatrix[0],
		);

		toolsLib.forEach((tools, i) => {
			const offset = mulScalar2D(1 / this.viewMatrix[0], {x: 20, y: -20 - (30 * i)});
			const start = add2D(mouseTransformed, offset);
			const size = mulScalar2D(1 / this.viewMatrix[0], {x: 30 * tools.length, y: -30});
			const end = add2D(start, size);

			this.drawRectangleFromCorners(start, end, undefined, '#24d390');
			tools.forEach((tool, j) => {
				const width = this.measureText(tool.key, 15, 'Fira sans').width;
				const toolStart = add2D(start, mulScalar2D(j / this.viewMatrix[0], {x: 30, y: 0}));
				const toolSize = mulScalar2D(1 / this.viewMatrix[0], {x: 30, y: -30});
				const toolEnd = add2D(toolStart, toolSize);
				const textPoint = add2D(
					mulScalar2D(1 / this.viewMatrix[0],
						{
							x: -width / 2,
							y: -7.5,
						},
					),
					mulScalar2D(
						1 / 2,
						add2D(toolStart, toolEnd),
					),
				);
				let color;

				if (appStateValue === tool.mode) {
					color = blue;
				}
				this.drawRectangleFromCorners(toolStart, toolEnd, undefined, color);
				this.drawText(tool.key, textPoint, 15, grey);
			});
		});
	}

	drawNodeToolsLib(appStateValue) {
		this.drawToolsLib(
			[
				[
					{
						key: 'e',
						mode: appState.ONCURVE_THICKNESS,
					},
					{
						key: 'r',
						mode: appState.ONCURVE_ANGLE,
					},
					{
						key: 'd',
						mode: appState.SKELETON_POS,
					},
					{
						key: 'f',
						mode: appState.SKELETON_DISTR,
					},
				],
			],
			appStateValue,
		);
	}

	drawNodeSkeletonToolsLib(appStateValue) {
		this.drawToolsLib([
			{
				key: 'o',
				mode: appState.SKELETON_POS,
			},
			{
				key: 'p',
				mode: appState.SKELETON_DISTR,
			},
		], appStateValue);
	}

	drawNodeHandleToolsLib(appStateValue) {
		this.drawToolsLib([
			{},
			{},
			{},
		], appStateValue);
	}

	drawAngleBetweenHandleAndMouse(node, handle) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [mouseTransformed] = transformCoords(
			[this.mouse],
			inverseMatrix,
			this.height / this.viewMatrix[0],
		);
		const [nodeTransformed, handleTransformed, mouseSuperTransformed] = transformCoords(
			[node, handle, mouseTransformed],
			this.viewMatrix,
			this.height,
		);

		const startVec = subtract2D(handleTransformed, nodeTransformed);
		const endVec = subtract2D(mouseSuperTransformed, nodeTransformed);

		this.drawLine(node, mouseTransformed, '#24d390');
		this.drawLine(node, handle, '#ff00ff');
		this.drawArcBetweenVector(node, startVec, endVec, '#24d390');
	}

	drawThicknessTool(node, id, hotItems) {
		const [oppositeExpanded, expandedSource] = node.expandedTo;
		const normalVector = normalize2D({
			x: expandedSource.y - oppositeExpanded.y,
			y: oppositeExpanded.x - expandedSource.x,
		});
		const inHot = _.find(hotItems, item => item.id === id);
		const toolPoints = [
			add2D(expandedSource, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
			add2D(oppositeExpanded, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
			add2D(node, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
		];
		const color = inHot ? red : blue;

		this.drawLine(expandedSource, oppositeExpanded, blue);
		this.drawLine(expandedSource, toolPoints[0], blue, undefined, [4, 4]);
		this.drawLine(oppositeExpanded, toolPoints[1], blue, undefined, [4, 4]);
		this.drawLine(toolPoints[0], toolPoints[1], color);
		this.drawCircle(toolPoints[0], nodeDrawRadius, color, undefined);
		this.drawCircle(toolPoints[1], nodeDrawRadius, color, undefined);
		this.drawCircle(toolPoints[2], nodeDrawRadius, undefined, yellow);
	}

	drawNodeTool(node, id, hotItems) {
		const [farthestNode, closestNode] = node.expand.distr > 0.5
			? [node.expandedTo[0], node.expandedTo[1]]
			: [node.expandedTo[1], node.expandedTo[0]];
		const radius = distance2D(farthestNode, node) * this.viewMatrix[0];
		const inHot = _.find(hotItems, item => item.id === id);
		const color = inHot ? blue : green;

		this.drawRing(node, radius - 2, radius + 2, undefined, ringBackground);
		this.drawLine(closestNode, farthestNode, green, undefined, [5, 5, 15, 5]);
		this.drawCircle(farthestNode, 5, color, color);

		const direction = subtract2D(farthestNode, node);
		const angle = `θ ${(Math.atan2(direction.y, direction.x) * 180 / Math.PI).toFixed(1)}°`;
		const width = `w ${node.expand.width.toFixed(1)}`;
		const widthTextSize = this.measureText(width, 20, 'Fira sans');
		const angleTextSize = this.measureText(angle, 20, 'Fira sans');
		const normalVector = normalize2D({
			x: direction.y,
			y: -direction.x,
		});

		this.drawText(angle,
			add2D(
				add2D(
					mulScalar2D(1 / 2, add2D(node, farthestNode)),
					mulScalar2D(-35 / this.viewMatrix[0], normalVector),
				),
				{
					x: -angleTextSize.width / (2 * this.viewMatrix[0]),
					y: 0,
				},
			),
			20,
			red,
		);
		this.drawText(width,
			add2D(
				add2D(
					mulScalar2D(1 / 2, add2D(node, farthestNode)),
					mulScalar2D(-30 / this.viewMatrix[0], normalVector),
				),
				{
					x: -widthTextSize.width / (2 * this.viewMatrix[0]),
					y: -30 / this.viewMatrix[0],
				},
			),
			20,
			green,
		);
	}

	drawSkeletonDistrTool(node) {
		const [zoom] = this.viewMatrix;
		const normalVector = normalize2D({
			x: node.expandedTo[1].y - node.expandedTo[0].y,
			y: node.expandedTo[0].x - node.expandedTo[1].x,
		});
		const toolPos = add2D(node, mulScalar2D(20 / zoom, normalVector));

		this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		this.drawLine(node, add2D(node, mulScalar2D(20 / zoom, normalVector)), red);
		this.drawCircle(toolPos, 8, 'transparent', red);

		const distribText = node.expand.distr.toFixed(1);
		const distribTextSize = this.measureText(distribText, 15, 'Fira sans');
		const distribCoordsPos = add2D(mulScalar2D(1 / zoom, {x: 20, y: 0}), node);

		this.drawText(distribText,
			add2D(
				distribCoordsPos,
				{
					x: -distribTextSize.width / (2 * zoom),
					y: 0,
				},
			),
			20,
			red,
		);
	}

	drawSkeletonPosTool(node) {
		const [zoom] = this.viewMatrix;
		const topLeft = add2D(mulScalar2D(1 / zoom, {x: -6, y: 6}), node);
		const bottomLeft = add2D(mulScalar2D(1 / zoom, {x: -6, y: -6}), node);
		const topRight = add2D(mulScalar2D(1 / zoom, {x: 6, y: 6}), node);
		const bottomRight = add2D(mulScalar2D(1 / zoom, {x: 6, y: -6}), node);
		const oldWidth = this.context.lineWidth;

		this.context.lineWidth = 2;
		this.drawLine(topLeft, bottomRight, red);
		this.drawLine(bottomLeft, topRight, red);
		this.context.lineWidth = oldWidth;
		if (node.expandedTo) {
			this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		}

		const xText = `x: ${node.x.toFixed(0)}`;
		const yText = `y: ${node.y.toFixed(0)}`;
		const xTextSize = this.measureText(xText, 15, 'Fira sans');
		const yTextSize = this.measureText(yText, 15, 'Fira sans');
		const xCoordsPos = add2D(mulScalar2D(1 / zoom, {x: 20, y: 40}), node);
		const yCoordsPos = add2D(mulScalar2D(1 / zoom, {x: 20, y: 20}), node);

		this.drawText(xText,
			add2D(
				xCoordsPos,
				{
					x: -xTextSize.width / (2 * zoom),
					y: 0,
				},
			),
			20,
			red,
		);

		this.drawText(yText,
			add2D(
				yCoordsPos,
				{
					x: -yTextSize.width / (2 * zoom),
					y: 0,
				},
			),
			20,
			red,
		);
	}

	getHotInteractiveItem() {
		const result = [];

		this.interactionList.forEach((interactionItem) => {
			switch (interactionItem.type) {
			case toileType.COMPONENT_CHOICE:
			case toileType.GLYPH_COMPONENT_CONTOUR:
			case toileType.GLYPH_CONTOUR: {
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);

				const lineEnd = add2D(mouseTransformed, {x: 1, y: 0});

				let polyNumber = 0;

				interactionItem.data.beziers.forEach((bezier) => {
					const ts = getIntersectionTValue(
						bezier[0],
						bezier[1],
						bezier[3],
						bezier[2],
						mouseTransformed,
						lineEnd,
					);

					if (ts) {
						ts.forEach((t) => {
							const point = getPointOnCurve(bezier, t);

							if (t !== undefined && point.x > mouseTransformed.x) {
								polyNumber++;
							}
						});
					}
				});

				if (polyNumber % 2) {
					result.push(interactionItem);
				}

				break;
			}
			case toileType.NODE_IN:
			case toileType.NODE_OUT:
			case toileType.NODE_SKELETON:
			case toileType.CONTOUR_NODE:
			case toileType.CONTOUR_NODE_OUT:
			case toileType.CONTOUR_NODE_IN:
			case toileType.NODE: {
				let refDistance = interactionItem.data.radius / this.viewMatrix[0];
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);
				const distance = distance2D(interactionItem.data.center, mouseTransformed);

				if (distance <= refDistance) {
					refDistance = distance;
					result.push(interactionItem);
				}

				break;
			}
				//				case toileType.POINT_MENU: {
				//					const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				//					const [mouseTransformed] = transformCoords(
				//						[this.mouse],
				//						inverseMatrix,
				//						this.height / this.viewMatrix[0]
				//					);
				//					const {start, size} = interactionItem.data;
				//					const diffVect = subtract2D(mouseTransformed, start);
				//
				//					if (
				//						diffVect.x <= size.x + 20 / this.viewMatrix[0]
				//						&& diffVect.x >= -40 / this.viewMatrix[0]
				//						&& diffVect.y <= size.y + 20 / this.viewMatrix[0]
				//						&& diffVect.y >= -40 / this.viewMatrix[0]
				//					) {
				//						result.push(interactionItem);
				//					}
				//
				//					/* #if dev */
				//					//let color = '#24d390';
				//					//this.drawLine(start, mouseTransformed, color);
				//					/* #end */
				//					break;
				//				}
				//				case toileType.POINT_MENU_ITEM: {
				//					const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				//					const [zoom] = this.viewMatrix;
				//					const [mouseTransformed] = transformCoords(
				//						[this.mouse],
				//						inverseMatrix,
				//						this.height / zoom
				//					);
				//					const {pos, size} = interactionItem.data;
				//					const diffVect = subtract2D(mouseTransformed, pos);
				//
				//					if (
				//						diffVect.x <= size + 10 / zoom
				//						&& diffVect.x >= -10 / zoom
				//						&& diffVect.y <= 35 / zoom
				//						&& diffVect.y >= -5 / zoom
				//					) {
				//						result.push(interactionItem);
				//					}
				//
				//					/* #if dev */
				//					const color = '#24d390';
				//
				//					this.drawLine(pos, mouseTransformed, color);
				//					/* #end */
				//					break;
				//				}
			default:
				break;
			}
		});

		return result;
	}
}

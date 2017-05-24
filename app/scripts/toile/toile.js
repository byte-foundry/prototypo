/* global _ */
import {distance2D, subtract2D, add2D, mulScalar2D, normalize2D} from '../plumin/util/linear.js';
import DOM from '../helpers/dom.helpers.js';

export const mState = {
	DOWN: 0,
	UP: 1,
};

export const toileType = {
	NODE: 0,
	NODE_IN: 1,
	NODE_OUT: 2,
	NODE_SKELETON: 3,
	POINT_MENU: 4,
	POINT_MENU_ITEM: 5,
};

export const appState = {
	UNSELECTED: -1,
	HANDLE_MOD: 0,
	ONCURVE_THICKNESS: 1,
	ONCURVE_ANGLE: 2,
	SKELETON_POS: 3,
	SKELETON_DISTR: 4,
};

const green = '#24d390';
const blue = '#00c4d6';
const yellow = '#f5e462';
const grey = '#333333';
const white = '#fefefe';
const red = '#ff725e';

const transparent = 'transparent';
const inHandleColor = yellow;
const hotInHandleColor = '#d5c650';
const outHandleColor = blue;
const hotOutHandleColor = '#00a9b6';
const onCurveColor = green;
const hotOnCurveColor = '#12b372';
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

	return _.map(coordsArray, (coords) => {
		return {
			x: a * coords.x + b * coords.y + tx,
			y: c * coords.x + d * coords.y + (ty - height),
		};
	});
}

export default class Toile {
	constructor(canvas) {
		this.context = canvas.getContext('2d');
		this.mouse = {x: 0, y: 0};
		this.mouseDelta = {x: 0, y: 0};
		this.height = canvas.height;
		this.mouseWheelDelta = 0;

		//This is the view matrix schema
		//[ a  b  tx ]   [ x ]   [ ax + by + tx ]
		//[ c  d  ty ] x [ y ] = [ cx + dy + ty ]
		//[ 0  0  1  ]   [ 1 ]   [ 0  + 0  + 1  ]
		//a is x scaling
		//d is y scaling
		//b is y on x influence
		//c is x on y influence
		//tx is x translation
		//ty is y translation
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

		canvas.addEventListener('mousewheel', (e) => {
			this.mouseWheelDelta += e.wheelDelta;
		});

		document.addEventListener('keyup', (e) => {
			const {
				keyCode,
				ctrlKey,
				shiftKey,
				altKey,
				metaKey,
			} = e;

			this.keyboardInput = {
				keyCode,
				special: (ctrlKey ? 0b1 : 0)
					+ (shiftKey ? 0b10 : 0)
					+ (altKey ? 0b100 : 0)
					+ (metaKey ? 0b1000 : 0),
			};
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
		this.keyboardInput = undefined;
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

	drawControlPoint(node, hotness, fillColor, hotFillColor) {
		this.drawCircle(
			node,
			hotness ? nodeHotDrawRadius : nodeDrawRadius,
			transparent,
			hotness ? hotFillColor : fillColor
		);
	}

	drawNode(node, id, parentId, hotItems) {
		if (node.handleIn) {
			const inHot = _.find(hotItems, (item) => {
				return item.id === `${id}.handleIn`;
			});

			this.drawLine(node.handleIn, node, inHandleColor, inHandleColor);
			this.drawControlPoint(node.handleIn, inHot, inHandleColor, hotInHandleColor);
			if (id) {
				this.interactionList.push({
					id: `${id}.handleIn`,
					type: toileType.NODE_IN,
					data: {
						center: {
							x: node.handleIn.x,
							y: node.handleIn.y,
						},
						radius: nodeHotRadius,
						parentId: id,
					},
				});
			}
		}
		if (node.handleOut) {
			const outHot = _.find(hotItems, (item) => {
				return item.id === `${id}.handleOut`;
			});

			this.drawLine(node.handleOut, node, outHandleColor, outHandleColor);
			this.drawControlPoint(node.handleOut, outHot, outHandleColor, hotOutHandleColor);
			if (id) {
				this.interactionList.push({
					id: `${id}.handleOut`,
					type: toileType.NODE_OUT,
					data: {
						center: {
							x: node.handleOut.x,
							y: node.handleOut.y,
						},
						radius: nodeHotRadius,
						parentId: id,
					},
				});
			}
		}

		const hot = _.find(hotItems, (item) => {
			return item.id === id;
		});

		this.drawControlPoint(node, hot, onCurveColor, hotOnCurveColor);

		if (id) {
			this.interactionList.push({
				id,
				type: node.handleIn || node.handleOut ? toileType.NODE : toileType.NODE_SKELETON,
				data: {
					center: {
						x: node.x,
						y: node.y,
					},
					radius: nodeHotRadius,
					parentId,
				},
			});
		}
	}

	drawGlyph(glyph, hotItems) {
		this.context.fillStyle = 'black';
		this.context.strokeStyle = 'black';
		this.context.beginPath();
		glyph.otContours.forEach((bez) => {
			this.drawContour(bez, undefined, undefined, true);
		});
		this.context.stroke();
		this.context.fill();

		glyph.contours.forEach((contour, i) => {
			contour.nodes.forEach((node, j) => {
				const id = `contours[${i}].nodes[${j}]`;

				if (node.x && node.y) {
					this.drawNode(node, id, undefined, hotItems);
				}
				if (node.expandedTo) {
					this.drawNode(node.expandedTo[0], `${id}.expandedTo[0]`, id, hotItems);
					this.drawNode(node.expandedTo[1], `${id}.expandedTo[1]`, id, hotItems);
				}
			});
		});

		glyph.components.forEach((component, k) => {
			component.contours.forEach((contour, i) => {
				contour.nodes.forEach((node, j) => {
					const id = `component[${k}].contours[${i}].nodes[${j}]`;

					if (node.x && node.y) {
						this.drawNode(node, id, undefined, hotItems);
					}
					if (node.expandedTo) {
						this.drawNode(node.expandedTo[0], `${id}.expandedTo[0]`, id, hotItems);
						this.drawNode(node.expandedTo[1], `${id}.expandedTo[1]`, id, hotItems);
					}
				});
			});
		});
	}

	setCamera(point, zoom, height) {
		this.height = height;
		this.viewMatrix = [zoom, 0, 0, -1 * zoom, point.x, point.y];
	}

	//A drawn contour must be closed
	drawContour(listOfBezier, strokeColor = "transparent", fillColor = "transparent", noPathCreation, id) {

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
			this.height
		);

		if (!noPathCreation) {
			this.context.fillStyle = "transparent";
			this.context.strokeStyle = strokeColor;
			this.context.beginPath();
		}
		if (move) {

			this.context.moveTo(bezier[0].x, bezier[0].y);
		}

		this.context.bezierCurveTo(bezier[1].x, bezier[1].y, bezier[2].x, bezier[2].y, bezier[3].x, bezier[3].y);

		if (!noPathCreation) {
			this.context.stroke();
		}
	}

	drawLine(aStart, aEnd, strokeColor = "transparent", id, dash = []) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.setLineDash(dash);
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
		this.context.setLineDash([]);
	}

	drawRectangleFromCorners(aStart, aEnd, strokeColor = 'transparent', fillColor = 'transparent', id) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height
		);
		const widthHeight = subtract2D(end, start);

		this.context.fillStyle = fillColor;
		this.context.strokeStyle = fillColor;
		this.context.fillRect(start.x, start.y, widthHeight.x, widthHeight.y);
		this.context.strokeRect(start.x, start.y, widthHeight.x, widthHeight.y, strokeColor);
	}

	drawRectangleFromCenterSize(origin, size, strokeColor, fillColor, id) {
	}

	drawCircle(aCenter, radius, strokeColor = 'black', fillColor = 'transparent', id) {
		const [center] = transformCoords(
			[aCenter],
			this.viewMatrix,
			this.height
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
			this.height
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
			this.height
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.fillStyle = fillColor;
		this.context.arc(center.x, center.y, innerRadius, 0, 2 * Math.PI);
		this.context.arc(center.x, center.y, outerRadius, 0, 2 * Math.PI, true);
		this.context.stroke();
		this.context.fill();
	}

	drawText(text, point, textSize, textColor, id) {
		const [transformedPoint] = transformCoords(
			[point],
			this.viewMatrix,
			this.height
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
		const hot = _.find(hotItems, (item) => {
			return item.id === `${point.id}_menuItem`;
		});

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


		let textPos = add2D(points[0].data.center, add2D(offset, mulScalar2D(1 / this.viewMatrix[0], {x: 10, y: 10})));
		const textStep = {x: 0, y: 50 / this.viewMatrix[0]};
		const nameSizes = [];

		points.forEach((point) => {
			const size = this.measureNodeMenuName(point).width;

			textWidth = Math.max(textWidth, (size + 20) / this.viewMatrix[0]);
			nameSizes.push(size);
		});

		const size = mulScalar2D(Math.min(1, frameCounters / pointMenuAnimationLength), {x: textWidth, y: (40 * points.length + 10 * points.length - 10) / this.viewMatrix[0]});
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
			this.height / this.viewMatrix[0]
		);
		toolsLib.forEach((tools, i) => {
			const offset = mulScalar2D(1 / this.viewMatrix[0], {x: 20, y: -20 - 30 * i});
			const start = add2D(mouseTransformed, offset);
			const size = mulScalar2D(1 / this.viewMatrix[0], {x: 30 * tools.length, y: -30});
			const end = add2D(start, size);

			this.drawRectangleFromCorners(start, end, undefined, '#24d390');
			tools.forEach((tool, i) => {
				const width = this.measureText(tool.key, 15, 'Fira sans').width;
				const toolStart = add2D(start, mulScalar2D(i / this.viewMatrix[0], {x: 30, y: 0}));
				const toolSize = mulScalar2D(1 / this.viewMatrix[0], {x: 30, y: -30});
				const toolEnd = add2D(toolStart, toolSize);
				const textPoint = add2D(
					mulScalar2D(1 / this.viewMatrix[0],
						{
							x: -width / 2,
							y: -7.5,
						}
					),
					mulScalar2D(
						1 / 2,
						add2D(toolStart, toolEnd),
					)
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
			appStateValue
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
			this.height / this.viewMatrix[0]
		);
		const [nodeTransformed, handleTransformed, mouseSuperTransformed] = transformCoords(
			[node, handle, mouseTransformed],
			this.viewMatrix,
			this.height
		);

		const startVec = subtract2D(handleTransformed, nodeTransformed);
		const endVec = subtract2D(mouseSuperTransformed, nodeTransformed);

		this.drawLine(node, mouseTransformed, '#24d390');
		this.drawLine(node, handle, '#ff00ff');
		this.drawArcBetweenVector(node, startVec, endVec, '#24d390');
	}

	drawThicknessTool(node) {
		const [oppositeExpanded, expandedSource] = node.expandedTo;
		const normalVector = normalize2D({
			x: expandedSource.y - oppositeExpanded.y,
			y: oppositeExpanded.x - expandedSource.x,
		});
		const toolPoints = [
			add2D(expandedSource, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
			add2D(oppositeExpanded, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
			add2D(node, mulScalar2D(50 / this.viewMatrix[0], normalVector)),
		];

		this.drawLine(expandedSource, oppositeExpanded, blue);
		this.drawLine(expandedSource, toolPoints[0], blue, undefined, [4, 4]);
		this.drawLine(oppositeExpanded, toolPoints[1], blue, undefined, [4, 4]);
		this.drawLine(toolPoints[0], toolPoints[1], blue);
		this.drawCircle(toolPoints[0], nodeDrawRadius, blue, undefined);
		this.drawCircle(toolPoints[1], nodeDrawRadius, blue, undefined);
		this.drawCircle(toolPoints[2], nodeDrawRadius, undefined, yellow);
		const text = node.expand.width.toFixed(1);
		const textSize = this.measureText(text, 20, 'Fira sans');

		this.drawText(text,
			add2D(
				add2D(
					mulScalar2D(1 / 2, add2D(expandedSource, oppositeExpanded)),
					mulScalar2D(-30 / this.viewMatrix[0], normalVector)
				),
				{
					x: -textSize.width / (2 * this.viewMatrix[0]),
					y: 0,
				}
			),
			20,
			blue
		);

	}

	drawAngleTool(node) {
		const [farthestNode, closestNode] = node.expand.distr > 0.5
			? [node.expandedTo[0], node.expandedTo[1]]
			: [node.expandedTo[1], node.expandedTo[0]];
		const radius = distance2D(farthestNode, node) * this.viewMatrix[0];

		this.drawRing(node, radius - 2, radius + 2, undefined, ringBackground);
		this.drawLine(closestNode, farthestNode, green, undefined, [5, 5, 15, 5]);
		this.drawCircle(farthestNode, 5, green, green);

		const direction = subtract2D(farthestNode, node);
		const angle = `${(Math.atan2(direction.y, direction.x) * 180 / Math.PI).toFixed(1)}°`;
		const textSize = this.measureText(angle, 20, 'Fira sans');
		const normalVector = normalize2D({
			x: direction.y,
			y: -direction.x,
		});

		this.drawText(angle,
			add2D(
				add2D(
					mulScalar2D(1 / 2, add2D(node, farthestNode)),
					mulScalar2D(-35 / this.viewMatrix[0], normalVector)
				),
				{
					x: -textSize.width / (2 * this.viewMatrix[0]),
					y: 0,
				}
			),
			20,
			red
		);
	}

	drawSkeletonDistrTool(node) {
		const [zoom] = this.viewMatrix;
		const normalVector = normalize2D({
			x: node.expandedTo[1].y - node.expandedTo[0].y,
			y: node.expandedTo[0].x - node.expandedTo[1].x,
		});
		const center = add2D(node, mulScalar2D(20 / zoom, normalVector));

		this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		this.drawLine(node, add2D(node, mulScalar2D(20 / zoom, normalVector)), red);
		this.drawCircle(add2D(node, mulScalar2D(20 / zoom, normalVector)), 8, 'transparent', red);
	}

	drawSkeletonPosTool(node) {
		const [zoom] = this.viewMatrix;
		const topLeft = add2D(mulScalar2D(1 / zoom, {x: -6, y: 6}), node);
		const bottomLeft = add2D(mulScalar2D(1 / zoom, {x: -6, y: -6}), node);
		const topRight = add2D(mulScalar2D(1 / zoom, {x: 6, y: 6}), node);
		const bottomRight = add2D(mulScalar2D(1 / zoom, {x: 6, y: -6}), node);

		const oldWidth = this.context.lineWidth;
		this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		this.context.lineWidth = 2;
		this.drawLine(topLeft, bottomRight, red);
		this.drawLine(bottomLeft, topRight, red);
		this.context.lineWidth = oldWidth;

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
				}
			),
			20,
			red
		);

		this.drawText(yText,
			add2D(
				yCoordsPos,
				{
					x: -yTextSize.width / (2 * zoom),
					y: 0,
				}
			),
			20,
			red
		);
	}

	getHotInteractiveItem() {
		const result = [];

		this.interactionList.forEach((interactionItem) => {
			switch (interactionItem.type) {
				case toileType.NODE_IN:
				case toileType.NODE_OUT:
				case toileType.NODE_SKELETON:
				case toileType.NODE: {
					let refDistance = interactionItem.data.radius;
					const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
					const [mouseTransformed] = transformCoords(
						[this.mouse],
						inverseMatrix,
						this.height / this.viewMatrix[0]
					);
					const distance = distance2D(interactionItem.data.center, mouseTransformed);

					if (distance <= refDistance) {
						refDistance = distance;
						result.push(interactionItem);
					}

					/* #if dev */
					//let color = '#24d390';
					//this.drawLine(interactionItem.data.center, mouseTransformed, color);
					/* #end */
					break;
				}
				case toileType.POINT_MENU: {
					const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
					const [mouseTransformed] = transformCoords(
						[this.mouse],
						inverseMatrix,
						this.height / this.viewMatrix[0]
					);
					const {start, size} = interactionItem.data;
					const diffVect = subtract2D(mouseTransformed, start);

					if (
						diffVect.x <= size.x + 20 / this.viewMatrix[0]
						&& diffVect.x >= -40 / this.viewMatrix[0]
						&& diffVect.y <= size.y + 20 / this.viewMatrix[0]
						&& diffVect.y >= -40 / this.viewMatrix[0]
					) {
						result.push(interactionItem);
					}

					/* #if dev */
					//let color = '#24d390';
					//this.drawLine(start, mouseTransformed, color);
					/* #end */
					break;
				}
				case toileType.POINT_MENU_ITEM: {
					const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
					const [zoom] = this.viewMatrix;
					const [mouseTransformed] = transformCoords(
						[this.mouse],
						inverseMatrix,
						this.height / zoom
					);
					const {pos, size} = interactionItem.data;
					const diffVect = subtract2D(mouseTransformed, pos);

					if (
						diffVect.x <= size + 10 / zoom
						&& diffVect.x >= -10 / zoom
						&& diffVect.y <= 35 / zoom
						&& diffVect.y >= -5 / zoom
					) {
						result.push(interactionItem);
					}

					/* #if dev */
					const color = '#24d390';

					this.drawLine(pos, mouseTransformed, color);
					/* #end */
					break;
				}
				default:
					break;
			}
		});

		return result;
	}
}

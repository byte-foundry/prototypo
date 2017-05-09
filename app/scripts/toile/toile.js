/* global _ */
import {distance2D, subtract2D, add2D, mulScalar2D, normalize2D} from '../plumin/util/linear.js';

function transformCoords(coordsArray, matrix, height) {
	const [a, b, c, d, tx, ty] = matrix;

	return _.map(coordsArray, (coords) => {
		return {
			x: a * coords.x + b * coords.y + tx,
			y: c * coords.x + d * coords.y + (ty - height),
		};
	});
}

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
	HANDLE_MOD: 0,
};

const transparent = 'transparent';
const inHandleColor = '#f5e462';
const hotInHandleColor = '#d5c650';
const outHandleColor = '#00c4d6';
const hotOutHandleColor = '#00a9b6';
const onCurveColor = '#24d390';
const hotOnCurveColor = '#12b372';

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

function inverseProjectionMatrix([a, b, c, d, e, f]) {
	return [
		1 / a,
		b,
		c,
		1 / d,
		-e / a,
		-f / d,
	];
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

			if (this.mouseState === mState.DOWN) {
				this.mouseDelta = {
					x: this.mouseDelta.x + (e.clientX - this.mouse.x),
					y: this.mouseDelta.y + (e.clientY - this.mouse.y),
				};
			}

			this.mouse = {
				x: e.clientX,
				y: e.clientY,
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

	drawNode(node, id, hotItems) {
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
				if (node.x && node.y) {
					this.drawNode(node, `contours[${i}].nodes[${j}]`, hotItems);
				}
				if (node.expandedTo) {
					this.drawNode(node.expandedTo[0], `contours[${i}].nodes[${j}].expandedTo[0]`, hotItems);
					this.drawNode(node.expandedTo[1], `contours[${i}].nodes[${j}].expandedTo[1]`, hotItems);
				}
			});
		});

		glyph.components.forEach((component, k) => {
			component.contours.forEach((contour, i) => {
				contour.nodes.forEach((node, j) => {
					if (node.x && node.y) {
						this.drawNode(node, `component[${k}].contours[${i}].nodes[${j}]`, hotItems);
					}
					if (node.expandedTo) {
						this.drawNode(node.expandedTo[0], `component[${k}].contours[${i}].nodes[${j}].expandedTo[0]`, hotItems);
						this.drawNode(node.expandedTo[1], `component[${k}].contours[${i}].nodes[${j}].expandedTo[1]`, hotItems);
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

	drawLine(aStart, aEnd, strokeColor = "transparent", id) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
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

		this.context.font = `${menuTextSize}px 'Fira sans', sans-serif`;

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

			textWidth = Math.max(textWidth, size) / this.viewMatrix[0];
			nameSizes.push(size);
		});

		const size = mulScalar2D(Math.min(1, frameCounters / pointMenuAnimationLength), {x: textWidth + 20, y: 40 * points.length + 10 * points.length - 10});
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

	drawToolsLib(toolsLib) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [mouseTransformed] = transformCoords(
			[this.mouse],
			inverseMatrix,
			this.height / this.viewMatrix[0]
		);
		const offset = {x: 20, y: -20};
		const start = add2D(mouseTransformed, offset);
		const size = {x: 30 * toolsLib.length, y: -30};
		const end = add2D(start, size);

		this.drawRectangleFromCorners(start, end, undefined, '#24d390');
	}

	drawNodeToolsLib() {
		this.drawToolsLib(Array(2));
	}

	drawNodeSkeletonToolsLib() {
		this.drawToolsLib(Array(2));
	}

	drawNodeHandleToolsLib() {
		this.drawToolsLib(Array(3));
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
						diffVect.x <= size.x + 20
						&& diffVect.x >= -40
						&& diffVect.y <= size.y + 20
						&& diffVect.y >= -40
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
					const [mouseTransformed] = transformCoords(
						[this.mouse],
						inverseMatrix,
						this.height / this.viewMatrix[0]
					);
					const {pos, size} = interactionItem.data;
					const diffVect = subtract2D(mouseTransformed, pos);

					if (
						diffVect.x <= size + 10
						&& diffVect.x >= -10
						&& diffVect.y <= 35
						&& diffVect.y >= -5
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

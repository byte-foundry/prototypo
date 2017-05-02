/* global _ */
import {distance2D} from '../plumin/util/linear.js';

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
	CIRCLE: 0,
};

const transparent = 'transparent';
const inHandleColor = '#f5e462';
const hotInHandleColor = '#d5c650';
const outHandleColor = '#00c4d6';
const hotOutHandleColor = '#00a9b6';
const onCurveColor = '#24d390';
const hotOnCurveColor = '#12b372';

export default class Toile {
	constructor(canvas) {
		this.context = canvas.getContext('2d');
		this.mouse = {x: 0, y: 0};
		this.mouseDelta = {x: 0, y: 0};
		this.height = canvas.height;

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

		this.interactionList = [];
	}

	clearDelta() {
		this.mouseDelta = {
			x: 0,
			y: 0,
		};
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
		};
	}

	drawControlPoint(node, hotness, fillColor, hotFillColor) {
		this.drawCircle(node, hotness ? 8 : 5, transparent, hotness ? hotFillColor : fillColor);
	}

	drawNode(node, id, hotItems) {
		const hot = _.find(hotItems, (item) => {
			return item.id === id;
		});
		this.drawControlPoint(node, hot, onCurveColor, hotOnCurveColor);

		if (node.handleIn) {
			this.drawControlPoint(node.handleIn, false, inHandleColor, hotInHandleColor);
			this.drawLine(node.handleIn, node, inHandleColor, inHandleColor);
			if (id) {
				this.interactionList.push({
					id: `${id}_in`,
					type: toileType.CIRCLE,
					data: {
						center: {
							x: node.handleIn.x,
							y: node.handleIn.y,
						},
						radius: 5,
					},
				});
			}
		}
		if (node.handleOut) {
			this.drawControlPoint(node.handleOut, false, outHandleColor, hotOutHandleColor);
			this.drawLine(node.handleOut, node, outHandleColor, outHandleColor);
			if (id) {
				this.interactionList.push({
					id: `${id}_out`,
					type: toileType.CIRCLE,
					data: {
						center: {
							x: node.handleOut.x,
							y: node.handleOut.y,
						},
						radius: 5,
					},
				});
			}
		}

		if (id) {
			this.interactionList.push({
				id,
				type: toileType.CIRCLE,
				data: {
					center: {
						x: node.x,
						y: node.y,
					},
					radius: 5,
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
					this.drawNode(node, `contour[${i}].nodes[${j}]`, hotItems);
				}
				if (node.expandedTo) {
					this.drawNode(node.expandedTo[0], `contour[${i}].nodes[${j}].expandedTo[0]`, hotItems);
					this.drawNode(node.expandedTo[1], `contour[${i}].nodes[${j}].expandedTo[1]`, hotItems);
				}
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

	drawText(text, point, textSize, textColor, id) {
	}

	getHotInteractiveItem() {
		const result = [];
		let refDistance = 15;

		this.interactionList.forEach((interactionItem) => {
			switch (interactionItem.type) {
				case toileType.CIRCLE:
					const [a, b, c, d, e, f] = this.viewMatrix;
					const [mouseTransformed] = transformCoords(
						[this.mouse],
						[a, b, c, d, -e, f],
						this.height
					);

					const distance = distance2D(interactionItem.data.center, mouseTransformed);
					let color = '#24d390';

					if (distance <= refDistance) {
						refDistance = distance;
						color = '#d88065';
						result.push(interactionItem);
					}

					/* #if dev */
					//this.drawLine(interactionItem.data.center, mouseTransformed, color);
					/* #end */
					break;
				default:
					break;
			}
		});

		return result;
	}
}

import _ from 'lodash';

function transformCoords(coordsArray, matrix) {
	const [a, b, c, d, tx, ty] = matrix;

	return _.map(coordsArray, (coords) => {
		return {
			x: a * coords.x + b * coords.y + tx,
			y: c * coords.x + d * coords.y + ty,
		};
	});
}

export const mState = {
	DOWN: 0,
	UP: 0,
};

export default class Toile {
	constructor(canvas) {
		this.context = canvas.getContext('2d');

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

			this.mouseDelta = {
				x: e.screenX - this.mouse.x,
				y: e.screenY - this.mouse.y,
			};

			this.mouse = {
				x: e.screenX,
				y: e.screenY,
			};
		});

		canvas.addEventListener('mousedown', () => {
			this.mouseState = mState.DOWN;
		});

		canvas.addEventListener('mouseup', () => {
			this.mouseState = mState.UP;
		});
	}

	getMouseState() {
		return {
			pos: this.mouse,
			delta: this.mouseDelta,
			state: this.mouseState,
		};
	}

	drawGlyph(glyph) {
		const beziers = glyph.contours.map((contour) => {
			if (!contour.skeleton) {
				return contour.nodes.map((node, i) => {
					const nextNode = contours[(i + 1) % contour.nodes.length];

					const bezier = [
						{
							x: node.x,
							y: node.y,
						},
						{
							x: node.handleOut.x,
							y: node.handleOut.y,
						},
						{
							x: nextNode.x,
							y: nextNode.y,
						},
						{
							x: nextNode.handleIn.x,
							y: nextNode.handleIn.y,
						},
					];
				});
			}
			else if (!contour.closed) {
			}
			else {
			}
		});
	}

	setCamera(point, zoom, height) {
		this.viewMatrix = [zoom, 0, 0, -1 * zoom, -point.x, -point.y + height];
	}

	//A drawn contour must be closed
	drawContour(listOfBezier, strokeColor = "transparent", fillColor = "transparent", interactionType) {

		this.context.fillStyle = fillColor;
		this.context.strokeStyle = strokeColor;
			this.context.beginPath();

		_.each(listOfBezier, (bezier) => {
			drawBezierCurve(bezier, undefined, interactionType, true);
		});

		this.context.stroke();
		this.context.fill();
	}

	drawBezierCurve(aBezier, strokeColor, interactionType, noPathCreation) {
		const bezier = transformCoords(
			aBezier,
			this.viewMatrix
		);

		if (!noPathCreation) {
			this.context.fillStyle = "transparent";
			this.context.strokeStyle = strokeColor;
			this.context.beginPath();
		}

		this.context.moveTo(bezier[0].x, bezier[0].y);
		this.bezierCurveTo(bezier[1].x, bezier[1].y, bezier[2].x, bezier[2].y, bezier[1].x, bezier[1].y);

		if (!noPathCreation) {
			this.context.stroke();
		}
	}

	drawLine(aStart, aEnd, strokeColor = "transparent", interactionType) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
	}

	drawRectangleFromCenterSize(origin, size, strokeColor, fillColor, interactionType) {
	}

	drawCircle(center, radius, strokeColor, fillColor, interactionType) {
	}

	drawText(text, point, textSize, textColor, interactionType) {
	}

	getHotInteractiveItem() {
	}
}

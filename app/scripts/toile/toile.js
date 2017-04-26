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
	}

	clearDelta() {
		this.mouseDelta = {
			x: 0,
			y: 0,
		};
	}

	clearCanvas(width, height) {
		this.context.clearRect(0, 0, width, height);
	}

	getMouseState() {
		return {
			pos: this.mouse,
			delta: this.mouseDelta,
			state: this.mouseState,
		};
	}

	drawNode(node, inStrokeColor = 'black', outStrokeColor = 'black', fillColor = 'transparent') {
		this.drawCircle(node, 5, inStrokeColor, fillColor);

		if (node.handleIn) {
			this.drawCircle(node.handleIn, 5, inStrokeColor, inStrokeColor);
			this.drawLine(node.handleIn, node, inStrokeColor, inStrokeColor);
		}
		if (node.handleOut) {
			this.drawCircle(node.handleOut, 5, outStrokeColor, outStrokeColor);
			this.drawLine(node.handleOut, node, outStrokeColor, outStrokeColor);
		}
	}

	drawGlyph(glyph) {
		this.context.globalCompositeOperation = 'destination-over';
		this.context.fillStyle = 'black';
		this.context.strokeStyle = 'black';
		this.context.beginPath();
		glyph.otContours.forEach((bez) => {
			this.drawContour(bez, undefined, undefined, undefined, true);
		});
		this.context.stroke();
		this.context.fill();
		this.context.globalCompositeOperation = 'source-over';
	}

	setCamera(point, zoom, height) {
		this.height = height;
		this.viewMatrix = [zoom, 0, 0, -1 * zoom, point.x, point.y];
	}

	//A drawn contour must be closed
	drawContour(listOfBezier, strokeColor = "transparent", fillColor = "transparent", interactionType, noPathCreation) {

		if (!noPathCreation) {
			this.context.fillStyle = fillColor;
			this.context.strokeStyle = strokeColor;
			this.context.beginPath();
		}

		_.each(listOfBezier, (bezier, i) => {
			this.drawBezierCurve(bezier, undefined, interactionType, true, !i);
		});

		if (!noPathCreation) {
			this.context.stroke();
			this.context.fill();
		}
	}

	drawBezierCurve(aBezier, strokeColor, interactionType, noPathCreation, move) {
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

	drawLine(aStart, aEnd, strokeColor = "transparent", interactionType) {
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

	drawRectangleFromCenterSize(origin, size, strokeColor, fillColor, interactionType) {
	}

	drawCircle(aCenter, radius, strokeColor = 'black', fillColor = 'transparent', interactionType) {
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

	drawText(text, point, textSize, textColor, interactionType) {
	}

	getHotInteractiveItem() {
	}
}

import {add2D, mulScalar2D, subtract2D} from '../../plumin/util/linear.js';

// The following function should be useless, thanks to paper
export function lineLineIntersection(p1, p2, p3, p4) {
	const x1 = p1.x;
	const y1 = p1.y;
	const x2 = p2.x;
	const y2 = p2.y;
	const x3 = p3.x;
	const y3 = p3.y;
	const x4 = p4.x;
	const y4 = p4.y;
	const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

	if (d === 0) {
		return null;
	}

	return new Float32Array([
		((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4))
		/ d,
		((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4))
		/ d,
	]);
}

// Find the intersection of two rays.
// A ray is defined by a point and an angle.
export function rayRayIntersection(p1, a1, p2, a2) {
	// line equations
	const a = Math.tan(a1);
	const b = Math.tan(a2);
	const c = p1.y - a * p1.x;
	const d = p2.y - b * p2.x;
	let x;
	let y;

	// When searching for lines intersection,
	// angles can be normalized to 0 < a < PI
	// This will be helpful in detecting special cases below.
	/* eslint-disable no-param-reassign */
	a1 = a1 % Math.PI;
	if (a1 < 0) {
		a1 += Math.PI;
	}
	a2 = a2 % Math.PI;
	if (a2 < 0) {
		a2 += Math.PI;
	}

	// no intersection
	if (a1 === a2) {
		return null;
	}

	//We want to round a1, a2 and PI to avoid problems with approximation
	a1 = a1.toFixed(6);
	a2 = a2.toFixed(6);
	/* eslint-enable no-param-reassign */
	const piOver2 = (Math.PI / 2).toFixed(6);

	// Optimize frequent and easy special cases.
	// Without optimization, results would be incorrect when cos(a) === 0
	if (a1 === 0) {
		y = p1.y;
	}
	else if (a1 === piOver2) {
		x = p1.x;
	}
	if (a2 === 0) {
		y = p2.y;
	}
	else if (a2 === piOver2) {
		x = p2.x;
	}

	// easiest case
	if (x !== undefined && y !== undefined) {
		return {x, y};
	}

	// other cases that can be optimized
	if (a1 === 0) {
		return {x: (y - d) / b, y};
	}
	if (a1 === piOver2) {
		return {x, y: b * x + d};
	}
	if (a2 === 0) {
		return {x: (y - c) / a, y};
	}
	if (a2 === piOver2) {
		return {x, y: a * x + c};
	}

	// intersection from two line equations
	// algo: http://en.wikipedia.org/wiki/Line–line_intersection#Given_the_equations_of_the_lines
	const newX = (d - c) / (a - b);

	return {
		x: newX,
		// this should work equally well with ax+c or bx+d
		y: a * newX + c,
	};
}

// return the angle between two points
export function lineAngle(p0, p1) {
	return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

export function onLine(params) {
	if (params.on[0].x === params.on[1].x
		&& params.on[0].y === params.on[1].y) {
		return 'x' in params
			? params.on[0].y
			: params.on[0].x;
	}

	const origin = params.on[0];
	const vector = [
			params.on[1].x - params.on[0].x,
			params.on[1].y - params.on[0].y,
		];

	return 'x' in params
		? (params.x - origin.x) / vector[0] * vector[1] + origin.y
		: (params.y - origin.y) / vector[1] * vector[0] + origin.x;
}

export function pointOnCurve(pointHandleOut,
	handleOut,
	pointHandleIn,
	handleIn,
	distanceFromOut,
	inverseOrientation,
	linePrecision = 3
) {
	let length = 0;
	let previousPoint;
	let points;

	if (inverseOrientation) {
		points = [
			pointHandleIn,
			handleIn,
			handleOut,
			pointHandleOut,
		];
	}
	else {
		points = [
			pointHandleOut,
			handleOut,
			handleIn,
			pointHandleIn,
		];
	}

	for (let i = 0; i < linePrecision; i++) {
		const point = getPointOnCurve(points,
			(i / (linePrecision - 1)));

		if (previousPoint) {
			length += distance(previousPoint.x,
				previousPoint.y,
				point.x,
				point.y);

		}

		previousPoint = point;
	}

	let t = length === 0 ? 0 : distanceFromOut / length;

	t = Math.max(0.001, Math.min(1, t));

    return getPointOnCurve(points, t);
}

export function getPointOnCurve(points, t) {
	const inverseT = 1 - t;
	const a = inverseT * inverseT * inverseT;
	const b = inverseT * inverseT * t * 3;
	const c = inverseT * t * t * 3;
	const d = t * t * t;

	return {
		x: a * points[0].x + b * points[1].x + c * points[2].x + d * points[3].x,
		y: a * points[0].y + b * points[1].y + c * points[2].y + d * points[3].y,
		normal: lineAngle(
			{
				x: 0,
				y: 0,
			},
			{
				x: (points[1].x - points[0].x) * inverseT * inverseT + 2 * (points[2].x - points[1].x) * t * inverseT + (points[3].x - points[2].x) * t * t,
				y: (points[1].y - points[0].y) * inverseT * inverseT + 2 * (points[2].y - points[1].y) * t * inverseT + (points[3].y - points[2].y) * t * t,
			}
		),
	};
}

export function split(points, t = 1, base) {
	let result = points;
	let current = points;

	while (current.length > 1) {
		const newPoints = [];

		for (let i = 1; i < current.length; i++) {
			newPoints.push(
				add2D(
					mulScalar2D(1 - t, current[i - 1]),
					mulScalar2D(t, current[i])
				)
			);
		}

		result = result.concat(newPoints);
		current = newPoints;
	}

	if (t === 1) {
		return {
			left: [
				base[1],
				base[0],
			],
			right: [
				base[1],
				base[1],
			],
		};
	}

	const splitBezier = {
		left: [
			{
				x: result[0].x,
				y: result[0].y,
				handleOut: {
					x: result[4].x - result[0].x,
					y: result[4].y - result[0].y,
				},
			},
			{
				x: result[9].x,
				y: result[9].y,
				handleIn: {
					x: result[7].x - result[9].x,
					y: result[7].y - result[9].y,
				},
				handleOut: {
					x: result[8].x - result[9].x,
					y: result[8].y - result[9].y,
				},
			},
		],
		right: [
			{
				x: result[9].x,
				y: result[9].y,
				handleIn: {
					x: result[7].x - result[9].x,
					y: result[7].y - result[9].y,
				},
				handleOut: {
					x: result[8].x - result[9].x,
					y: result[8].y - result[9].y,
				},
			},
			{
				x: result[3].x,
				y: result[3].y,
				handleIn: {
					x: result[6].x - result[3].x,
					y: result[6].y - result[3].y,
				},
			},
		],
	};

	return splitBezier;
}

export function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
}

export function align(points, lineStart, lineEnd) {
	const tx = lineStart.x;
	const ty = lineStart.y;
	const a = -Math.atan2(lineEnd.y - ty, lineEnd.x - tx);
	const d = function(v) {
		return {
			x: (v.x - tx) * Math.cos(a) - (v.y - ty) * Math.sin(a),
			y: (v.x - tx) * Math.sin(a) + (v.y - ty) * Math.cos(a),
		};
	};

	return points.map(d);
}

function crt(v) {
	return v < 0
		? -Math.pow(-v, 1 / 3)
		: Math.pow(v, 1 / 3);
}

// see https://github.com/Pomax/bezierjs/blob/gh-pages/lib/utils.js line 313
export function lineCurveIntersection(pointHandleOut, handleOut, pointHandleIn, handleIn, lineStart = {x: 0, y: 0}, lineEnd = {x: 1, y: 0}) {
	const points = [
		pointHandleOut,
		handleOut,
		handleIn,
		pointHandleIn,
	];
	const p = align(points, lineStart, lineEnd);
	const reduce = function(t) { return 0 <= t && t <= 1; };

	// see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
	const pa = p[0].y;
	const pb = p[1].y;
	const pc = p[2].y;
	const pd = p[3].y;
	const d = (-pa + 3 * pb - 3 * pc + pd);
	const a = (3 * pa - 6 * pb + 3 * pc) / d;
	const b = (-3 * pa + 3 * pb) / d;
	const c = pa / d;
	const p3 = ((3 * b - a * a) / 3) / 3;
	const q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
	const q2 = q / 2;
	const discriminant = q2 * q2 + p3 * p3 * p3;
	let u1;
	let v1;
	let x1;
	let x2;
	let x3;

	let result;

	if (discriminant < 0) {
		const mp3 = -p3;
		const mp33 = mp3 * mp3 * mp3;
		const r = Math.sqrt(mp33);
		const t = -q / (2 * r);
		const cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
		const phi = Math.acos(cosphi);
		const crtr = crt(r);
		const t1 = 2 * crtr;

		x1 = t1 * Math.cos(phi / 3) - a / 3;
		x2 = t1 * Math.cos((phi + Math.PI * 2) / 3) - a / 3;
		x3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - a / 3;
		result = [x1, x2, x3].filter(reduce);
	}
	 else if (discriminant === 0) {
		u1 = q2 < 0 ? crt(-q2) : -crt(q2);
		x1 = 2 * u1 - a / 3;
		x2 = -u1 - a / 3;
		result = [x1, x2].filter(reduce);
	}
	 else {
		const sd = Math.sqrt(discriminant);

		u1 = crt(-q2 + sd);
		v1 = crt(q2 + sd);
		result = [u1 - v1 - a / 3].filter(reduce);
	}

	return split(points, result[0], [pointHandleIn, pointHandleOut]);
}

export function log() {
	/*eslint-disable no-console */
	console.log(...arguments);
	/*eslint-enable no-console */
	return arguments[0];
}

export function normalize(vector) {
	const x = vector.x;
	const y = vector.y;

	const norm = distance(0, 0, x, y);

	if (norm === 0) {
		return {
			x: 0,
			y: 0,
		};
	}

	return {
		x: x / norm,
		y: y / norm,
	};
}

export function vectorFromPoints(a, b) {
	return {
		x: b.x - a.x,
		y: b.y - a.y,
	};
}

export function parseInt(int) {
	return parseInt(int);
}

export function makeCurveInsideSerif(
	pAnchors,
	serifHeight,
	serifWidth,
	serifMedian,
	serifCurve,
	serifTerminal,
	thickness,
	midWidth,
	serifRotate
) {
	const yDir = pAnchors.down ? -1 : 1;
	const xDir = pAnchors.left ? -1 : 1;

	const rotateRad = (serifRotate * pAnchors.rotationAngle || 0) * Math.PI / 180;
	const baseWidth = pAnchors.baseWidth;
	const baseHeight = pAnchors.baseHeight;
	const stumpOpposite = pAnchors.opposite;
	const stumpBase = baseHeight;
	let stumpVector = {
		x: stumpOpposite.x - stumpBase.x,
		y: stumpOpposite.y - stumpBase.y,
	};

	if (baseHeight.x === stumpOpposite.x && baseHeight.y === stumpOpposite.y) {
		stumpVector = {
			x: -stumpOpposite.x + baseWidth.x,
			y: -stumpOpposite.y + baseWidth.y,
		};
	}
	const stumpNorm = distance(0, 0, stumpVector.x, stumpVector.y);

	stumpVector = normalize(stumpVector);
	const rotationCenter = pAnchors.rotationCenter;
	const topLeft = {
		x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.cos(rotateRad) - (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.sin(rotateRad),
	};
	const bottomLeft = {
		x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.cos(rotateRad) - (baseHeight.y - rotationCenter.y) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseHeight.y - rotationCenter.y) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.sin(rotateRad),
	};

	//We get the intersection with the left edge of the serif and the curve support
	//this operation is direction dependent
	let splitBase;

	if (pAnchors.inverseOrder) {
		splitBase = lineCurveIntersection(
			pAnchors.curveEnd,
			pAnchors.baseWidth,
			{x: topLeft.x, y: topLeft.y},
			{x: bottomLeft.x, y: bottomLeft.y}
		);
	}
	else {
		splitBase = lineCurveIntersection(
			pAnchors.baseWidth,
			pAnchors.curveEnd,
			{x: topLeft.x, y: topLeft.y},
			{x: bottomLeft.x, y: bottomLeft.y}
		);
	}


	// We chose a serifCenter depending on if the left edge intersect or not with
	// the curve support
	let serifCenter;
	let splitCurveEnd;

	if (!pAnchors.inverseOrder) {
		if (splitBase.right[0].x !== splitBase.right[1].x || splitBase.right[0].y !== splitBase.right[1].y) {
			serifCenter = splitBase.right[0];
			splitCurveEnd = splitBase.right[1];
		}
		else {
			serifCenter = splitBase.left[0];
			splitCurveEnd = splitBase.left[1];
		}
	}
	else if (splitBase.left[0].x !== splitBase.left[1].x || splitBase.left[0].y !== splitBase.left[1].y) {
			serifCenter = splitBase.left[1];
			splitCurveEnd = splitBase.left[0];
		}
		else {
			serifCenter = splitBase.right[1];
			splitCurveEnd = splitBase.right[0];
		}

	// The serif direction is the line from the serif center
	// to the serif left edge
	const serifDirection = vectorFromPoints(
		serifCenter,
		{
			x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * serifMedian * Math.cos(rotateRad) - (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.sin(rotateRad),
			y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * serifMedian * Math.sin(rotateRad),
		}
	);

	const serifBasis = normalize(serifDirection);
	const serifRadDirection = Math.atan2(serifBasis.y, serifBasis.x);

	let pointOnCurveVar;
	let pointOnSerif;
	let pointWithCurve = {};
	let tangentToCurve;

	if (pAnchors.inverseOrder) {
		pointWithCurve = pointOnCurve(splitCurveEnd, serifCenter, serifCurve, true, 200);
	}
	else {
		pointWithCurve = pointOnCurve(serifCenter, splitCurveEnd, serifCurve, false, 200);
	}

	if (serifCurve > 0) {
		normalToCurve = pointWithCurve.normal;
		pointOnCurveVar = {
			x: pointWithCurve.x,
			y: pointWithCurve.y,
			dirOut: pointWithCurve.normal,
			type: 'corner',
		};
		const curveRatio = Math.min(serifCurve / distance(0, 0, serifDirection.x, serifDirection.y), 0.75);

		pointOnSerif = {
			x: serifCenter.x + serifDirection.x * curveRatio,
			y: serifCenter.y + serifDirection.y * curveRatio,
			dirIn: serifRadDirection,
			dirOut: serifRadDirection,
			type: 'corner',
		};
	}
	else {
		if (pAnchors.inverseOrder) {
			const relHandle = subtract2D(serifCenter, serifCenter.handleIn);

			tangentToCurve = Math.atan2(relHandle.y, relHandle.x);
		}
		else {
			const relHandle = subtract2D(serifCenter, serifCenter.handleOut);

			tangentToCurve = Math.atan2(relHandle.y, relHandle.x);
		}
		pointOnCurveVar = {
			x: serifCenter.x,
			y: serifCenter.y,
			type: 'corner',
		};
		pointOnSerif = {
			x: serifCenter.x,
			y: serifCenter.y,
			type: 'corner',
		};
	}
	const leftEdge = {
		x: serifCenter.x + serifDirection.x,
		y: serifCenter.y + serifDirection.y,
		dirIn: serifRadDirection,
		dirOut: rotateRad,
	};
	const rightEdge = {
		x: rotationCenter.x - (baseWidth.y - rotationCenter.y + serifWidth * midWidth * yDir) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * midWidth * yDir) * Math.cos(rotateRad),
		dirIn: rotateRad,
		typeOut: 'line',
	};
	const serifRoot = {
		x: baseHeight.x,
		y: baseHeight.y,
	};

	const rootVector = normalize(vectorFromPoints(serifRoot, rightEdge));
	const medianVector = normalize(vectorFromPoints(pointOnSerif, leftEdge));

	const terminalVector = normalize({
		x: rootVector.x + medianVector.x,
		y: rootVector.y + medianVector.y,
	});

	const midPoint = {
		x: (leftEdge.x + rightEdge.x) / 2 + serifTerminal * serifHeight * terminalVector.x * xDir,
		y: (leftEdge.y + rightEdge.y) / 2 + serifTerminal * serifHeight * terminalVector.y * xDir,
		dirIn: rotateRad,
		dirOut: rotateRad,
	};

	if (serifTerminal !== 0) {
		leftEdge.dirOut = Math.atan2(medianVector.y, medianVector.x);
		rightEdge.dirIn = Math.atan2(rootVector.y, rootVector.x);
	}
	else if (midWidth !== 1) {
		const dirOut = Math.atan2(leftEdge.y - rightEdge.y, leftEdge.x - rightEdge.x);

		leftEdge.dirOut = dirOut;
		rightEdge.dirIn = dirOut;
		midPoint.dirIn = dirOut;
		midPoint.dirOut = dirOut;
	}

	const midStump = {
		x: serifRoot.x + stumpNorm / 2 * stumpVector.x,
		y: serifRoot.y + stumpNorm / 2 * stumpVector.y,
		dirOut: baseWidth.dirIn,
		typeIn: 'line',
		type: 'corner',
	};

	const lastPoint = {
		x: pointOnCurveVar.x - stumpNorm / 2 * Math.sin(tangentToCurve) * yDir * xDir,
		y: pointOnCurveVar.y + stumpNorm / 2 * Math.cos(tangentToCurve) * yDir * xDir,
		dirIn: tangentToCurve,
		typeOut: 'line',
		type: 'corner',
	};

	if (serifCurve + serifHeight < 70) {
		midStump.tensionOut = 0;
		lastPoint.tensionIn = 0;
	}
	else {
		midStump.tensionOut = 1;
		lastPoint.tensionIn = 1;
	}

	return [
		pointOnCurveVar,
		pointOnSerif,
		leftEdge,
		midPoint,
		rightEdge,
		rotationCenter,
		serifRoot,
		midStump,
		lastPoint,
	];
}

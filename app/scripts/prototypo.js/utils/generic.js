import {transform2D, matrixMul} from './linear';
import {SimplePath, ClosedSkeletonPath, SkeletonPath} from '../precursor/Path';
import Formula from '../precursor/Formula';
import Constant from '../precursor/Constant';
import memoize from 'memoize-immutable';

export function constantOrFormula(source, cursor) {
	if (typeof source === 'object' && source !== null && source._operation) {
		// eslint-disable-line no-underscore-dangle, max-len
		return new Formula(source, cursor);
	}
	return new Constant(source, cursor);
}

export function createContour(source, i) {
	if (source.skeleton && source.closed) {
		return new ClosedSkeletonPath(source, i);
	}
	else if (source.skeleton) {
		return new SkeletonPath(source, i);
	}

	return new SimplePath(source, i);
}

function fastSplit(string) {
	return string.split('.');
}

export const memoizeSplit = memoize(fastSplit, {cache: new Map()});

export const transformByName = {
	skewX(node, deg, center = {x: 0, y: 0}) {
		const theta = deg;
		const skew = [1, Math.tan(theta), 0, 1, 0, 0];
		const matrix = changeTransformOrigin(center, skew);

		return transform2D(matrix, node);
	},
	skewY(node, deg, center = {x: 0, y: 0}) {
		const theta = deg;
		const skew = [1, 0, Math.tan(theta), 1, 0, 0];
		const matrix = changeTransformOrigin(center, skew);

		return transform2D(matrix, node);
	},
	rotate(node, deg, center = {x: 0, y: 0}) {
		const theta = deg;
		const rotate = [
			Math.cos(theta),
			-Math.sin(theta),
			Math.sin(theta),
			Math.cos(theta),
			0,
			0,
		];
		const matrix = changeTransformOrigin(center, rotate);

		return transform2D(matrix, node);
	},
	translateX(node, offset) {
		const translate = [1, 0, 0, 1, offset, 0];

		return transform2D(translate, node);
	},
	translateY(node, offset) {
		const translate = [1, 0, 0, 1, 0, offset];

		return transform2D(translate, node);
	},
	scaleX(node, scale, center = {x: 0, y: 0}) {
		const scaleMatrix = [scale, 0, 0, 1, 0, 0];
		const matrix = changeTransformOrigin(center, scaleMatrix);

		return transform2D(matrix, node);
	},
	scaleY(node, scale, center = {x: 0, y: 0}) {
		const scaleMatrix = [1, 0, 0, scale, 0, 0];
		const matrix = changeTransformOrigin(center, scaleMatrix);

		return transform2D(matrix, node);
	},
};

export function changeTransformOrigin(origin, transform, z = 1) {
	const preTransform = [z, 0, 0, z, -origin.x, -origin.y];
	const postTransform = [z, 0, 0, z, origin.x, origin.y];

	return matrixMul(matrixMul(preTransform, transform), postTransform);
}

/* eslint-disable */
export function transformNode(node, transforms, origin) {
	for (var i = 0; i < transforms.length; i++) {
		var [name, param] = transforms[i];

		exeTransformOnNode(name, node, param, origin);
		node.addedTransform.push({name, param});
		if (node.handleIn) {
			exeTransformOnNode(name, node.handleIn, param, origin);
		}

		if (node.handleOut) {
			exeTransformOnNode(name, node.handleOut, param, origin);
		}
	}
}

export function transformGlyph(opDone, transformTuples) {
	for (var i = 0; i < opDone.contours.length; i++) {
		var contour = opDone.contours[i];

		for (var j = 0; j < contour.nodes.length; j++) {
			var node = contour.nodes[j];

			node.addedTransform = []; // eslint-disable-line no-param-reassign
			if (node.expandedTo) {
				node.expandedTo[0].addedTransform = []; // eslint-disable-line no-param-reassign
				node.expandedTo[1].addedTransform = []; // eslint-disable-line no-param-reassign
			}

			var transforms = [
				...transformTuples,
				[contour.transforms || [], contour.transformOrigin],
			];

			for (var k = 0; k < transforms.length; k++) {
				var [transform, origin] = transforms[k];
				if (node.expandedTo) {
					transformNode(node.expandedTo[0], transform, origin);
					transformNode(node.expandedTo[1], transform, origin);
					transformNode(node, transform, origin);
				} else {
					transformNode(node, transform, origin);
				}
			}
		}
	}
}
/* eslint-enable */

function exeTransformOnNode(name, node, param, origin) {
	const {x, y} = transformByName[name](node, param, origin);
	const {x: xBase, y: yBase} = transformByName[name](
		{x: node.xBase, y: node.yBase},
		param,
		origin,
	);

	node.x = Math.round(x); // eslint-disable-line no-param-reassign
	node.y = Math.round(y); // eslint-disable-line no-param-reassign
	node.xBase = Math.round(xBase); // eslint-disable-line no-param-reassign
	node.yBase = Math.round(yBase); // eslint-disable-line no-param-reassign
}

export function glyphBoundingBox(glyph) {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;

	glyph.otContours.forEach((contour) => {
		contour.forEach((bezier) => {
			bezier.forEach((node) => {
				minX = Math.min(node.x, minX);
				maxX = Math.max(node.x, maxX);
				minY = Math.min(node.y, minY);
				maxY = Math.max(node.y, maxY);
			});
		});
	});

	return [
		{
			x: minX,
			y: minY,
		},
		{
			x: maxX,
			y: maxY,
		},
	];
}

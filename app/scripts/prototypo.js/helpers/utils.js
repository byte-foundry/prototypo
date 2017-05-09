import {transform2D, matrixMul} from '../../plumin/util/linear.js';

export function toLodashPath(path) {
	return path.replace(/\.([0-9]+)\./g, '[$1].');
}

const rdeg = /deg$/;

export function readAngle(angle) {
	if (angle === undefined || angle === null) {
		return angle;
	}

	if (typeof angle === 'string' && rdeg.test(angle)) {
		return parseFloat(angle) * (Math.PI * 2 / 360);
	}

	return parseFloat(angle);
}

export const transformByName = {
	skewX(node, deg, center = {x: 0, y: 0}) {
		const theta = readAngle(deg);
		const skew = [1, Math.tan(theta), 0, 1, 0, 0];
		const matrix = changeTransformOrigin(center, skew);

		return transform2D(matrix, node);
	},
	skewY(node, deg, center = {x: 0, y: 0}) {
		const theta = readAngle(deg);
		const skew = [1, 0, Math.tan(theta), 1, 0, 0];
		const matrix = changeTransformOrigin(center, skew);

		return transform2D(matrix, node);
	},
	rotate(node, deg, center = {x: 0, y: 0}) {
		const theta = readAngle(deg);
		const phi = Math.PI * theta / 180;
		const rotate = [Math.cos(phi), -Math.sin(phi), Math.sin(phi), Math.cos(phi), 0, 0];
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

export function changeTransformOrigin(origin, transform) {
	const preTransform = [1, 0, 0, 1, -origin.x, -origin.y];
	const postTransform = [1, 0, 0, 1, origin.x, origin.y];

	return matrixMul(
		matrixMul(
			preTransform,
			transform
		),
		postTransform
	);
}

export function transformNode(node, transforms, origin) {
	transforms.forEach(([name, param]) => {
		exeTransformOnNode(name, node, param, origin);
		if (node.handleIn) {
			exeTransformOnNode(name, node.handleIn, param, origin);
		}

		if (node.handleOut) {
			exeTransformOnNode(name, node.handleOut, param, origin);
		}
	});
}

function exeTransformOnNode(name, node, param, origin) {
	const {x, y} = transformByName[name](node, param, origin)

	node.x = x;
	node.y = y;
}

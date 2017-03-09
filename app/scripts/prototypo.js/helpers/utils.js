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

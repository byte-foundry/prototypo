import {SimplePath, ClosedSkeletonPath, SkeletonPath} from '../precursor/Path.js';
import Formula from '../precursor/Formula.js';
import Constant from '../precursor/Constant.js';

export function constantOrFormula(source, cursor) {
	if (typeof source === 'object' && source !== null && source._operation) {
		return new Formula(source, cursor);
	}
	else if (source !== undefined) {
		return new Constant(source, cursor);
	}
}

export function createContour(source, i) {
	if (source.skeleton && source.closed) {
		return new ClosedSkeletonPath(source, i);
	}
	else if (source.skeleton) {
		return new SkeletonPath(source, i);
	}
	else {
		return new SimplePath(source, i);
	}
}

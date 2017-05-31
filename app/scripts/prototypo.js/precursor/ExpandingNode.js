import {round2D} from '../../plumin/util/linear.js';

import {constantOrFormula} from '../helpers/values.js';
import {readAngle} from '../helpers/utils.js';

import Node from './Node.js';

export default class ExpandingNode extends Node {
	constructor(source, i, j) {
		super(source, i, j);
		if (source.expand) {
			this.expanding = true;
			this.expand = _.mapValues(source.expand, (item, key) => {
				let value = item;
				if (key === 'angle') {
					value = value || 0;
				}
				else if (key === 'distr') {
					value = value || 0.5;
				}
				return constantOrFormula(item, `${this.cursor}expand.${key}`);
			});
		}
		else if (source.expandedTo) {
			this.expanding = false;
			this.expandedTo = _.map(source.expandedTo, (point, k) => {
				return new Node(point, undefined, undefined, `${this.cursor}expandedTo.${k}.`);
			});
		}
	}

	readyToExpand(ops, index = ops.length - 1) {
		const cursorToLook = [
			`${this.cursor}expand.width`,
			`${this.cursor}expand.distr`,
			`${this.cursor}expand.angle`,
			`${this.cursor}x`,
			`${this.cursor}y`,
		];

		const done = _.take(ops, index + 1);

		//if all the op are done we should have a length 5 short because
		//we removed the 5 necessary cursor
		return _.difference(done, cursorToLook).length === done.length - cursorToLook.length;
	}

	static applyExpandChange(computedNode, changes, cursor) {
		computedNode.expand.baseWidth = computedNode.expand.width;
		computedNode.expand.baseAngle = readAngle(computedNode.expand.angle);
		computedNode.expand.width = computedNode.expand.width * (changes[`${cursor}.expand.width`] || 1);
		computedNode.expand.angle = computedNode.expand.baseAngle + (changes[`${cursor}.expand.angle`] || 0);
		return computedNode;
	}

	static expand(computedNode) {
		//TODO remove readAngle once we convert all the angle to rad in the ptf
		const {x, y, expand: {width, angle, distr}} = computedNode;

		return [
			round2D({
				x: x - Math.cos(readAngle(angle)) * width * distr,
				y: y - Math.sin(readAngle(angle)) * width * distr,
			}),
			round2D({
				x: x + Math.cos(readAngle(angle)) * width * (1 - distr),
				y: y + Math.sin(readAngle(angle)) * width * (1 - distr),
			}),
		];
	}
}

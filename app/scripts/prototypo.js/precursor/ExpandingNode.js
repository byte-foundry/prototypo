import _mapValues from 'lodash/mapValues';
import _take from 'lodash/take';
import _difference from 'lodash/difference';

import {round2D} from '../utils/linear';

import {constantOrFormula} from '../utils/generic';

import Node from './Node';

const EXPAND_WIDTH = '.expand.width';
const EXPAND_ANGLE = '.expand.angle';
const EXPAND_DISTR = '.expand.distr';

export default class ExpandingNode extends Node {
	constructor(source, i, j) {
		super(source, i, j);
		if (source.expand) {
			this.expanding = true;
			this.expand = _mapValues(source.expand, (item, key) =>
				constantOrFormula(item, `${this.cursor}expand.${key}`),
			);
		}
		else if (source.expandedTo) {
			this.expanding = false;
			this.expandedTo = source.expandedTo.map(
				(point, k) =>
					new Node(
						point,
						undefined,
						undefined,
						`${this.cursor}expandedTo.${k}.`,
					),
			);
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

		const done = _take(ops, index + 1);

		// if all the op are done we should have a length 5 short because
		// we removed the 5 necessary cursor
		return (
			_difference(done, cursorToLook).length
			=== done.length - cursorToLook.length
		);
	}

	static applyExpandChange(computedNode, changes, cursor) {
		/* eslint-disable no-param-reassign */
		computedNode.expand.baseWidth = computedNode.expand.width;
		computedNode.expand.baseDistr = computedNode.expand.distr;
		computedNode.expand.baseAngle = computedNode.expand.angle;
		computedNode.expand.width
			= computedNode.expand.baseWidth * (changes[cursor + EXPAND_WIDTH] || 1);
		computedNode.expand.angle
			= computedNode.expand.baseAngle + (changes[cursor + EXPAND_ANGLE] || 0);
		computedNode.expand.distr
			= computedNode.expand.baseDistr + (changes[cursor + EXPAND_DISTR] || 0);
		return computedNode;
		/* eslint-disable no-param-reassign */
	}

	static expand(computedNode) {
		const {
			x,
			y,
			expand: {width, angle, distr, baseWidth, baseAngle, baseDistr},
		} = computedNode;

		return [
			{
				x: Math.round(x - Math.cos(angle) * width * distr),
				y: Math.round(y - Math.sin(angle) * width * distr),
				xBase: Math.round(x - Math.cos(angle) * width * distr),
				yBase: Math.round(y - Math.sin(angle) * width * distr),
			},
			{
				x: Math.round(x + Math.cos(angle) * width * (1 - distr)),
				y: Math.round(y + Math.sin(angle) * width * (1 - distr)),
				xBase: Math.round(x + Math.cos(angle) * width * (1 - distr)),
				yBase: Math.round(y + Math.sin(angle) * width * (1 - distr)),
			},
		];
	}
}

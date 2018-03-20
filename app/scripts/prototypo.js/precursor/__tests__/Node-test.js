/* globals describe, it, expect */
import Node from '../Node';
import Constant from '../Constant';

const baseSource = {
	dirIn: Math.PI,
	dirOut: Math.PI,
	typeIn: 'line',
	typeOut: 'line',
	type: 'smooth',
	x: 0,
	y: 0,
};

describe('Node', () => {
	it('should construct a basic Node', () => {
		const node = new Node(baseSource, 0, 0);

		expect(node.cursor).toBe('contour.0.nodes.0');
		expect(node.nodeAddress instanceof Constant).toBe(true);
	});
});

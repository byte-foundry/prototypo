'use strict';

describe('Contour structure', function () {

	// load the controller's module
	beforeEach(module('prototypo.Contour'));

	it('should create a nodelist from nodedata', inject(function(Contour, Point) {
		var ct = new Contour(
			{c: new Point(0, 0)},
			{c: new Point(0, 100)},
			{c: new Point(100, 100)},
			{c: new Point(100, 0)}
		);

		expect(ct.nodes.length).toBe(4);
		expect(ct.cycle).toBe(true);
	}));

	it('should create a nodelist from nodedata, from an array of nodes', inject(function(Contour, Point) {
		var ct = new Contour([
			{c: new Point(0, 0)},
			{c: new Point(0, 100)},
			{c: new Point(100, 100)},
			{c: new Point(100, 0)}
		]);

		expect(ct.nodes.length).toBe(4);
		expect(ct.cycle).toBe(true);
	}));

	it('should be able to update the position of its control points', inject(function(Contour, Point) {
		var ct = new Contour([
			{c: new Point(0, 0)},
			{c: new Point(0, 100)},
			{c: new Point(100, 100)},
			{c: new Point(100, 0)}
		]);

		expect(ct.nodes[0].next).toBe(ct.nodes[1]);

		ct.updateControls();

		// there's no way to predict that the expected value is 28,
		// but last time the script worked it produced 28 :)
		expect(Math.round(ct.nodes[0].lc.x)).toBe(28);
		expect(Math.round(ct.nodes[0].lc.y)).toBe(-28);
	}));
});
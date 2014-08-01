'use strict';

describe('Contour structure', function () {

	// load the controller's module
	beforeEach(module('prototypo.Contour'));

	it('should create a nodelist from nodedata', inject(function(Contour) {
		var ct = new Contour(
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		);

		expect(ct.nodes.length).toBe(4);
		expect(ct.cycle).toBe(true);
	}));

	it('should create a nodelist from nodedata, from an array of nodes', inject(function(Contour) {
		var ct = new Contour([
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		]);

		expect(ct.nodes.length).toBe(4);
		expect(ct.cycle).toBe(true);
	}));

	it('should translate to an SVG path', inject(function(Contour) {
		var ct = new Contour([
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		]);

		ct.updateControls();

		ct.toSVG();

		expect(ct.d).toBe([
			'M 0 0',
			'C -28 28 -28 72 0 100',
			'C 28 128 72 128 100 100',
			'C 128 72 128 28 100 0',
			'C 72 -28 28 -28 0 0',
			'Z'
		].join(' '));
	}));

	describe('Update controls with Hobby', function() {

		it('should be able to update the position of its control points', inject(function(Contour) {
			var ct = new Contour([
				{c: [0, 0]},
				{c: [0, 100]},
				{c: [100, 100]},
				{c: [100, 0]}
			]);

			expect(ct.nodes[0].next).toBe(ct.nodes[1]);

			ct.updateControls();

			// there's no way to predict that the expected value is 28,
			// but last time the script worked it produced 28 :)
			expect(Math.round(ct.nodes[0].lc.x)).toBe(28);
			expect(Math.round(ct.nodes[0].lc.y)).toBe(-28);
			expect(Math.round(ct.nodes[0].rc.x)).toBe(-28);
			expect(Math.round(ct.nodes[0].rc.y)).toBe(28);

			ct.nodes[0].y = 20;
			ct.updateControls();

			// same here
			expect(Math.round(ct.nodes[0].lc.x)).toBe(24);
			expect(Math.round(ct.nodes[0].lc.y)).toBe(-14);
			expect(Math.round(ct.nodes[0].rc.x)).toBe(-17);
			expect(Math.round(ct.nodes[0].rc.y)).toBe(45);
		}));

		it('update controls when there\'s one line in the shape', inject(function(Contour) {
			var ct = new Contour([
				{c: [0, 0], rType: 'line'},
				{c: [0, 100], lType: 'line'},
				{c: [100, 100]},
				{c: [100, 0]}
			]);

			ct.updateControls();

			// there's no way to predict that the expected value is 28,
			// but last time the script worked it produced 28 :)
			expect(Math.round(ct.nodes[0].rc.x)).toBe(0);
			expect(Math.round(ct.nodes[0].rc.y)).toBe(0);
			expect(Math.round(ct.nodes[1].lc.x)).toBe(0);
			expect(Math.round(ct.nodes[1].lc.y)).toBe(100);

			ct.nodes[0].y = 20;
			// currently we need to re-set the control type to update the control position
			ct.nodes[0].rType = 'line';
			ct.updateControls();

			// ditto
			expect(Math.round(ct.nodes[0].rc.x)).toBe(0);
			expect(Math.round(ct.nodes[0].rc.y)).toBe(20);
			expect(Math.round(ct.nodes[1].lc.x)).toBe(0);
			expect(Math.round(ct.nodes[1].lc.y)).toBe(100);

			// ditto
			expect(Math.round(ct.nodes[2].lc.x)).toBe(72);
			expect(Math.round(ct.nodes[2].lc.y)).toBe(127);
			expect(Math.round(ct.nodes[2].rc.x)).toBe(129);
			expect(Math.round(ct.nodes[2].rc.y)).toBe(72);
		}));

		it('update controls when there are multiple lines in the shape', inject(function(Contour) {
			var ct = new Contour([
				{c: [0, 0], rType: 'line'},
				{c: [0, 100], lType: 'line', rType: 'line'},
				{c: [100, 100], lType: 'line'},
				{c: [100, 0]}
			]);

			ct.updateControls();

			// ditto
			expect(Math.round(ct.nodes[3].lc.x)).toBe(128);
			expect(Math.round(ct.nodes[3].lc.y)).toBe(28);
			expect(Math.round(ct.nodes[3].rc.x)).toBe(72);
			expect(Math.round(ct.nodes[3].rc.y)).toBe(-28);
		}));

	});
});
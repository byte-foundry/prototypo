'use strict';

describe('Node structure', function () {

	// load the controller's module
	beforeEach(module('prototypo.Node'));

	it('should create a point that inherits from Point', inject(function(Node) {
		var n = new Node({
			c: [12,23],
			lc: [34,45],
			rc: [56,67],
			a: 'b'
		});

		expect(n.x).toBe(12);
		expect(n.y).toBe(23);
		expect(n.lc.x).toBe(34);
		expect(n.lc.y).toBe(45);
		expect(n.rc.x).toBe(56);
		expect(n.rc.y).toBe(67);
		expect(n.a).toBe('b');
		expect(n.lType).toBe('open');
		expect(n.rType).toBe('open');
		expect(n.lTension).toBe(1);
		expect(n.rTension).toBe(1);
	}));

	it('should copy the node coordinates to the control points when their type is line', inject(function(Node) {
		var n = new Node({
			c: [12,23],
			lType: 'line',
			rType: 'line'
		});

		expect(n.lc.x).toBe(12);
		expect(n.lc.y).toBe(23);
		expect(n.rc.x).toBe(12);
		expect(n.rc.y).toBe(23);
		expect(n.lType).toBe('line');
		expect(n.rType).toBe('line');

		n._({
			c: [34,45],
			lType: 'line',
			rType: 'line'
		});

		expect(n.lc.x).toBe(34);
		expect(n.lc.y).toBe(45);
		expect(n.rc.x).toBe(34);
		expect(n.rc.y).toBe(45);
		expect(n.lType).toBe('line');
		expect(n.rType).toBe('line');
	}));

	it('should copy the node coordinates to the control points' +
			'when their type is line and the initial node was a placeholder', inject(function(Node) {

		var n2 = new Node({
			c: null
		});

		n2._({
			c: [34,45],
			lType: 'line',
			rType: 'line'
		});

		expect(n2.lc.x).toBe(34);
		expect(n2.lc.y).toBe(45);
		expect(n2.rc.x).toBe(34);
		expect(n2.rc.y).toBe(45);
		expect(n2.lType).toBe('line');
		expect(n2.rType).toBe('line');
	}));
});
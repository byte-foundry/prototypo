'use strict';

describe('PointCollection structure', function() {

	beforeEach(module('prototypo.Collection', 'prototypo.Point'));

	it('allows a set of points to be created and reused', inject(function( Collection, Point ) {
		var points = new Collection( Point );

		points(0)._(1,2);
		points(1)._(3,4);

		expect(points(0).x).toBe(1);
		expect(points(0).y).toBe(2);
		expect(points(1).x).toBe(3);
		expect(points(1).y).toBe(4);

		points(0)._(5,6);

		expect(points(0).x).toBe(5);
		expect(points(0).y).toBe(6);
	}));

});
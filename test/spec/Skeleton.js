'use strict';

describe('Skeleton structure', function () {

	// load the controller's module
	beforeEach(module('prototypo.Skeleton'));

	it('should create contour nodes on skeleton creation', inject(function(Skeleton) {
		var sk = new Skeleton(
			{c: [0,1]},
			{c: [2,3]}
		);

		expect(sk.contours.length).toBe(1);
		expect(sk.contours[0].nodes.length).toBe(4);
		expect(sk.contours[0].cycle).toBe(true);
	}));

	it('should create contour nodes on skeleton creation, from an array of nodes', inject(function(Skeleton) {
		var sk = new Skeleton([
			{c: [0,1]},
			{c: [2,3]}
		]);

		expect(sk.contours.length).toBe(1);
		expect(sk.contours[0].nodes.length).toBe(4);
		expect(sk.contours[0].cycle).toBe(true);
	}));

	it('should create two contours when the skeleton cycles', inject(function(Skeleton) {
		var sk = new Skeleton([
			{c: [0,1]},
			{c: [2,3]},
			'cycle'
		]);

		expect(sk.contours.length).toBe(2);
		expect(sk.contours[0].nodes.length).toBe(2);
		expect(sk.contours[1].nodes.length).toBe(2);
		expect(sk.contours[0].cycle).toBe(true);
		expect(sk.contours[1].cycle).toBe(true);
	}));
});
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

	it('should be able to expand the skeleton using width/angle/distr params', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [0,0], width: 20, rType: 'line'},
				{c: [50,100], width: 10, angle: -90, distr: 0, lType: 'line'},
				{c: [100,0], width: 20, angle: -180}
			]),
			nodes = sk.contours[0].nodes;

		sk.expand();

		expect(nodes[0].x).toBe( -10 );
		expect( Math.round(nodes[0].y) ).toBe( 0 );

		expect(nodes[1].x).toBe( 50 );
		expect(nodes[1].y).toBe( 100 );

		expect(nodes[2].x).toBe( 110 );
		expect( Math.round(nodes[2].y) ).toBe( 0 );

		expect(nodes[3].x).toBe( 90 );
		expect( Math.round(nodes[3].y) ).toBe( 0 );

		expect(nodes[4].x).toBe( 50 );
		expect(nodes[4].y).toBe( 90 );

		expect(nodes[5].x).toBe( 10 );
		expect( Math.round(nodes[5].y) ).toBe( 0 );
	}));

	describe('Update controls with Hobby', function() {

		it('should update controls when there\'s one line in the shape', inject(function(Skeleton) {
			var sk = new Skeleton([
					{c: [0,0], width: 20, rType: 'line'},
					{c: [50,100], width: 10, angle: -90, distr: 0, lType: 'line'},
					{c: [100,0], width: 20, angle: -180}
				]),
				nodes = sk.contours[0].nodes;

			sk.updateContours();

			expect(nodes[0].lType).toBe('line');
			expect(nodes[0].rType).toBe('line');

			expect(nodes[1].lType).toBe('line');
			expect(nodes[1].rType).toBe('open');

			expect(nodes[2].lType).toBe('open');
			expect(nodes[2].rType).toBe('line');

			expect(nodes[3].lType).toBe('line');
			expect(nodes[3].rType).toBe('open');

			expect(nodes[4].lType).toBe('open');
			expect(nodes[4].rType).toBe('line');

			expect(nodes[5].lType).toBe('line');
			expect(nodes[5].rType).toBe('line');
		}));
	});
});
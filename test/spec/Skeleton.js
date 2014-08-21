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

	it('should handle line instructions in skeleton', inject(function(Skeleton) {
		var sk = new Skeleton([
			{c: [0,1]},
			'line',
			{c: [2,3]}
		]);

		expect(sk.contours.length).toBe(1);
		expect(sk.contours[0].nodes.length).toBe(4);
		expect(sk.contours[0].cycle).toBe(true);

		expect(sk.nodes[0].rType).toBe('line');
		expect(sk.nodes[1].lType).toBe('line');
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

	it('should be able to link the nodes of an open skeleton', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [0,0], width: 20},
				{c: [50,100], width: 10, angle: -90, distr: 0},
				{c: [100,0], width: 20, angle: -180}
			]),
			nodes = sk.contours[0].nodes;

		expect(nodes[0].next).toBe(nodes[1]);
		expect(nodes[1].next).toBe(nodes[2]);
		expect(nodes[2].next).toBe(nodes[3]);
		expect(nodes[3].next).toBe(nodes[4]);
		expect(nodes[4].next).toBe(nodes[5]);
		expect(nodes[5].next).toBe(nodes[0]);

		expect(sk.nodes[0].left[0].rc).toBe(nodes[0].rc);
		expect(sk.nodes[0].left[0].lc).toBe(nodes[0].lc);
		expect(sk.nodes[1].left[0].rc).toBe(nodes[1].rc);
		expect(sk.nodes[1].left[0].lc).toBe(nodes[1].lc);
		expect(sk.nodes[2].left[0].rc).toBe(nodes[2].rc);
		expect(sk.nodes[2].left[0].lc).toBe(nodes[2].lc);
		expect(sk.nodes[2].right[0].rc).toBe(nodes[3].rc);
		expect(sk.nodes[2].right[0].lc).toBe(nodes[3].lc);
		expect(sk.nodes[1].right[0].rc).toBe(nodes[4].rc);
		expect(sk.nodes[1].right[0].lc).toBe(nodes[4].lc);
		expect(sk.nodes[0].right[0].rc).toBe(nodes[5].rc);
		expect(sk.nodes[0].right[0].lc).toBe(nodes[5].lc);
	}));

	it('should be able to link the nodes of an open skeleton containing lines', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [0,0], width: 20, rType: 'line'},
				{c: [50,100], width: 10, angle: -90, distr: 0, lType: 'line'},
				{c: [100,0], width: 20, angle: -180}
			]),
			nodes = sk.contours[0].nodes;

		expect(nodes.length).toBe(8);

		expect(nodes[0].next).toBe(nodes[1]);
		expect(nodes[1].next).toBe(nodes[2]);
		expect(nodes[2].next).toBe(nodes[3]);
		expect(nodes[3].next).toBe(nodes[4]);
		expect(nodes[4].next).toBe(nodes[5]);
		expect(nodes[5].next).toBe(nodes[6]);
		expect(nodes[6].next).toBe(nodes[7]);
		expect(nodes[7].next).toBe(nodes[0]);

		expect(sk.nodes[0].left[0].rc).toBe(nodes[0].rc);
		expect(sk.nodes[0].left[0].lc).toBe(nodes[0].lc);
		expect(sk.nodes[1].left[0].rc).toBe(nodes[1].rc);
		expect(sk.nodes[1].left[0].lc).toBe(nodes[1].lc);
		expect(sk.nodes[1].left[1].rc).toBe(nodes[2].rc);
		expect(sk.nodes[1].left[1].lc).toBe(nodes[2].lc);
		expect(sk.nodes[2].left[0].rc).toBe(nodes[3].rc);
		expect(sk.nodes[2].left[0].lc).toBe(nodes[3].lc);
		expect(sk.nodes[2].right[0].rc).toBe(nodes[4].rc);
		expect(sk.nodes[2].right[0].lc).toBe(nodes[4].lc);
		// I'm not 100% sure right[0] should comes before right 1
		expect(sk.nodes[1].right[0].rc).toBe(nodes[5].rc);
		expect(sk.nodes[1].right[0].lc).toBe(nodes[5].lc);
		expect(sk.nodes[1].right[1].rc).toBe(nodes[6].rc);
		expect(sk.nodes[1].right[1].lc).toBe(nodes[6].lc);
		expect(sk.nodes[0].right[0].rc).toBe(nodes[7].rc);
		expect(sk.nodes[0].right[0].lc).toBe(nodes[7].lc);
	}));

	it('should be able to link the nodes of a cycling skeleton', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [50, 100], width: 20, angle: 90, distr: 1},
				{c: [100, 50], width: 20, angle: 0, distr: 1 },
				{c: [50, 0], width: 20, angle: -90, distr: 1},
				{c: [0, 50], width: 20, angle: -180, distr: 1},
				'cycle'
			]),
			nodes = sk.nodes;

		sk.expand();

		expect(nodes[0].left[0].toString()).toBe(sk.contours[0].nodes[0].toString());
		expect(nodes[1].left[0].toString()).toBe(sk.contours[0].nodes[1].toString());
		expect(nodes[2].left[0].toString()).toBe(sk.contours[0].nodes[2].toString());
		expect(nodes[3].left[0].toString()).toBe(sk.contours[0].nodes[3].toString());

		expect(nodes[0].right[0].toString()).toBe(sk.contours[1].nodes[3].toString());
		expect(nodes[1].right[0].toString()).toBe(sk.contours[1].nodes[2].toString());
		expect(nodes[2].right[0].toString()).toBe(sk.contours[1].nodes[1].toString());
		expect(nodes[3].right[0].toString()).toBe(sk.contours[1].nodes[0].toString());


		expect(nodes[0].left[0].next.toString()).toBe(nodes[1].left[0].toString());
		expect(nodes[1].left[0].next.toString()).toBe(nodes[2].left[0].toString());
		expect(nodes[2].left[0].next.toString()).toBe(nodes[3].left[0].toString());
		expect(nodes[3].left[0].next.toString()).toBe(nodes[0].left[0].toString());

		expect(nodes[0].right[0].next.toString()).toBe(nodes[3].right[0].toString());
		expect(nodes[1].right[0].next.toString()).toBe(nodes[0].right[0].toString());
		expect(nodes[2].right[0].next.toString()).toBe(nodes[1].right[0].toString());
		expect(nodes[3].right[0].next.toString()).toBe(nodes[2].right[0].toString());
	}));

	it('should be able to expand the skeleton using width/angle/distr params', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [0,0], width: 20},
				{c: [50,100], width: 10, angle: -90, distr: 0},
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

	it('should be able to expand the skeleton made of lines using width/angle/distr params', inject(function(Skeleton) {
		var sk = new Skeleton([
				{c: [0,0], width: 20},
				'line',
				{c: [50,100], width: 10},
				'line',
				{c: [100,0], width: 20, angle: -180}
			]),
			nodes = sk.contours[0].nodes;

		sk.expand();

		expect(nodes[0].x).toBe( -10 );
		expect( Math.round(nodes[0].y) ).toBe( 0 );

		expect(nodes[1].x).toBe( 40 );
		expect(nodes[1].y).toBe( 100 );

		expect(nodes[2].x).toBe( 60 );
		expect(nodes[2].y).toBe( 100 );

		expect(nodes[3].x).toBe( 110 );
		expect( Math.round(nodes[3].y) ).toBe( 0 );

		expect(nodes[4].x).toBe( 90 );
		expect( Math.round(nodes[4].y) ).toBe( 0 );

		expect(nodes[5].x).toBe( 40 );
		expect(nodes[5].y).toBe( 100 );

		expect(nodes[6].x).toBe( 60 );
		expect(nodes[6].y).toBe( 100 );

		expect(nodes[7].x).toBe( 10 );
		expect( Math.round(nodes[7].y) ).toBe( 0 );
	}));

	describe('Update controls with Hobby', function() {

		// there's an equivalent test in coutour.js
		it('should update controls when there\'s one line in the shape', inject(function(Skeleton) {
			var sk = new Skeleton([
					{c: [0,0], width: 20},
					'line',
					{c: [50,100], width: 10, angle: -90, distr: 0},
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



			expect(nodes[0].rc.x).toBe( -10 );
			expect( Math.round(nodes[0].rc.y) ).toBe( 0 );

			expect(nodes[1].lc.x).toBe( 50 );
			expect(nodes[1].lc.y).toBe( 100 );

			// second line
			expect(nodes[2].rc.x).toBe( 110 );
			expect( Math.round(nodes[2].rc.y) ).toBe( 0 );

			expect(nodes[3].lc.x).toBe( 90 );
			expect( Math.round(nodes[3].lc.y) ).toBe( 0 );

			// third line
			expect(nodes[4].rc.x).toBe( 50 );
			expect(nodes[4].rc.y).toBe( 90 );

			expect(nodes[5].lc.x).toBe( 10 );
			expect( Math.round(nodes[5].lc.y) ).toBe( 0 );

			// fourth line
			expect(nodes[5].rc.x).toBe( 10 );
			expect( Math.round(nodes[5].rc.y) ).toBe( 0 );

			expect(nodes[0].lc.x).toBe( -10 );
			expect( Math.round(nodes[0].lc.y) ).toBe( 0 );
		}));
	});
});
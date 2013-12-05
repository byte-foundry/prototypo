'use strict';

// DEPRECATED, use filter "on" instead (in Point.js)
// TODO: move them to /test/spec/Segment.js
/*describe('segmentUtils', function() {

	beforeEach(module('prototypo.segmentUtils', 'prototypo.Segment', 'prototypo.Point'));

	var find,
		seg1,
		seg2,
		p1,
		p2,
		p3,
		p4;

	beforeEach(inject(function( Segment, Point, findPoint ) {
		find = findPoint;
		seg1 = Segment( 'L 50 100', Point(0,0) );
		seg2 = Segment( 'M 30 -20', Point(-20, 80) );
		p1 = Point(40,80);
		p2 = Point(10,20);
		p3 = Point(-20,80);
		p4 = Point(30,-20);
	}));

	it('should find a point on a straight Segment, given x or y', function() {
		expect(find({
			x: 20,
			on: seg1
		}).toString()).toBe('20 40');

		expect(find({
			y: 60,
			on: seg1
		}).toString()).toBe('30 60');

		expect(find({
			x: 0,
			on: seg2
		}).toString()).toBe('0 40');

		expect(find({
			y: 0,
			on: seg2
		}).toString()).toBe('20 0');
	});

	it('should find a point between two Points, given x or y', function() {
		expect(find({
			x: 20,
			on: [p1,p2]
		}).toString()).toBe('20 40');

		expect(find({
			y: 60,
			on: [p1,p2]
		}).toString()).toBe('30 60');

		expect(find({
			x: 0,
			on: [p3,p4]
		}).toString()).toBe('0 40');

		expect(find({
			y: 0,
			on: [p3,p4]
		}).toString()).toBe('20 0');
	});

	it('handles undefined .on, given x or y', function() {
		expect(find({
			x: 20,
			on: undefined
		}).toString()).toBe('20 NaN');

		expect(find({
			y: 60,
			on: undefined
		}).toString()).toBe('NaN 60');

		expect(find({
			x: 20,
			on: [undefined, p1]
		}).toString()).toBe('20 NaN');

		expect(find({
			y: 60,
			on: [p1, undefined]
		}).toString()).toBe('NaN 60');
	});

	/*it('should find the intersection of two straight Segments', function() {
		expect(find({
			x: 20,
			on: [p1,p2]
		}).y).toBe('20 60');

		expect(find({
			y: 60,
			on: [p1,p2]
		}).toString()).toBe('30 40');
	});

	it('should find the intersection of a straight Segment and two Points', function() {
		expect(find({
			x: 20,
			on: [p1,p2]
		}).y).toBe('20 60');

		expect(find({
			y: 60,
			on: [p1,p2]
		}).toString()).toBe('30 40');
	});

});*/
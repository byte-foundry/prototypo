'use strict';

angular.module('prototypo.segmentUtils', ['prototypo.Segment'])
	.factory('findPoint', function( Segment ) {
		var rstraight = /[LVMH]/;

		return function( args ) {
			var point,
				origin,
				vector;

			// point on a segment
			if ( args.x !== undefined || args.y !== undefined ) {

				// point on a straight line
				if ( ( args.on instanceof Segment && rstraight.test(args.on.command) ) ||
					args.on.constructor === Array ) {
					// segment from two points
					if ( args.on.constructor === Array ) {
						origin = args.on[0];
						vector = {
							x: args.on[1].x - args.on[0].x,
							y: args.on[1].y - args.on[0].y
						};

					// Segment instance
					} else {
						origin = args.on.start;
						vector = {
							x: args.on.end.x - args.on.start.x,
							y: args.on.end.y - args.on.start.y
						};
					}

					point = args.x !== undefined ?
						[ args.x, ( args.x - origin.x ) / vector.x * vector.y + origin.y ]:
						[ ( args.y - origin.y ) / vector.y * vector.x + origin.x, args.y ];

				// point on a curve
				} else {

				}

			// intersection
			} else {

			}

			return point.join(' ');
		};
	});
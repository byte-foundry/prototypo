'use strict';

angular.module('prototypo.segmentUtils', ['prototypo.Point'])
	.factory('findPoint', function( Point ) {
		var rstraight = /[LVMH]/;

		return function( args ) {
			var origin,
				vector;

			// point on a segment
			if ( args.x !== undefined || args.y !== undefined ) {
				// handle cases where on refers to undefined data
				if ( args.on === undefined || ( args.on.constructor === Array && ( args.on[0] === undefined || args.on[1] === undefined ) ) ) {
					return args.x !== undefined ?
						Point( args.x, NaN ):
						Point( NaN, args.y );
				}

				// point on a straight line
				if ( ( args.on.command !== undefined && rstraight.test(args.on.command) ) ||
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

					return args.x !== undefined ?
						Point( args.x, ( args.x - origin.x ) / vector.x * vector.y + origin.y ):
						Point( ( args.y - origin.y ) / vector.y * vector.x + origin.x, args.y );

				// point on a curve
				} else {

				}

			// intersection
			} else {

			}
		};
	});
'use strict';

angular.module('prototyp0.glyphs', ['prototyp0.components'])
	.constant('glyphs', {} )
	// calculate the segments of a glyph according to the sliders
	.factory('interpolateGlyph', function( $interpolate, _, glyphs, absolutizeSegment, boundHelpers ) {
		var rseparator = /[ ,]+/g;

		return function( glyph, sliders ) {
			var interpolatedGlyph = glyphs[ glyph ].interpolated,
				position = {
					x: 0,
					y: 0
				},
				absoluteGlyph = {},
				context = _.extend({}, sliders, boundHelpers( absoluteGlyph ));

			_( interpolatedGlyph ).each(function( segment, i ) {
				absoluteGlyph[i] = absolutizeSegment(
					// execute interpolated segment and split it
					segment( context ).replace(rseparator, ' ').split(' '),
					position
				);
			});

			return absoluteGlyph;
		};
	})

	// make every point of the glyph absolute and translate non-standard commands
	.factory('absolutizeSegment', function() {
		return function( segment, position ) {
			var j = 0,
				l = segment.length;

			if ( l < 2 ) {
				return segment;
			}

			switch ( segment[0] ) {
			// end-point of the cubic is absolutely positioned,
			// anchors are relative to their point
			case 'rC':
				segment[0] = 'C';
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				position.x = +segment[5];
				position.y = +segment[6];
				segment[3] = +segment[3] + position.x;
				segment[4] = +segment[4] + position.y;
				break;
			// end-point of the cubic is relatively positioned,
			// anchors are relative to their point
			case 'rc':
				segment[0] = 'C';
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				position.x = segment[5] = +segment[5] + position.x;
				position.y = segment[6] = +segment[6] + position.y;
				segment[3] = +segment[3] + position.x;
				segment[4] = +segment[4] + position.y;
				break;
			// end-point of the smooth cubic is absolutely positioned,
			// anchors are relative to their point
			case 'rS':
				segment[0] = 'S';
				position.x = +segment[3];
				position.y = +segment[4];
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				break;
			// end-point of the smooth cubic is relatively positioned,
			// anchors are relative to their point
			case 'rs':
				segment[0] = 'S';
				position.x = segment[3] = +segment[3] + position.x;
				position.y = segment[4] = +segment[4] + position.y;
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				break;
			case 'h':
				segment[0] = 'H';
				position.x = segment[1] = +segment[1] + position.x;
				break;
			case 'v':
				segment[0] = 'V';
				position.y = segment[1] = +segment[1] + position.y;
				break;
			case 'l':
			case 'm':
			case 'q':
			case 'c':
			case 's':
			case 't':
			case 'f':
				segment[0] = segment[0].toUpperCase();
				while ( ++j < l ) {
					segment[j] = +segment[j] + ( j % 2 ? position.x : position.y );
				}
				position.x = segment[l-2];
				position.y = segment[l-1];
				break;
			default:
				position.x = +segment[l-2];
				position.y = +segment[l-1];
				break;
			}

			// round coordinates
			while ( --l ) {
				segment[l] = parseInt( segment[l], 10 );
			}

			return segment;
		};
	})

	.factory('boundHelpers', function() {
		return function( glyph ) {
			return {
				point: function(i) {
					var l = glyph[i].length;
					return {
						x: +glyph[i][l-2],
						y: +glyph[i][l-1],
						xy: +glyph[i][l-2] + ',' + glyph[i][l-1],
						// FIXME: unfortunately angular doesn't seem to be able to use that
						toString: function() {
							return +glyph[i][l-2] + ',' + glyph[i][l-1];
						}
					};
				},
				find: function( params ) {
					var start = glyph[params.on[0]].slice(-2),
						end = glyph[params.on[1]].slice(-2),
						vector = {
							x: +end[0] - start[0],
							y: +end[1] - start[1]
						},
						point = params.x ?
							[ params.x, ( params.x - start[0] ) / vector.x * vector.y + start[1] ]:
							[ ( params.y - start[1] ) / vector.y * vector.x + start[0], params.y ];

					return point.join(' ');
				},
				serif: function() {
					return 'F';
				}
			};
		};
	})

	// find a point on a vector, and add its origin
	.filter('on', function() {
		return function( point, segment ) {
			var vector = {
					x: segment.vector[1].x - segment.vector[0].x,
					y: segment.vector[1].y - segment.vector[0].y
				},
				tmp = point.x ?
					[ point.x, ( point.x / vector.x ) * vector.y ] :
					[ ( point.y / vector.y ) * vector.x , point.y ];

			if ( segment.origin ) {
				tmp[0] += segment.origin.x;
				tmp[1] += segment.origin.y;
			}

			return tmp.join();
		};
	})

	/*// add a vector to a point
	.filter('add', function() {
		return function( point, vector ) {
			if ( typeof point === 'string' ) {
				point = point.split(' ');
			}

			return [
				+point[0] + vector[0],
				+point[1] + vector[1]
			].join(' ');
		};
	})*/;
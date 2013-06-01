'use strict';

angular.module('prototyp0.glyphs', ['prototyp0.components'])
	.constant('glyphs', {} )
	// calculate the segments of a glyph according to the sliders
	.factory('interpolateGlyph', function( $interpolate, _, glyphs ) {
		return function( glyph, sliders ) {
			var glyphFormula = glyphs[ glyph ],
				interpolatedGlyph = {};

			// temporarily combine the sliders and glyphRef objects
			sliders.ref = glyphs[ 'ref:' + glyph ];

			_( glyphFormula ).each(function( segment, i ) {
				interpolatedGlyph[i] = $interpolate( segment )( sliders );
			});

			// cleanup sliders object
			delete sliders.ref;

			return interpolatedGlyph;
		};
	})

	// make every point of the glyph absolute and translate non-standard commands
	.factory('absolutizeGlyph', function( _ ) {
		var rseparator = /[ ,]+/g;

		return function( interpolatedGlyph ) {
			var curX = 0,
				curY = 0;

			_( interpolatedGlyph ).each(function( segment, i ) {
				// normalize and split the segment
				segment = segment.replace(rseparator, ' ').split(' ');
				var j = 0,
					l = segment.length;

				switch ( segment[0] ) {
				// end-point of the cubic is absolutely positioned,
				// anchors are relative to their point
				case 'rC':
					segment[0] = 'C';
					segment[1] = +segment[1] + curX;
					segment[2] = +segment[2] + curY;
					curX = +segment[5];
					curY = +segment[6];
					segment[3] = +segment[3] + curX;
					segment[4] = +segment[4] + curY;
					break;
				// end-point of the cubic is relatively positioned,
				// anchors are relative to their point
				case 'rc':
					segment[0] = 'C';
					segment[1] = +segment[1] + curX;
					segment[2] = +segment[2] + curY;
					curX = segment[5] = +segment[5] + curX;
					curY = segment[6] = +segment[6] + curY;
					segment[3] = +segment[3] + curX;
					segment[4] = +segment[4] + curY;
					break;
				// end-point of the smooth cubic is absolutely positioned,
				// anchors are relative to their point
				case 'rS':
					segment[0] = 'S';
					curX = +segment[3];
					curY = +segment[4];
					segment[1] = +segment[1] + curX;
					segment[2] = +segment[2] + curY;
					break;
				// end-point of the smooth cubic is relatively positioned,
				// anchors are relative to their point
				case 'rs':
					segment[0] = 'S';
					curX = segment[3] = +segment[3] + curX;
					curY = segment[4] = +segment[4] + curY;
					segment[1] = +segment[1] + curX;
					segment[2] = +segment[2] + curY;
					break;
				case 'h':
					segment[0] = 'H';
					curX = segment[1] = +segment[1] + curX;
					break;
				case 'v':
					segment[0] = 'V';
					curY = segment[1] = +segment[1] + curY;
					break;
				case 'l':
				case 'm':
				case 'q':
				case 'c':
				case 's':
				case 't':
					segment[0] = segment[0].toUpperCase();
					while ( ++j < l ) {
						segment[j] = +segment[j] + ( j % 2 ? curX : curY );
					}
					curX = segment[l-2];
					curY = segment[l-1];
					break;
				}

				interpolatedGlyph[i] = segment.join(' ');
			});

			return interpolatedGlyph;
		};
	})

	// find a point on a line, when you know either its x or y, thanks to Thales
	.filter('onLine', function() {
		return function( point, segment ) {
			if ( typeof point === 'string' ) {
				point = point.split(' ');
			}

			return ( point[0] ?
				[ point[0], ( point[0] / segment[0] ) * segment[1] ] :
				[ ( point[1] / segment[1] ) * segment[0] , point[1] ]
			).join(' ');
		};
	})

	// add a vector to a point
	// FIXME: we should get rid of this filter ideally
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
	});
'use strict';

angular.module('prototyp0.filters', ['lodash'])
	.filter('compute', function( glyphs, GlyphCache, interpolateGlyph ) {
		return function( glyph, sliders ) {
			// FIXME: tthis cache mechanism should probably go into the interpolateGlyph function
			var slidersCacheKey = [ glyph ],
				computedGlyph;

			// make sure sliders value are integers
			for ( var i in sliders ) {
				sliders[i] = +sliders[i];
				slidersCacheKey.push( sliders[i] );
			}

			if ( ( computedGlyph = GlyphCache.get( slidersCacheKey.join(' ') ) ) ) {
				return computedGlyph;
			}

			computedGlyph = interpolateGlyph( glyph, sliders );
			GlyphCache.put( slidersCacheKey.join(' '), computedGlyph );
			return computedGlyph;
		};
	})

	.filter('contours', function( _ ) {
		// FIXME: this filter is executed four or five times !?!
		return function( segments ) {
			var d = [];

			_( segments ).each(function( segment ) {
				d.push( segment.join(' ') );
			});

			return d.join(' ');
		};
	})
	.filter('points', function( _ ) {
		return function( segments ) {
			var d = [];

			_( segments ).each(function( segment ) {
				// FIXME: the typeof check will be useless with the new glyph structure
				if ( typeof segment === 'string' ) {
					segment = segment.split(' ');
				}

				var l = segment.length,
					isRelative = /[a-z]/.test( segment[0] );

				if ( l < 3 ) {
					return;
				}

				// move to point
				d.push([
					isRelative ? 'm' : 'M',
					segment[l-2],
					segment[l-1]
				].join(' '));

				// draw debug shape and move back to point
				d.push(
					'm 0 2' +
					'h 2' +
					'v -4' +
					'h -4' +
					'v 4' +
					'z' +
					'm 0 -2'
				);
			});

			return d.join(' ');
		};
	})
	.filter('anchors', function( _ ) {
		return function( segments ) {
			var d = ['M 0,0'];

			_( segments ).each(function( segment ) {
				// FIXME: the typeof check will be useless with the new glyph structure
				if ( typeof segment === 'string' ) {
					segment = segment.split(' ');
				}

				var l = segment.length,
					isRelative = /[a-z]/.test( segment[0] );

				if ( l > 3 ) {
					// line to 1st anchor and back to point
					d.push([
						isRelative ? 'l' : 'L',
						segment[1],
						segment[2],
						'z'
					].join(' '));
				}

				if ( l < 3 ) {
					return;
				}

				// move to next point
				d.push([
					isRelative ? 'm' : 'M',
					segment[l-2],
					segment[l-1]
				].join(' '));

				if ( l > 5 ) {
					// line to 2nd anchor and back to point
					d.push([
						isRelative ? 'l' : 'L',
						segment[3] - ( isRelative ? -segment[l-2] : 0 ),
						segment[4] - ( isRelative ? -segment[l-1] : 0 ),
						'z'
					].join(' '));
				}
			});

			return d.join(' ');
		};
	});

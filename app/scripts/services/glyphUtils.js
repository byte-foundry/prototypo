'use strict';

angular.module('prototypo.glyphUtils', [])
	.factory('processGlyph', function( _, GlyphCache, processComponent, absolutizeGlyph ) {
		var rexpression = /{/;

		return function( font, glyphCode, controlValues ) {
			// FIXME: ugly race-condition fix. This shouldn't be needed
			if ( !glyphCode || rexpression.test(glyphCode) || !font || !Object.keys( controlValues ).length ) {
				return;
			}

			var slidersCacheKey,
				glyph = font.glyphs[ glyphCode ],
				processedGlyph;

			// generate cache-key
			slidersCacheKey = [ glyphCode ].concat( _.map( controlValues, function(val) {
				return val;
			})).join();

			if ( ( processedGlyph = GlyphCache.get( slidersCacheKey ) ) ) {
				return processedGlyph;
			}

			processedGlyph = processComponent({
				font: font,
				component: glyph,
				controls: controlValues,
				params: {},
				parent: glyph.reference || {},
				origin: { x:0, y:0 },
				insertIndex: 0,
				destination: []
			});

			absolutizeGlyph( processedGlyph );

			GlyphCache.put( slidersCacheKey, processedGlyph );

			return processedGlyph;
		};
	})

	// Choos a non-virtual point as initial M.
	// Convert rC and rS segments of the glyph.
	.factory('absolutizeGlyph', function( _, structureSegment ) {
		return function( processedGlyph ) {
			if ( processedGlyph[0].command === '*' ) {
				// search fo a non-virtual point at the end of the glyph
				var i = processedGlyph.length;
				while ( --i ) {
					if ( processedGlyph[i].command !== '*' ) {
						// make it real
						processedGlyph[0][0] = 'M';
						processedGlyph[0][1] = processedGlyph[i].x;
						processedGlyph[0][2] = processedGlyph[i].y;

						// fixme: remove this when we switch to harmony proxy
						structureSegment( processedGlyph[0] );
					}
				}
			}

			var lastRealEndpoint;

			_( processedGlyph ).each(function( segment ) {
				switch ( segment.command ) {
				case 'rC':
				case 'rS':
				case 'rQ':
					if ( segment.length > 3 ) {
						segment[3] = segment[3] + segment.x;
						segment[4] = segment[4] + segment.y;
					}
					segment[1] = segment[1] + lastRealEndpoint.x;
					segment[2] = segment[2] + lastRealEndpoint.y;

					segment[0] = segment[0].slice(-1);

					// fixme: remove this when we switch to harmony proxy
					structureSegment( segment );
					break;
				}

				if ( segment.command !== '*' ) {
					lastRealEndpoint = segment;
				}
			});
		};
	});
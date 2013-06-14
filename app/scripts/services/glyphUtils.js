'use strict';

angular.module('prototyp0.glyphUtils', [])
	.factory('processGlyph', function( _, GlyphCache, processComponent ) {
		var rexpression = /{/;

		return function( font, glyphCode, inputValues ) {
			// FIXME: ugly race-condition fix. This shouldn't be needed
			if ( !glyphCode || rexpression.test(glyphCode) || !font || !Object.keys( inputValues ).length ) {
				return;
			}

			var slidersCacheKey,
				glyph = font.glyphs[ glyphCode ],
				processedGlyph;

			// generate cache-key
			slidersCacheKey = [ glyphCode ].concat( _.map( inputValues, function(val) {
				return val;
			})).join();

			if ( ( processedGlyph = GlyphCache.get( slidersCacheKey ) ) ) {
				return processedGlyph;
			}

			processedGlyph = processComponent({
				font: font,
				component: glyph,
				inputs: inputValues,
				params: {},
				parent: glyph.reference || {},
				origin: { x:0, y:0 },
				insertIndex: 0,
				destination: []
			});
			GlyphCache.put( slidersCacheKey, processedGlyph );

			return processedGlyph;
		};
	});
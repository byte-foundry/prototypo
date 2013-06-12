'use strict';

angular.module('prototyp0.glyphUtils', [])
	.factory('processGlyph', function( processComponent ) {
		return function( font, glyph, inputValues ) {
			return processComponent({
				font: font,
				component: glyph,
				inputs: inputValues,
				params: {},
				parent: glyph.reference || {},
				origin: { x:0, y:0 },
				insertIndex: 0,
				destination: []
			});
		};
	});
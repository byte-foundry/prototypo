'use strict';

angular.module('prototyp0.glyphCache', [])
	.factory('GlyphCache', function( $cacheFactory ) {
		return $cacheFactory('glyphCache', {
			capacity: 100
		});
	});
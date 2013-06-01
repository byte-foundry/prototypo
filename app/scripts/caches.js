'use strict';

angular.module('prototyp0.caches', [])
	.factory('GlyphCache', function( $cacheFactory ) {
		return $cacheFactory('glyphCache', {
			capacity: 100
		});
	});
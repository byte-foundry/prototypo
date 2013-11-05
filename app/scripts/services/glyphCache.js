'use strict';

angular.module('prototypo.glyphCache', [])
	.factory('GlyphCache', function( $cacheFactory ) {
		return $cacheFactory('glyphCache', {
			capacity: 100
		});
	});
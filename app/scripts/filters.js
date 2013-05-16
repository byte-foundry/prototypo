'use strict';

angular.module('prototyp0.filters', [])
	.filter('glyph', function( $compile, $rootScope, glyphs ) {
		return function( input, glyph ) {
			_( input ).each(function( value, key ) {
				input[ key ] = +value;
			});

			var d = [],
				segments = glyphs[ glyph ]( input );

			_( segments ).each(function( segment ) {
				d.push( segment.join(' ') );
			});

			return d.join(' ');
		};
	});

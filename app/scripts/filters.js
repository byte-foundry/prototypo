'use strict';

angular.module('prototyp0.filters', [])
	.filter('glyph', function( $compile, $rootScope, glyphs ) {
		return function( input, glyph ) {
			_( input ).each(function( value, key ) {
				input[ key ] = +value;
			});

			var d = [],
				array = glyphs[ glyph ]( input );

			_( array ).each(function( line ) {
				d.push( line.join(' ') );
			});

			return d.join(' ');
		};
	});

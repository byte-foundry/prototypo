angular.module('prototyp0Filters', ['prototyp0App', 'prototyp0Glyph'])
	.filter('glyph', function( $compile, $rootScope, glyphs ) {
		return function( input, glyph ) {
			_( input ).each(function( value, key ) {
				input[ key ] = +value
			});

			var d = [],
				array = glyphs[ glyph ]( input );

			_( array ).each(function( line ) {
				d.push( line.join(' ') );
			});

			return d.join(' ');
		};
	});

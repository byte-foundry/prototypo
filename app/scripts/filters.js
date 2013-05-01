angular.module('prototyp0Filters', ['prototyp0App', 'prototyp0Glyph'])
	.filter('glyph', function( $compile, $rootScope, glyphs ) {
		return function( input, glyph ) {
			var d = [];

			var scope = $rootScope.$new();
			scope.dim = input;

			_( glyphs[ glyph ] ).each(function( line ) { 
				d.push( line.join(' ').replace(/{{(.*?)}}/g, function( $0, $1 ) {
					return scope.$eval( $1 );
				}) );
			});

			return d.join(' ');
		};
	});

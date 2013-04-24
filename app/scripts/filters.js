'use strict';

angular.module('prototyp0Filters', [])
	.filter('dimension', function(  ) {
		return function( input ) {
			console.log( input );
			return +input;
		};
	});
'use strict';

angular.module('prototypo.Utils', [])
	// throttle function execution using requestAnimationFrame
	// This function isn't meant to be called recursively!
	.factory('throttle', function() {
		var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
			toExecute;

		return function( func ) {
			toExecute = func;

			rAF(function() {
				if ( toExecute ) {
					toExecute();
				}
				toExecute = undefined;
			});
		};
	});
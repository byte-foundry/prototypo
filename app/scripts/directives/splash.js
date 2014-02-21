'use strict';

angular.module('prototypo.splashDirective', [])
	.directive('splash', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/splash.html',
			replace: true,
			link: function postLink() {
			}
		};
	});
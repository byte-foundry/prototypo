'use strict';

angular.module('prototypo.trackingDirective', [])
	.directive('tracking', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/tracking.html',
			replace: true,
			link: function postLink() {
			}
		};
	});
'use strict';

angular.module('prototypo.spacingDirective', [])
	.directive('spacing', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/spacing.html',
			replace: true,
			link: function postLink( $scope, $element ) {
			}

		};
	});
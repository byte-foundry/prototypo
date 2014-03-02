'use strict';

angular.module('prototypo.parampanelDirective', [])
	.directive('parampanel', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/parampanel.html',
			replace: true,
			link: function postLink( $scope, $element ) {
			}
		};
	});
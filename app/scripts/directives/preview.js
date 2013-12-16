'use strict';

angular.module('prototypo.previewDirective', [])
	.directive('preview', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/preview.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				
			}
		};
	});
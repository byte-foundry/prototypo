'use strict';

angular.module('prototypo.fontVersionsDirective', [])
	.directive('fontVersions', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/font-versions.html',
			replace: true,
			link: function postLink( $scope /*, $element*/ ) {
				
			}

		};
	});
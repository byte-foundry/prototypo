'use strict';

angular.module('prototypo.contextMenuStringDirective', [])
	.directive('contextMenuString', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/context-menu-string.html',
			replace: true,
			link: function postLink( $scope, $element ) {
			}

		};
	});
'use strict';

angular.module('prototypo.contextMenuDirective', [])
	.directive('contextMenu', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/context-menu.html',
			replace: true,
			link: function postLink( $scope, $element ) {
			}

		};
	});
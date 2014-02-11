'use strict';

angular.module('prototypo.sceneButtonsDirective', [])
	.directive('sceneButtons', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/sceneButtons.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				// prevent dragging buttons
				$element.on('dragstart', function() {
					return false;
				});
			}
		};
	});
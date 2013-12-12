'use strict';

angular.module('prototypo.sceneDirective', [])
	.directive('scene', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/scene.html',
			replace: true,
			link: function( $scope, $element ) {
				$element.on('wheel', function( e ) {
					$scope.zoom( e.originalEvent.deltaY );
				});
			}
		};
	});
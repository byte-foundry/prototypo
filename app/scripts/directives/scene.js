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
					return false;
				});

				// <svg> is totally unable to handle % dimensions
				$element.find('svg')
					.attr({
						width: $element[0].offsetWidth,
						height: $element[0].offsetHeight
					})
					.css({ display: 'block' });
			}
		};
	});
'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function() {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element, $attrs ) {
				$scope.$watch('puid', function() {
					$element.attr( 'd', $scope.allOutlines[ $attrs.glyphContour ] );
				});
			}
		};
	});
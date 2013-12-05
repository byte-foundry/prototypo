'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function() {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('glyph.suid', function() {
					if ( $scope.glyph ) {
						$element.attr( 'd', $scope.glyph.toSVG() );
					}
				});
			}
		};
	});
'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function() {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('processedGlyph.suid', function() {
					if ( $scope.processedGlyph ) {
						$element.attr( 'd', $scope.processedGlyph.toSVG() );
					}
				});
			}
		};
	});
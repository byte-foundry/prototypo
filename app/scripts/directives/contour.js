'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function( _ ) {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('processedGlyph.suid', function( suid ) {
					if ( $scope.processedGlyph ) {
						$element.attr( 'd', $scope.processedGlyph.toSVG() );
					}
				});
			}
		};
	});
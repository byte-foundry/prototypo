'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function( _ ) {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('processedGlyph', function( glyph ) {
					if ( glyph ) {
						$element.attr( 'd', glyph.toSVG() );
					}
				});
			}
		};
	});
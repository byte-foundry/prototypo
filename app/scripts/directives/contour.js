'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function( _ ) {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('processedGlyph.suid', function( suid ) {console.log('suid', suid );
					//if ( glyph ) {
						$element.attr( 'd', $scope.processedGlyph.toSVG() );
					//}
				});
			}
		};
	});
'use strict';

angular.module('prototypo.contourDirective', [])
	.directive('glyphContour', function() {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element, $attrs ) {
				function glyphHandler() {
					var char = $attrs.glyphContour || ' ';

					// TODO: we shouldn't need this check
					if ( $scope.allGlyphs[char] ) {
						$element.attr( 'd', $scope.allGlyphs[ char ].svg );
					}
				}

				$scope.$watch('puid', glyphHandler);
				$attrs.$observe('glyphContour', glyphHandler);
			}
		};
	});
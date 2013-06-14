'use strict';

angular.module('prototyp0.contourDirective', [])
	.directive('glyphContour', function( _ ) {
		return {
			restrict: 'EAC',
			controller: function( $scope, $element ) {
				$scope.$watch('processedGlyph', function( segments ) {
					if ( segments ) {
						var d = [];

						_( segments ).each(function( segment ) {
							if ( segment[0] !== '*' ) {
								d.push( segment.toString() );
							}
						});

						$element.attr( 'd', d.join(' ') );
					}
				});
			}
		};
	});
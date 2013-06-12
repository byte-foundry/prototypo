'use strict';

angular.module('prototyp0.contourDirective', [])
	.controller('glyphCtrl', function() {
		return function( $scope ) {
			$scope.glyph = '';
		};
	})
	.directive('myContourPath', function( _ ) {
		return function( scope, element ) {
			scope.$watch('glyph', function( segments ) {
				if ( segments ) {
					var d = [];

					_( segments ).each(function( segment ) {
						if ( segment[0] !== '*' ) {
							d.push( segment.toString() );
						}
					});

					element.attr( 'd', d.join(' ') );
				}
			});
		};
	});
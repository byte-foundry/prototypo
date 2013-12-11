'use strict';

angular.module('prototypo.glyphlistDirective', [])
	.directive('glyphlist', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/glyphlist.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				
				$element.on('mousedown', 'li', function( e ) {
					$scope.appValues.glyphName = $( this ).data( 'id' );
					$scope.$apply();
				});

			}

		};
	});
'use strict';

angular.module('prototypo.glyphlistDirective', [])
	.directive('glyphlist', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/glyphlist.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				$element.on('pointerdown', 'li', function() {
					$scope.appValues.viewMode = 'single';
					$scope.appValues.singleChar = $( this ).data( 'id' );
					$scope.$apply();
				});

				$element.on('pointerdown', '.fixGlyphList', function() {
					$('.glyphlist').toggleClass('fix');
				});
			}

		};
	});
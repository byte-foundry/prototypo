'use strict';

angular.module('prototypo.menuDirective', [])
	.directive('menu', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/menu.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				
				$element.on('mousedown', '.btn', function() {
					$('.menu ul').slideToggle('fast');
				});
				
			}

		};
	});
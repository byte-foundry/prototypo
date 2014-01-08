'use strict';

angular.module('prototypo.singleDirective', [])
	.directive('single', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/single.html',
			replace: true,
			link: function( $scope, $element ) {
				$element.on('wheel', function( e ) {
					$scope.zoom( e.originalEvent.deltaY );
					return false;
				});

				// override 'display: none !important' set by .ng-hide
				$element[0].style.setProperty('display', 'block', 'important');

				// <svg> is totally unable to handle % dimensions
				$element
					.find('svg')
					.attr({
						width: $element[0].offsetWidth,
						height: $element[0].offsetHeight
					})
					.addClass('active')
					.css('display', 'block');

				$element[0].style.setProperty('display', '');
			}
		};
	});
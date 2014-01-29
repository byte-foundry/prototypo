'use strict';

angular.module('prototypo.presetsDirective', [])
	.directive('presets', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/presets.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var wrapper = $element[0].querySelector('div');

				$element[0].style.setProperty('display', 'block', 'important');

				// <svg> is totally unable to handle % dimensions
				$element
					.find('svg')
					.attr({
						width: wrapper.offsetWidth,
						height: wrapper.offsetHeight
					})
					.addClass('active')
					.css('display', 'block');

				$element[0].style.setProperty('display', '');
			}
		};
	});
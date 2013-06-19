'use strict';

angular.module('prototyp0.mySliderDirective', [])
	.directive('myslider', function factory() {
		return {
			priority: 0,
			template: '<div class="slider"><div class="handle"></div></div>',
			// templateUrl: 'directive.html',
			replace: true,
			transclude: false,
			restrict: 'E',
			scope: false,
			controller: function($scope, $element, $attrs, $transclude) {

			},
			/*compile: function compile(tElement, tAttrs, transclude) {
			  return {
				pre: function preLink(scope, iElement, iAttrs, controller) { ... },
				post: function postLink(scope, iElement, iAttrs, controller) { ... }
			  }
			},*/
			link: function postLink(scope, iElement, iAttrs) {

				iElement.children().css( 'left', Math.random() * 100 + 'px');

				iElement.bind( 'click', function() {

				});
			}
		};
	});

'use strict';

angular.module('prototyp0.prettySliderDirective', [])
	.directive('slider', function factory() {
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
			link: function postLink($scope, $element, $attrs) {

				var $handle = $element.children();
				$handle.css( 'left', Math.random() * 100 + 'px');

				console.log($element);

				$element.bind( 'click', function() {

				});

				$scope.$watch('controlValues[control.name]', function(value) {
					var range = $element[0].offsetWidth - $handle[0].offsetWidth;
					var fraction = value / ( $scope.control.max - $scope.control.min );

					$handle.css( 'left', Math.round( range * fraction ) + 'px');
				});
			}
		};
	});

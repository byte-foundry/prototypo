'use strict';

angular.module('prototypo.stringDirective', [])
	.directive('string', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/string.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var translations = [0],
					wrapper = $element[0].querySelector('div');

				$scope.getTranslate = function( $index, char ) {
					// TODO: we shouldn't need this check
					if ( $scope.allGlyphs[char] ) {
						translations[$index +1] =
							$scope.allGlyphs[char].left +
							$scope.allGlyphs[char].width +
							translations[$index];

						return Math.round(
							$scope.allGlyphs[char].left +
							translations[$index]
						);
					}

					return 0;
				};

				// override 'display: none !important' set by .ng-hide
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
'use strict';

angular.module('prototypo.stringDirective', [])
	.directive('string', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/string.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var translate = 0,
					wrapper = $element[0].querySelector('div');

				$scope.getTranslate = function( $index, char ) {
					// reset the translation before the first letter
					if ( $index === 0 ) {
						translate = 0;
					}

					// TODO: we shouldn't need this check
					if ( $scope.allGlyphs[char] ) {
						var curr = $scope.allGlyphs[char].left + translate;

						translate += $scope.allGlyphs[char].left + $scope.allGlyphs[char].width;
						return Math.round( curr );
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
'use strict';

angular.module('prototypo.previewDirective', [])
	.directive('preview', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/preview.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var translate = 0,
					wrapper = $element[0].querySelector('div');

				$scope.getTranslate = function( $index, char ) {
					// reset the translation before the first letter
					if ( $index === 0 ) {
						translate = 0;
					}

					var curr = $scope.allGlyphs[char].left + translate;

					translate += $scope.allGlyphs[char].left + $scope.allGlyphs[char].width;
					return Math.round( curr );
				};

				// <svg> is totally unable to handle % dimensions
				$element.find('svg')
					.attr({
						width: wrapper.offsetWidth,
						height: wrapper.offsetHeight
					})
					.css({ display: 'block' });
			}
		};
	});
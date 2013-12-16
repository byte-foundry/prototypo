'use strict';

angular.module('prototypo.paramtabDirective', [])
	.directive('paramtab', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/paramtab.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var stopWatching;

				stopWatching = $scope.$watch('typeface.parameters', function( parameters ) {
					if ( !parameters || !parameters.length ) {
						return;
					}

					var parentHeight = $element[0].parentNode.offsetHeight,
						selfHeight = $element[0].offsetHeight;

					if ( selfHeight > parentHeight ) {
						$element
							.addClass('toobig content-below')
							.data({ scroll: 0 });

					}

					$element.addClass('initialized');
					// we shouldn't need to watch longer than that
					stopWatching();
				});
			}
		};
	});
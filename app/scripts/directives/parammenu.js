'use strict';

angular.module('prototypo.parammenuDirective', [])
	.directive('parammenu', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/parammenu.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				// tab selection
				$element.on('click', 'li', function() {
					$scope.appValues.paramTab = +$(this).data('index');
					$scope.$digest();

					// workaround IE bug
					$('.paramtabs-cell')
						.css('overflow', 'visible')
						.css('height');
					$('.paramtabs-cell')
						.css('overflow', '');
				});
			}
		};
	});
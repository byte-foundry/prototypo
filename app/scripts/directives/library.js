'use strict';

angular.module('prototypo.libraryDirective', [])
	.directive('library', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/library.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				// Display User name
				$('#userName').append(hoodie.account.username);

				// Back to current typeface
				var href = '#/' 
					+ $scope.appValues.fontName + '/'
					+ $scope.appValues.variant + '/'
					+ $scope.appValues.version + '/';
				$('#back').attr('href', href);
console.log(href);
				
			}
		};
	});
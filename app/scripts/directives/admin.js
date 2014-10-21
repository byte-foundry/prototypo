'use strict';

angular.module('prototypo.adminDirective', [])
	.directive('admin', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/admin.html',
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
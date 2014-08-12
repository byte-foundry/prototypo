'use strict';

angular.module('prototypo.userPanelDirective', [])
	.directive('userPanel', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/user-panel.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				var mail = hoodie.account.username;
				$('.mail').html(mail);

				// hoodie.account.changeUsername('currentpassword', 'newusername');




			}
		};
	});
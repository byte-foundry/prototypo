'use strict';

angular.module('prototypo.useradminDirective', [])
	.directive('useradmin', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/userAdmin.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				// Display User name
				$('#userName').append(hoodie.account.username);	

				// Password	
				$scope.changePasswordForm = function() {
					console.log($scope.password);
					// currentpassword has no effect
					hoodie.account.changePassword('currentpassword', $scope.password);
					$scope.showSucess = true;
				}

				$scope.$watch('password + confirm', function() {
					$scope.match = false;
					$scope.changePassword.$setValidity('dontmatch', $scope.password === $scope.confirm);
					
					if ( $scope.changePassword.$invalid ) {
						if ( $scope.confirm && $scope.confirm.length >= 6 ) $scope.showErrors = true;
						$scope.match = false;
						return;
					}
					else {
						$scope.match = true;
						$scope.showErrors = false;
					}
				});

				

			}
		};
	});
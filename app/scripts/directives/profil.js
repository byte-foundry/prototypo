'use strict';

angular.module('prototypo.profilDirective', [])
	.directive('profil', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/admin/profil.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				// Password	
				$scope.changePasswordForm = function() {
					console.log($scope.password);
					// TODO: currentpassword has no effect
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
'use strict';

angular.module('prototypo.signupDirective', [])
	.directive('signup', function( hoodie, $location ) {
		return {
			restrict: 'E',
			templateUrl: 'views/signup.html',
			replace: true,
			scope: {},
			link: {
				pre: function preLink( $scope ) {
					if ( window.sessionStorage.appkey ) {
						$scope.key = window.sessionStorage.appkey;
					}
				},
				post: function postLink( $scope ) {
					$scope.$watch('password + confirm', function() {
						$scope.signup.confirm.$setValidity('dontmatch', $scope.password === $scope.confirm);
					});

					$scope.$watch('email', function() {
						$scope.signup.email.$setValidity('alreadyregistered', true);
					});

					$scope.signUp = function() {
						if ( $scope.signup.$invalid ) {
							$scope.showErrors = true;
							return;
						}

						hoodie.account.signUp($scope.email, $scope.password)
							.done(function() {
								hoodie.store.add('appkey', $scope.key);
								$location.url('/');
								$scope.$apply();
							})
							.fail(function() {
								$scope.showErrors = true;
								$scope.signup.email.$setValidity('alreadyregistered', false);

								// sometimes the fail callback is called synchronously
								if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
									$scope.$apply();
								}
							});
					};
				}
			}
		};
	});
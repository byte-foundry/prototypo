'use strict';

angular.module('prototypo.registerDirective', [])
	.directive('register', function( hoodie, $location ) {
		return {
			restrict: 'E',
			templateUrl: 'views/register.html',
			replace: true,
			scope: {},
			link: {
				pre: function preLink( $scope ) {
					if ( window.sessionStorage.appkey ) {
						$scope.key = window.sessionStorage.appkey;
						delete window.sessionStorage.appkey;
					}
				},
				post: function postLink( $scope/*, $element*/ ) {
					$scope.$watch('password + confirm', function() {
						$scope.signup.confirm.$setValidity('dontmatch', $scope.password === $scope.confirm);
					});

					$scope.$watch('email', function() {
						$scope.signup.email.$setValidity('alreadyregistered', true);
					});

					$scope.$watch('email + password', function() {
						$scope.notifyurl =
							'http://prototypo-keygen.azurewebsites.net/?' + [
								'email=' + encodeURIComponent( $scope.email ),
								'password=' + encodeURIComponent( $scope.password ),
								'baseurl=' + encodeURIComponent( hoodie.baseUrl )
							].join('&');
					});

					/*$element.on('submit', function() {
						if ( $scope.signup.$invalid ) {
							$scope.showErrors = true;
							return false;
						}
					});*/

					$scope.signUp = function() {
						if ( $scope.signup.$invalid ) {
							$scope.showErrors = true;
							return false;
						}

						hoodie.account.signUp($scope.email, $scope.password)
							.done(function() {
								// the user registered with an app key
								if ( window.sessionStorage.appkey ) {
									hoodie.store.add('appkey', {id: 0, value: $scope.key});
								}

								$location.url('/');
								$scope.$apply();

							})
							.fail(function( err ) {
								$scope.showErrors = true;

								if ( err.status === 409 ) {
									$scope.signup.email.$setValidity('alreadyregistered', false);
								} else {
									$scope.signup.$setValidity('unexpected', false);
								}

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
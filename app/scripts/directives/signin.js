'use strict';

angular.module('prototypo.signinDirective', [])
	.directive('signin', function( hoodie, $location ) {
		return {
			restrict: 'E',
			templateUrl: 'views/signin.html',
			replace: true,
			scope: {},
			link: {
				post: function postLink( $scope ) {
					$scope.signIn = function() {
						if ( $scope.signin.$invalid ) {
							$scope.showErrors = true;
							return;
						}

						hoodie.account.signIn($scope.email, $scope.password)
							.done(function() {
								$location.url($location.search().next || '/');
								$scope.$apply();
							})
							.fail(function(e) {
								console.log(e);
								$scope.showErrors = true;
								$scope.signin.$setValidity('dontmatch', false);

								// sometimes the fail callback is called synchronously
								if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
									$scope.$apply();
								}
							});
					};

					$scope.$watch('email + password', function() {
						$scope.signin.$setValidity('dontmatch', true);
					});
				}
			}
		};
	});
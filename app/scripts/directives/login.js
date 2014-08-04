'use strict';

angular.module('prototypo.loginDirective', [])
	.directive('login', function( hoodie, $location ) {
		return {
			restrict: 'E',
			templateUrl: 'views/login.html',
			replace: true,
			scope: {},
			link: {

				post: function postLink( $scope, $element ) {

					$element.on('pointerdown', '#resetPassword', function() {
						var resetPassword = confirm("At Prototypo, we love use sides open-source projects.\n\nTo manage synchronisation and login, we use hoodie, a great solution for [insert description here] and they make all their best to improve their library, as the \"reset my password option\" for example : )\n\nFor the moment, we do it manually, so click 'OK' to ask us");
						if (resetPassword == true) {
						    var link = "mailto:support@prototypo.io"
						    	+ "?subject=Prototypo | Reset my password"
						    	+ "&body=Oh no : (%0D%0A%0D%0AI do not remember my password… Can you reset my account guys? %0D%0AThe email I used to register is [ Yes, it's your turn to write ] %0D%0A%0D%0A You rock guys, Thank you!"
						    ;

					    window.location.href = link;
						}
					});

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
							.fail(function() {
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
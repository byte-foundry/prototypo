'use strict';

angular.module('prototypoApp', [
		'ngRoute',
		'pasvaz.bindonce',
		'angular.hoodie',

		'prototypo.Utils',
		'prototypo.2D',
		'prototypo.Point',
		'prototypo.Segment',
		'prototypo.Formula',
		'prototypo.Component',
		'prototypo.Glyph',
		'prototypo.Font',

		'prototypo.Typeface',
		'prototypo.Values',

		'prototypo.glyphDirective',
		'prototypo.contourDirective',
		'prototypo.parammenuDirective',
		'prototypo.paramtabsDirective',
		'prototypo.paramtabDirective',
		'prototypo.singleDirective',
		'prototypo.stringDirective',
		'prototypo.glyphlistDirective',
		'prototypo.sceneButtonsDirective',
		'prototypo.menuDirective',
		'prototypo.spacingDirective',
		'prototypo.presetsDirective',
		'prototypo.contextMenuDirective',
		'prototypo.contextMenuStringDirective',
		'prototypo.splashDirective',
		'prototypo.signupDirective',
		'prototypo.signinDirective'
	])

	.config(function( $routeProvider, hoodieProvider ) {
		$routeProvider
			.when('/', {
				redirectTo: '/typeface/default/font/default'
			})
			.when('/login', {
				templateUrl: 'views/splash-login.html',
				controller: function() {}
			})
			.when('/typeface/:typeface/font/:font', {
				templateUrl: 'views/layout.html',
				controller: 'MainCtrl'
			})
			.otherwise({
				redirectTo: '/typeface/default/font/default'
			});

		hoodieProvider.config('http://prototypo.cloudapp.net:6004');
	})

	.run(function( $rootScope, $location ) {
		// always redirect to login when not logged in
		$rootScope.$on('$locationChangeStart', function(event, next) {
			// detect Paypal donations
			var auth = $location.search().auth;
			if ( auth ) {
				// store it for later use
				window.sessionStorage.appkey = auth;
				// clear query params
				return $location.path('/login').search({});
			}

			// dont redirect if already logged-in or already heading to login
			if ( !window.hoodie.account.hasAccount() && !/^\/login/.test(next.split('#')[1]) ) {
				return $location
					.path('/login')
					// remember next path
					.search({next: next.split('#')[1] || '/'});
			}

			// prevent access to login when users have a valid session
			if ( window.hoodie.account.hasAccount() && /^\/login/.test(next.split('#')[1]) ) {
				return $location.url($location.search().next || '/');
			}
		});
	});

	// All filters have moved to Formula.js
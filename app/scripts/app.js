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
		// detect Paypal donations
		var auth = window.location.search.match(/(&|\?)auth=(.*?)(\?|$)/);
		if ( auth && auth[2] ) {
			// store it for later use
			window.sessionStorage.appkey = auth[2];
			// clear query params
			window.history.pushState({auth: auth[2]}, '', '/');
		}

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

		hoodieProvider.config('http://127.0.0.1:6004/');
	})

	.run(function( $rootScope, $location ) {
		// always redirect to login when not logged in
		$rootScope.$on('$locationChangeStart', function(event, next) {
			// dont redirect if already logged-in or already heading to login
			if ( !window.hoodie.account.hasAccount() && !/^\/login/.test(next.split('#')[1]) ) {
				$location
					.path('/login')
					// remember next path
					.search({next: next.split('#')[1]});
			}

			// prevent access to login when users have a valid session
			if ( window.hoodie.account.hasAccount() && /^\/login/.test(next.split('#')[1]) ) {
				$location.url($location.search().next || '/');
			}
		});
	});

	// All filters have moved to Formula.js
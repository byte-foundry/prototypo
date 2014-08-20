'use strict';

angular.module('prototypoApp', [
		'ngRoute',
		'pasvaz.bindonce',
		'angular.hoodie',
		'prototypo.History',

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
		'prototypo.signinDirective',
		'prototypo.trackingDirective',
		'prototypo.fontVersionsDirective'
	])

	.config(function( $routeProvider, hoodieProvider ) {
		$routeProvider
			.when('/', {
				redirectTo: '/default/regular/0'
			})
			.when('/login', {
				templateUrl: 'views/splash-login.html',
				controller: function() {}
			})
			.when('/:typeface/:variant/:version', {
				templateUrl: 'views/layout.html',
				controller: 'MainCtrl'
			})
			.when('/outdated', {
				templateUrl: 'views/splash-outdated-browser.html',
				controller: function() {}
			})
			.otherwise({
				redirectTo: '/default/regular/0'
			});

		hoodieProvider.config('http://prototypo.cloudapp.net');
	})

	.run(function( $rootScope, $location, hoodie ) {

		// check server connection
		hoodie.checkConnection().fail(function(){
			if ( !hoodie.account.hasAccount() ) $('#serverDown').show();
		});

		if ( hoodie.account.hasAccount() ) {
			// identify user for UserVoice when logged-in
			window.UserVoice.push(['identify', {email: hoodie.account.username}]);
		}

		// always redirect to login when not logged in
		$rootScope.$on('$locationChangeStart', function(event, next) {
			var search = $location.search();

			// detect appkey
			if ( search.auth ) {
				// store it for later use
				window.sessionStorage.appkey = search.auth;
				// clear query params
				return $location.path('/login').search({});
			}

			// dont redirect if already logged-in or already heading to login
			if ( !hoodie.account.hasAccount() && !/^\/login/.test(next.split('#')[1]) ) {
				return $location
					.path('/login')
					// remember next path
					.search({next: next.split('#')[1] || '/'});
			}

			// prevent access to login when users have a valid session
			if ( hoodie.account.hasAccount() && /^\/login/.test(next.split('#')[1]) ) {
				return $location.url($location.search().next || '/');
			}

			// detect incompatible browsers
			if ( 
				(jQuery.browser.chrome && parseFloat( jQuery.browser.version ) < 30) ||
				(jQuery.browser.mozilla && parseFloat( jQuery.browser.version ) < 25) ||
				(jQuery.browser.msie && parseFloat( jQuery.browser.version ) < 11) ||
				(jQuery.browser.safari && parseFloat( jQuery.browser.version ) < 536) 
			) {
				console.log("ERROR — incompatible browser: ", jQuery.browser );
				return $location
					.path('/outdated')
			}
		});
	});

	// All filters have moved to Formula.js
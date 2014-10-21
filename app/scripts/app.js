'use strict';

angular.module('prototypoApp', [
		'ui.router',
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
		'prototypo.registerDirective',
		'prototypo.loginDirective',
		'prototypo.trackingDirective',
		'prototypo.adminDirective',
		'prototypo.profilDirective',
		'prototypo.communityDirective',
		'prototypo.projectsDirective',
		'prototypo.newprojectDirective'
	])

	.config(function( $stateProvider, $urlRouterProvider, hoodieProvider ) {
		$urlRouterProvider.otherwise('/default/regular/0');
		$stateProvider
			.state('index', {
				url: '/{typeface:.*}/{font:.*}/{version:.*}',
				templateUrl: 'views/layout.html',
				controller: 'MainCtrl'
			})
			.state('register', {
				url: '/register',
				template: '<register></register>'
			})
			.state('login', {
				url: '/login',
				template: '<login></login>'
			})
			.state('newproject', {
				url: '/new',
				template: '<newproject></newproject>'
			})
			.state('admin', {
				url: '/admin',
				template: '<admin></admin>'
			})
			.state('admin.profil', {
				url: '/profil',
				template: '<profil></profil>'
			})
			.state('admin.projects', {
				url: '/projects',
				template: '<projects></projects>',
				controller: function($scope) {
					$scope.active = undefined;
				}
			})
			.state('admin.community', {
				url: '/community',
				template: '<community></community>'
			})
			.state('admin.documentation', {
				url: '/documentation',
				templateUrl: 'views/admin/documentation.html',
				controller: function($scope) {
					$scope.items = ['A', 'List', 'Of', 'Items'];
				}
			})
			.state('admin.help', {
				url: '/help',
				templateUrl: 'views/admin/help.html',
				controller: function($scope) {
					$scope.items = ['A', 'List', 'Of', 'Items'];
				}
			})
			.state('active', {
				url: '/typeface/{typeface:.*}/font/{font:.*}',
				templateUrl: 'views/layout.html',
				controller: 'MainCtrl'
			})
			.state('outdated', {
				url: '/outdated',
				templateUrl: 'views/splash-outdated-browser.html',
				controller: function() {}
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
				return $location.path('/register').search({});
			}

			// dont redirect if already logged-in or already heading to login
			if ( !hoodie.account.hasAccount() && !/^\/(register|login)/.test(next.split('#')[1]) ) {
				return $location
					.path('/register')
					// remember next path
					.search({next: next.split('#')[1] || '/'});
			}

			// prevent access to register or login when users have a valid session
			if ( hoodie.account.hasAccount() && /^\/(register|login)/.test(next.split('#')[1]) ) {
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
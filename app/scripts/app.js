'use strict';

angular.module('prototypoApp', [
		'ngRoute',
		'pasvaz.bindonce',

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
		'prototypo.splashDirective'
	])

	.config(function ( $routeProvider ) {
		$routeProvider
			.when('/typeface/:typeface/font/:font', {
				templateUrl: 'views/layout.html',
				controller: 'MainCtrl'
			})
			.otherwise({
				redirectTo: '/typeface/default/font/default'
			});
	});

	// All filters have moved to Formula.js
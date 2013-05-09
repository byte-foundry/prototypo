'use strict';

angular.module('prototyp0App', ['prototyp0.filters', 'prototyp0.glyphs', 'prototyp0.components'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .value( 'glyphs', [] )
  .value( 'components', [] );
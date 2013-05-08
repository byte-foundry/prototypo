'use strict';

angular.module('prototyp0App', ['prototyp0Filters'])
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
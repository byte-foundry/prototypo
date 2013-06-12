'use strict';

angular.module('prototyp0App', ['lodash', 'prototyp0.fontLoader', 'prototyp0.glyphFilters', 'prototyp0.glyphUtils', 'prototyp0.componentUtils', 'prototyp0.segmentUtils', 'prototyp0.glyphCache'])
  .config(function ( $routeProvider ) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
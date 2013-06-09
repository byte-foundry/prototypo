'use strict';

angular.module('prototyp0App', ['prototyp0.filters', 'prototyp0.caches', 'prototyp0.glyphs', 'prototyp0.sliders'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

  /*.run(function( $interpolate, glyphs, _ ) {
    // interpolate all glyphs
    _( glyphs ).each(function( glyph ) {
      glyph.interpolated = {};

      _( glyph.formula ).each(function( segment, i ) {
        glyph.interpolated[i] = $interpolate( segment );
      });
    });

  });*/
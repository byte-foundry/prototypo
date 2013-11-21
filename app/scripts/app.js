'use strict';

angular.module('prototypoApp', [
    'lodash',
    'ngRoute',
    'pasvaz.bindonce',

    'prototypo.Point',
    'prototypo.Segment',
    'prototypo.Formula',
    'prototypo.Component',
    'prototypo.Glyph',
    'prototypo.Font',

    'prototypo.fontLoader',
    'prototypo.valuesLoader',
    'prototypo.glyphFilters',
    //'prototypo.glyphUtils',
    //'prototypo.componentUtils',
    //'prototypo.segmentUtils',
    //'prototypo.glyphCache',

    'prototypo.glyphDirective',
    'prototypo.contourDirective',
    //'prototypo.endpointDirective',
    //'prototypo.prettySliderDirective',
    //'prototypo.controlpointDirective'
  ])

  .config(function ( $routeProvider ) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .filter( 'log', function () {
    return function( value, txt ) {
      value = Math.round( value * 100 ) / 100 ;
      console.log( txt + " : " + value );
      return value;
    }
  });
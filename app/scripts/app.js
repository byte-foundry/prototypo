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
    'prototypo.endpointDirective',
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
  })

  .filter( 'curve', function ( Point ) {
    return function ( coords, direction, start, roundness, correction ) {
      var end = Point(
        coords
      );
      switch (direction) {
      case "top-left" :
        var c1 = Point(
          end.x + ( end.x - start.x ) * roundness,
          0
          );
        var c2 = Point(
          0,
          start.y - ( end.y - start.y ) * roundness
          );
        break;
      case "top-right" :
        var c1 = Point(
          0,
          end.y - ( end.y - start.y ) * roundness
          );
        var c2 = Point(
          start.x - ( end.x - start.x ) * roundness,
          0
          );
        break;
      case "bottom-right" :
        var c1 = Point(
          end.x - ( end.x - start.x ) * roundness,
          0
          );
        var c2 = Point(
          0,
          start.y - ( start.y - end.y ) * roundness
          );
        break;
      case "bottom-left" :
        var c1 = Point(
          0,
          end.y + ( start.y - end.y ) * roundness
          );
        var c2 = Point(
          start.x - ( start.x - end.x ) * roundness,
          0
          );
        break;
      }
      return c1.toString() + ' ' + c2.toString() + ' ' + end.toString();
    }
  });
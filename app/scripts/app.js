'use strict';

angular.module('prototypoApp', [
		'ngRoute',
		'pasvaz.bindonce',

		'prototypo.Point',
		'prototypo.Segment',
		'prototypo.Formula',
		'prototypo.Component',
		'prototypo.Glyph',
		'prototypo.Font',

		'prototypo.Typeface',
		'prototypo.Values',
		'prototypo.glyphFilters',

		'prototypo.glyphDirective',
		'prototypo.contourDirective',
		'prototypo.endpointDirective'
	])

	.config(function ( $routeProvider ) {
		$routeProvider
			.when('/typeface/:typeface/font/:font', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl'
			})
			.otherwise({
				redirectTo: '/typeface/default/font/default'
			});
	})

	// all those filters belong in filters/formula.js
	.filter( 'log', function () {
		return function( value, txt ) {
			//value = Math.round( value * 100 ) / 100 ;
			console.log( txt + ' : ' + value );
			return value;
		};
	})

	.filter( 'between', function () {
		return function ( position, end, endDefault, start, startDefault ) {
			return start + ( end - start ) * ( position - startDefault) / ( endDefault - startDefault ) ;
			// example: {{ 250 |between:self[3].x:400:self[1].x:100 }}
		};
	})

	.filter( 'translateControl', function () {
		return function ( segment, index, angle ) {
			
			var coords = segment.split(' ');
			var delta = Math.sin( angle ) * coords[1];
			// console.log(angle, coords[1], delta, +coords[index] + delta);
			coords[index] = +coords[index] + delta * -1; // -1 ?
			
			coords[index + 2] = coords[index + 2] - delta;

			// coords[index + 4] = +coords[index + 4] + delta;

			return coords.join();
		}
	})

	.filter( 'control', function () {
		return function ( segment, index, angle, coefficient ) {
			
			var coords = segment.split(' ');
			coords[index] = +coords[index] + angle * coefficient;

			return coords.join();
		}
	})

	.filter( 'curve', function ( Point ) {
		return function ( coords, extrem, direction, start, roundness, correction ) {
			if( !correction ) {
				correction = 0;
			}

			var end = Point( coords ),
				c1,
				c2;

			switch (direction) {
			case 'top-left' :
				c1 = Point( ( end.x - start.x ) * roundness - correction * ( end.x - start.x ) * roundness , 0 );
				c2 = Point( - correction * ( end.x - start.x ) * roundness , ( start.y - end.y ) * roundness );
				if ( extrem === 'reverse' ) {
				c1 = Point( ( end.x - start.x ) * roundness - correction * ( end.x - start.x ) * roundness , 0 );
				c2 = Point( - correction * ( end.x - start.x ) * roundness , ( start.y - end.y ) * roundness );
				}
				break;
			case 'top-right' :
				c1 = Point( correction * ( end.y - start.y ) * roundness , ( end.y - start.y ) * roundness );
				c2 = Point( ( start.x - end.x ) * roundness + correction * ( start.x - end.x ) * roundness, 0 );
				if ( extrem === 'reverse' ) {
				c1 = Point( - correction * ( end.x - start.x ) * roundness, ( end.y - start.y ) * roundness );
				c2 = Point( ( start.x - end.x ) * roundness - correction * ( end.x - start.x ) * roundness, 0 );
				}
				break;
			case 'bottom-right' :
				c1 = Point( ( end.x - start.x ) * roundness - correction * ( end.x - start.x ) * roundness, 0 );
				c2 = Point( - correction * ( end.x - start.x ) * roundness, ( start.y - end.y ) * roundness );
				if ( extrem === 'reverse' ) {
				c1 = Point( ( end.x - start.x ) * roundness - correction * ( end.x - start.x ) * roundness, - correction * ( end.x - start.x ) * roundness );
				c2 = Point( 0, ( start.y - end.y ) * roundness - correction * ( end.x - start.x ) * roundness );
				}
				break;
			case 'bottom-left' :
				c1 = Point( correction * ( end.x - start.x ) * roundness , ( end.y - start.y ) * roundness );
				c2 = Point( ( start.x - end.x ) * roundness + correction * ( end.x - start.x ) * roundness, 0 );
				if ( extrem === 'reverse' ) {
				c1 = Point( 0 , ( end.y - start.y ) * roundness - correction * ( end.x - start.x ) * roundness );
				c2 = Point( ( start.x - end.x ) * roundness + correction * ( end.x - start.x ),  - correction * ( end.x - start.x ) * roundness );
				}
				break;
			}

			return c1.toString() + ' ' + c2.toString() + ' ' + end.toString();
		};
	});
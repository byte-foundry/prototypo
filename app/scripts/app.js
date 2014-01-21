'use strict';

angular.module('prototypoApp', [
		'ngRoute',
		'pasvaz.bindonce',

		'prototypo.2D',
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
		'prototypo.endpointDirective',
		'prototypo.parammenuDirective',
		'prototypo.paramtabsDirective',
		'prototypo.paramtabDirective',
		'prototypo.singleDirective',
		'prototypo.stringDirective',
		'prototypo.glyphlistDirective',
		'prototypo.zoomDirective',
		'prototypo.menuDirective',
		'prototypo.spacingDirective'
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
	})

	.filter( 'log', function () {
		return function( value, txt ) {
			//value = Math.round( value * 100 ) / 100 ;
			console.log( txt + ' : ' + value );
			return value;
		};
	})

	.filter( 'min', function ( Point )  {
		return function ( coords, ref, axis, correction ) {
			if( !correction ) correction = 0;
			if (ref === undefined) {
				return coords;
			}
			else {
				if (typeof coords === 'number') {
					coords = Math.max( coords, ref[axis] + correction );
					return coords;
				}
				else {
					var point = Point(coords);
					point[axis] = Math.max( point[axis], ref[axis] + correction );
					return point;
				}
			}
		};
	})

	.filter( 'max', function ( Point )  {
		return function ( coords, ref, axis ) {
			if (ref === undefined) {
				return coords;
			}
			else {
				if (typeof coords === 'number') {
					coords = Math.min( coords, ref[axis] );
					return coords;
				}
				else {
					var point = Point(coords);
					point[axis] = Math.min( point[axis], ref[axis] );
					return point;
				}
			}
		};
	})

	.filter( 'adjust', function ()  {
		return function ( coords, thickness, contrast ) {
			if( !contrast ) contrast = 1;
			coords = Math.max( coords, coords + (thickness - 80) * contrast    );
			return coords;
		};
	})

	.filter( 'between', function () {
		return function ( position, end, endDefault, start, startDefault ) {
			return start + ( end - start ) * ( position - startDefault) / ( endDefault - startDefault ) ;
			// example: {{ 250 |between:self[3].x:400:self[1].x:100 }}
		};
	})

	.filter( 'rotateControl', function () {
		return function ( segment, index, angle ) {

			var coords = segment.split(' ');
			var delta = Math.sin( angle ) * coords[1];
			// console.log(angle, coords[1], delta, +coords[index] + delta);
			coords[index] = +coords[index] + delta * -1; // -1 ?
			coords[index + 2] = coords[index + 2] - delta;

			// coords[index + 4] = +coords[index + 4] + delta;

			return coords.join();
		};
	})

	.filter( 'control', function () {
		return function ( segment, index, angle, coefficient ) {

			var coords = segment.split(' ');
			coords[index] = +coords[index] + angle * coefficient;

			return coords.join();
		};
	})

	// deprecated, use C+/C- commands instead
	.filter( 'curve', function ( Point ) {
		return function ( coords, extrem, direction, start, roundness, correction ) {
			if( !correction ) correction = 0;

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
				c1 = Point( ( end.x - start.x ) * roundness, 0 - correction / 2 );
				c2 = Point( 0, ( start.y - end.y ) * roundness - correction );
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
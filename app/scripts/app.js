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
	})

	.filter( 'log', function () {
		return function( value, txt ) {
			console.log( txt + ' :', value );
			return value;
		};
	})

	.filter( 'min', function ()  {
		return function ( val, ref ) {
			return Math.max(val, ref);
		};
	})

	.filter( 'xMin', function ( Point )  {
		return function ( _point, _ref ) {
			if ( _ref === undefined || _point === undefined ) {
				return _point;
			}
			var point = _point.x !== undefined ?
					_point:
					new Point( _point ),
				ref = typeof _ref === 'number' ?
					_ref:
					_ref.x;
			if ( point.x < ref ) {
				point.x = ref;
			}
			return point;
		};
	})

	.filter( 'yMin', function ( Point )  {
		return function ( _point, _ref ) {
			if ( _ref === undefined || _point === undefined ) {
				return _point;
			}

			var point = _point.x !== undefined ?
					_point:
					new Point( _point ),
				ref = typeof _ref === 'number' ?
					_ref:
					_ref.y;

			if ( point.y < ref ) {
				point.y = ref;
			}

			return point;
		};
	})

	.filter( 'max', function ()  {
		return function ( val, ref ) {
			return Math.min(val, ref);
		};
	})

	.filter( 'xMax', function ( Point )  {
		return function ( _point, _ref ) {
			if ( _ref === undefined || _point === undefined ) {
				return _point;
			}

			var point = _point.x !== undefined ?
					_point:
					new Point( _point ),
				ref = typeof _ref === 'number' ?
					_ref:
					_ref.x;

			if ( point.x > ref ) {
				point.x = ref;
			}

			return point;
		};
	})

	.filter( 'yMax', function ( Point )  {
		return function ( _point, _ref ) {
			if ( _ref === undefined || _point === undefined ) {
				return _point;
			}

			var point = _point.x !== undefined ?
					_point:
					new Point( _point ),
				ref = typeof _ref === 'number' ?
					_ref:
					_ref.y;

			if ( point.y > ref ) {
				point.y = ref;
			}

			return point;
		};
	})

	.filter( 'adjust', function ()  {
		return function ( coords, thickness, contrast ) {
			if( !contrast ) contrast = 1;
			coords = Math.max( coords, coords + (thickness - 80) * contrast );
			return coords;
		};
	})

	.filter( 'between', function () {
		return function ( position, end, endDefault, start, startDefault ) {
			return start + ( end - start ) * ( position - startDefault) / ( endDefault - startDefault ) ;
			// example: {{ 250 |between:self[3].x:400:self[1].x:100 }}
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
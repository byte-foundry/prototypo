'use strict';

angular.module('prototypo.Point', ['prototypo.2D'])
	.factory('Point', function() {
		function Point(x, y) {
			// new is optional
			if ( !( this instanceof Point ) ) {
				return new Point( x, y );
			}

			if ( x === undefined ) {
				this.coords = new Float32Array([x, y]);

			} else if ( x.constructor === Array || x.constructor === Float32Array ) {
				this.coords = new Float32Array(x);

			} else if ( x.x !== undefined || x.y !== undefined ) {
				this.coords = new Float32Array([x.x, x.y]);

			} else {
				this.coords = new Float32Array([x, y]);

			}
		}

		return Point;
	})

	.run(function( Point, translatePoint, pointOn, transformPoint ) {
		Point.prototype = {
			toString: function() {
				return ( isNaN( this.coords[0] ) ? 'NaN' : Math.round( this.coords[0] ) ) +
					' ' +
					( isNaN( this.coords[1] ) ? 'NaN' : Math.round( this.coords[1] ) );
			},
			// Angular uses only toJSON
			// keep in mind that JSON.stringify will return ""x y"" instead of "x y"
			toJSON: function() {
				return ( isNaN( this.coords[0] ) ? 'NaN' : Math.round( this.coords[0] ) ) +
					' ' +
					( isNaN( this.coords[1] ) ? 'NaN' : Math.round( this.coords[1] ) );
			},

			translate: function( x, y ) {
				return translatePoint( this, x, y );
			},
			translateX: function( x ) {
				this.coords[0] += x;
				return this;
			},
			translateY: function( y ) {
				this.coords[1] += y;
				return this;
			},

			on: function( args ) { return pointOn( this, args ); },

			transform: function( matrix ) {
				return transformPoint( this, matrix );
			}
		};

		// .x and .y are more convenient than [0] and [1]
		Object.defineProperty(Point.prototype, 'x', {
			get: function() { return this.coords[0]; },
			set: function( x ) { this.coords[0] = x; }
		});
		Object.defineProperty(Point.prototype, 'y', {
			get: function() { return this.coords[1]; },
			set: function( y ) { this.coords[1] = y; }
		});
	})

	.factory('translatePoint', function( Point ) {
		return function( point, x, y ) {
			var p = x instanceof Point ?
					x:
					new Point( x, y );

			if ( point && !isNaN( p.coords[0] ) ) {
				point.coords[0] += p.coords[0];
			}
			if ( point && !isNaN( p.coords[1] ) ) {
				point.coords[1] += p.coords[1];
			}
			return point;
		};
	})

	.filter('translate', function( translatePoint ) {
		return function( point, x, y ) {
			return translatePoint( point, x, y );
		};
	})


	.filter('translateY', function( translatePoint ) {
		return function( point, x, y ) {
			return translatePoint( point, x, y );
		};
	})

	.factory('pointOn', function( Point, lineLineIntersection ) {
		// this regexp is duplicated in Segment.js
		var rstraight = /[LVMH]/;

		return function( _point, args ) {
			var point = _point instanceof Point ?
					_point:
					new Point( _point ),
				origin,
				vector;

			// handle cases where args refers to undefined data
			if ( args === undefined || ( args.constructor === Array && ( args[0] === undefined || args[1] === undefined ) ) ) {
				return point;
			}

			// point on a segment
			if ( !isNaN( point.coords[0] ) || !isNaN( point.coords[1] ) ) {

				// point on a straight line
				if ( ( args.command !== undefined && rstraight.test(args.command) ) ||
					args.constructor === Array ) {
					// segment from two points
					if ( args.constructor === Array ) {
						origin = args[0];
						vector = [
							args[1].x - args[0].x,
							args[1].y - args[0].y
						];

					// Segment instance
					} else {
						origin = args.start;
						vector = [
							args.end.x - args.start.x,
							args.end.y - args.start.y
						];
					}

					return !isNaN(point.coords[0]) ?
						Point( point.coords[0], ( point.coords[0] - origin.x ) / vector[0] * vector[1] + origin.y ):
						Point( ( point.coords[1] - origin.y ) / vector[1] * vector[0] + origin.x, point.coords[1] );

				// point on a curve
				} else {

				}

			// intersection
			} else if ( args.constructor === Array && args.length === 2 ) {

				// line-line intersection
				if (
					( args[0].constructor === Array || rstraight.test(args[0].command) ) &&
					( args[1].constructor === Array || rstraight.test(args[1].command) )
				) {

					var p1 = args[0].constructor === Array ?
							( args[0][0] instanceof Point ?
								args[0][0]:
								new Point( args[0][0] ) ):
							args[0].start,
						p2 = args[0].constructor === Array ?
							( args[0][1] instanceof Point ?
								args[0][1]:
								new Point( args[0][1] ) ):
							args[0].end,
						p3 = args[1].constructor === Array ?
							( args[1][0] instanceof Point ?
								args[1][0]:
								new Point( args[1][0] ) ):
							args[1].start,
						p4 = args[1].constructor === Array ?
							( args[1][1] instanceof Point ?
								args[1][1]:
								new Point( args[1][1] ) ):
							args[1].end;

					return new Point( lineLineIntersection( p1, p2, p3, p4 ) );

				// curve-curve intersection
				} else if ( args[0].command === 'C' && args[1].command === 'C' ) {

				// line-curve or curve-line intersection
				} else {

				}

			}
		};
	})

	.filter('on', function( pointOn ) {
		return function( point, args ) {
			return pointOn( point, args );
		};
	})

	.factory('transformPoint', function() {
		return function( point, m ) {
			var coords0 = point.coords[0];

			if ( m.constructor === Float32Array ) {
				point.coords[0] = m[0] * coords0 + m[2] * point.coords[1] + m[4];
				point.coords[1] = m[1] * coords0 + m[3] * point.coords[1] + m[5];

			// a.constructor === SVGMatrix
			} else {
				point.coords[0] = m.a * coords0 + m.c * point.coords[1] + m.e;
				point.coords[1] = m.b * coords0 + m.d * point.coords[1] + m.f;
			}
		};
	})

	.filter('transform', function( Point, transformToMatrix2d, transformPoint ) {
		return function( _point, args ) {
			var point = _point instanceof Point ?
					_point:
					new Point( _point );

			transformPoint( point, transformToMatrix2d( args ) );
		};
	});
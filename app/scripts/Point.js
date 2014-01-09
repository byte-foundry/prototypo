'use strict';

angular.module('prototypo.Point', [])
	.factory('Point', function() {
		function Point(x, y) {
			// new is optional
			if ( !( this instanceof Point ) ) {
				return new Point( x, y );
			}

			this.coords = new Float32Array(2);

			if ( x === undefined ) {
				this.coords[0] = x;
				this.coords[1] = y;
			} else if ( x.constructor === Array ) {
				this.coords[0] = x[0];
				this.coords[1] = x[1];
			} else if ( x.x !== undefined || x.y !== undefined ) {
				this.coords[0] = x.x;
				this.coords[1] = x.y;
			} else {
				this.coords[0] = x;
				this.coords[1] = y;
			}
		}

		return Point;
	})

	.run(function( Point, translatePoint, pointOn ) {
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

			on: function( args ) { return pointOn( this, args ); }
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

	.factory('pointOn', function( Point ) {
		// this regexp is duplicated in Segment.js
		var rstraight = /[LVMH]/;

		return function( _point, args ) {
			var point = _point instanceof Point ?
					_point:
					new Point( _point ),
				origin,
				vector;

			// point on a segment
			if ( !isNaN( point.coords[0] ) || !isNaN( point.coords[1] ) ) {
				// handle cases where args refers to undefined data
				if ( args === undefined || ( args.constructor === Array && ( args[0] === undefined || args[1] === undefined ) ) ) {
					return point;
				}

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
			} else {

			}
		};
	})

	.filter('on', function( pointOn ) {
		return function( point, args ) {
			return pointOn( point, args );
		};
	});
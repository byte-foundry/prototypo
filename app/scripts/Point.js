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

		Point.prototype = {
			toString: function() {
				return ( isNaN( this.coords[0] ) ? '' : Math.round( this.coords[0] ) ) +
					' ' +
					( isNaN( this.coords[1] ) ? '' : Math.round( this.coords[1] ) );
			},
			// Angular uses only toJSON
			// keep in mind that JSON.stringify will return ""x y"" instead of "x y"
			toJSON: function() {
				return ( isNaN( this.coords[0] ) ? '' : Math.round( this.coords[0] ) ) +
					' ' +
					( isNaN( this.coords[1] ) ? '' : Math.round( this.coords[1] ) );
			},

			translate: function( x, y ) {
				this.coords[0] += x;
				this.coords[1] += y;
				return this;
			},
			translateX: function( x ) {
				this.coords[0] += x;
				return this;
			},
			translateY: function( y ) {
				this.coords[1] += y;
				return this;
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

		return Point;
	});
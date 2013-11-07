'use strict';

angular.module('prototypo.Point', [])
	.factory('Point', function() {
		function Point(x, y) {
			// new is optional
			if ( !( this instanceof Point ) ) {
				return new Point( x, y );
			}

			if ( x.constructor === Array ) {
				this.x = +x[0];
				this.y = +x[1];
			} else if ( x instanceof Point ) {
				this.x = x.x;
				this.y = x.y;
			} else {
				this.x = +x;
				this.y = +y;
			}
		}

		Point.prototype = {
			toString: function() {
				return this.x + ' ' + this.y;
			}
		};

		return Point;
	});
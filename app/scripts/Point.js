'use strict';

angular.module('prototypo.Point', [])
	.factory('Point', function() {
		function Point(x, y) {
			if ( x.constructor === Array ) {
				this.x = +x[0];
				this.y = +x[1];
			} else {
				this.x = +x;
				this.y = +y;
			}
		}

		Point.prototype.toString = function() {
			return this.x + ' ' + this.y;
		};

		return function( x, y ) {
			return new Point( x, y );
		};
	});
'use strict';

angular.module('prototypo.2D', [])
	// TODO: memoize this.
	.factory('transformToMatrix2d', function() {
		var toRadian = Math.PI * 2 / 360;

		return function( _transforms ) {
			var transforms = _transforms.split(')'),
				i = -1,
				length = transforms.length -1,
				split,
				transform,
				values,
				prev = new Float32Array(6),
				curr = new Float32Array(6),
				rslt = new Float32Array([1, 0, 0, 1, 0, 0]);

			while ( ++i < length ) {
				split = transforms[i].split('(');
				transform = split[0].trim();
				values = split[1].split(',');

				curr[0] = curr[3] = 1;
				curr[1] = curr[2] = curr[4] = curr[5] = 0;

				switch ( transform ) {
				case 'translateX':
					curr[4] = values[0];
					break;

				case 'translateY':
					curr[5] = values[0];
					break;

				case 'translate':
					curr[4] = values[0];
					curr[5] = values[1] || 0;
					break;

				case 'rotate':
					curr[0] = Math.cos( values[0] * toRadian );
					curr[1] = Math.sin( values[0] * toRadian );
					curr[2] = -curr[1];
					curr[3] = curr[0];
					break;

				case 'scaleX':
					curr[0] = values[0];
					break;

				case 'scaleY':
					curr[3] = values[0];
					break;

				case 'scale':
					curr[0] = values[0];
					curr[3] = values.length > 1 ? values[1] : values[0];
					break;

				case 'skewX':
					curr[2] = Math.tan( values[0] * toRadian );
					break;

				case 'skewY':
					curr[1] = Math.tan( values[0] * toRadian );
					break;

				case 'matrix':
					curr[0] = values[0];
					curr[1] = values[1];
					curr[2] = values[2];
					curr[3] = values[3];
					curr[4] = values[4];
					curr[5] = values[5];
					break;
				}

				prev[0] = rslt[0];
				prev[1] = rslt[1];
				prev[2] = rslt[2];
				prev[3] = rslt[3];
				prev[4] = rslt[4];
				prev[5] = rslt[5];

				// Matrix product (array in column-major order)
				// the "|| 0" are here to replace NaN values caused by 0 * Infinity
				// TODO: see if there is a better approach to fixing that problem
				// http://stackoverflow.com/questions/21094958/how-to-deal-with-infinity-in-a-2d-matrix
				rslt[0] = prev[0] * curr[0] + ( prev[2] * curr[1] || 0 );
				rslt[1] = prev[1] * curr[0] + ( prev[3] * curr[1] || 0 );
				rslt[2] = ( prev[0] * curr[2] || 0 ) + prev[2] * curr[3];
				rslt[3] = ( prev[1] * curr[2] || 0 ) + prev[3] * curr[3];
				rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
				rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];
			}

			return rslt;
		};
	})

	.factory('lineLineIntersection', function() {
		return function( p1, p2, p3, p4 ) {
			var x1 = p1.x,
				y1 = p1.y,
				x2 = p2.x,
				y2 = p2.y,
				x3 = p3.x,
				y3 = p3.y,
				x4 = p4.x,
				y4 = p4.y,
				d = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4);

			if ( d === 0 ) {
				return null;
			}

			return [
				( (x1*y2 - y1*x2) * (x3-x4) - (x1-x2) * (x3*y4 - y3*x4) ) / d,
				( (x1*y2 - y1*x2) * (y3-y4) - (y1-y2) * (x3*y4 - y3*x4) ) / d
			];
		};
	})

	/* the following functions are deprecated and aren't tested */

	.factory('Matrix2d', function( transformToMatrix2d ) {
		function Matrix2d( a, b, c, d, e, f ) {
			// new is optional
			if ( !( this instanceof Matrix2d ) ) {
				return new Matrix2d( a, b, c, d, e, f );
			}

			if ( a.constructor === Float32Array ) {
				this.m = a;
			} else if ( typeof a === 'string' ) {
				this.m = transformToMatrix2d( a );
			} else {
				new Float32Array( arguments );
			}
		}

		return Matrix2d;
	})

	.run(function( Matrix2d, matrix2dProduct ) {
		Matrix2d.prototype = {
			multiplyBy: function( matrix2d ) {
				var tmp = matrix2dProduct( this.m, matrix2d.m );

				this.m[0] = tmp[0];
				this.m[1] = tmp[1];
				this.m[2] = tmp[2];
				this.m[3] = tmp[3];
				this.m[4] = tmp[4];
				this.m[5] = tmp[5];
			}
		};
	})

	.factory('matrix2dProduct', function() {
		return function( m1, m2, tmp ) {
			if ( !tmp ) {
				tmp = new Float32Array(6);
			}

			// Matrix product (array in column-major order)
			tmp[0] = m1[0] * m2[0] + m1[2] * m2[1];
			tmp[1] = m1[1] * m2[0] + m1[3] * m2[1];
			tmp[2] = m1[0] * m2[2] + m1[2] * m2[3];
			tmp[3] = m1[1] * m2[2] + m1[3] * m2[3];
			tmp[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
			tmp[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];

			return tmp;
		};
	})

	.factory('matrix2dProducts', function( Matrix2d ) {
		return function( matrix1, matrix2, reuse ) {
			reuse = arguments[ arguments.length -1 ] === true;

			var result = reuse ?
					arguments[0].m :
					new Float32Array( arguments[0].m ),
				i = 1,
				length = arguments.length - ( reuse ? 1 : 0 ),
				tmp = new Float32Array(6),
				currMatrix;

			while ( i++ < length ) {
				currMatrix = arguments[i].m;

				// Matrix product (array in column-major order)
				tmp[0] = result[0] * currMatrix[0] + result[2] * currMatrix[1];
				tmp[1] = result[1] * currMatrix[0] + result[3] * currMatrix[1];
				tmp[2] = result[0] * currMatrix[2] + result[2] * currMatrix[3];
				tmp[3] = result[1] * currMatrix[2] + result[3] * currMatrix[3];
				tmp[4] = result[0] * currMatrix[4] + result[2] * currMatrix[5] + result[4];
				tmp[5] = result[1] * currMatrix[4] + result[3] * currMatrix[5] + result[5];

				result[0] = tmp[0];
				result[1] = tmp[1];
				result[2] = tmp[2];
				result[3] = tmp[3];
				result[4] = tmp[4];
				result[5] = tmp[5];
			}

			return reuse ?
				arguments[0] :
				new Matrix2d( result );
		};
	});
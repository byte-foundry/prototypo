'use strict';

angular.module('prototypo.2D', [])
	.factory('transformToMatrix2d', function( $cacheFactory ) {
		var toRadian = Math.PI * 2 / 360,
			cache = $cacheFactory('transformToMatrix2d', { capacity: 100 });

		return function( _transforms, origin ) {
			var cached;

			if ( origin ) {
				_transforms =
					' translate(' + origin.x + ',' + origin.y + ') ' +
					_transforms +
					' translate(' + (-origin.x) + ',' + (-origin.y) + ')';

			// it's
			} else if ( ( cached = cache.get( _transforms ) ) ) {
				return cached;
			}

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
					// stop parsing transform when encountering skewX(90)
					// see http://stackoverflow.com/questions/21094958/how-to-deal-with-infinity-in-a-2d-matrix
					if ( +values[0] === 90 || +values[0] === -90 ) {
						return rslt;
					}
					curr[2] = Math.tan( values[0] * toRadian );
					break;

				case 'skewY':
					if ( +values[0] === 90 || +values[0] === -90 ) {
						return rslt;
					}
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

				rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
				rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
				rslt[2] = ( prev[0] * curr[2] || 0 ) + prev[2] * curr[3];
				rslt[3] = ( prev[1] * curr[2] || 0 ) + prev[3] * curr[3];
				rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
				rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];
			}

			// it's pointless to cache the transforms that have an origin,
			// because the origin will most likely be different each time
			if ( !origin ) {
				cache.put( _transforms, rslt );
			}

			return rslt;
		};
	})

	.factory('pointOnCubicBezier', function( Point ) {
		return function( coords, from, segment ) {
			var start = segment.start,
				end = segment.end,
				c1 = segment.ctrl0,
				c2 = segment.ctrl1,
				tmp1 = Point(0,0),
				tmp2 = Point(0,0),
				tmp3 = Point(0,0),
				tmp4 = Point(0,0),
				tmp5 = Point(0,0),
				tmp6 = Point(0,0),
				t = from === 'start' ? 0 : 1,
				axis = coords.x !== undefined ? 'x' : 'y',
				ref = coords[axis],
				comparison =
					( from === 'start' && end[axis] > start[axis] ) ||
					( from === 'end' && end[axis] < start[axis] ) ?
						// tmp6[axis] > ref
						'>':
						// tmp6[axis] < ref
						'<';

			// reference and extremity are supperposed (speed up cases without serifs)
			// TODO: test that this condition is verified for and only for 'null dimensions' serifs
			if ( Math.abs( ref - segment[from][axis] ) < 1 ) {
				return [start, c1, c2, end];;
			}

			while ( (from === 'start' && t <= 1) || ( from === 'end' && t >= 0 ) ) {
				// third order
				tmp1.x = start.x + ( c1.x - start.x ) * t;
				tmp1.y = start.y + ( c1.y - start.y ) * t;
				tmp2.x = c1.x + ( c2.x - c1.x ) * t;
				tmp2.y = c1.y + ( c2.y - c1.y ) * t;
				tmp3.x = c2.x + ( end.x - c2.x ) * t;
				tmp3.y = c2.y + ( end.y - c2.y ) * t;
				// second order
				tmp4.x = tmp1.x + ( tmp2.x - tmp1.x ) * t;
				tmp4.y = tmp1.y + ( tmp2.y - tmp1.y ) * t;
				tmp5.x = tmp2.x + ( tmp3.x - tmp2.x ) * t;
				tmp5.y = tmp2.y + ( tmp3.y - tmp2.y ) * t;
				// first order
				tmp6.x = tmp4.x + ( tmp5.x - tmp4.x ) * t;
				tmp6.y = tmp4.y + ( tmp5.y - tmp4.y ) * t;

				if ( ( comparison === '>' && tmp6[axis] > ref ) || ( comparison === '<' && tmp6[axis] < ref ) ) {
					return from === 'start' ?
						[tmp6, tmp5, tmp3, end]:
						[start, tmp1, tmp4, tmp6];
				}

				t += 0.05 * ( from === 'start' ? 1 : -1 );
			}

			return [start, c1, c2, end];
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

			return new Float32Array([
				( (x1*y2 - y1*x2) * (x3-x4) - (x1-x2) * (x3*y4 - y3*x4) ) / d,
				( (x1*y2 - y1*x2) * (y3-y4) - (y1-y2) * (x3*y4 - y3*x4) ) / d
			]);
		};
	})

	.factory('curveLineIntersection', function() {
		return function() {};
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
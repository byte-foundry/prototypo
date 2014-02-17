'use strict';

angular.module('prototypo.Segment', ['prototypo.Point', 'prototypo.2D'])
	.factory('Segment', function( Point, parseUpdateSegment, absolutizeSegment, segmentToSVG, cutSegment, moveSegmentEnd, transformSegment, smoothSegment3, moveSegmentPointTo ) {
		function Segment( data, curPos, invert ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos, invert );
			}

			this.invert = invert;
			this.$render = {};

			parseUpdateSegment( this, data );

			this.absolutize( curPos || Point(0,0) );

			// this is a copy of the points that should be used when rendering the segment
			// this allows to have a representation of a component that isn't altered by its subcomponents,
			// and another representation (render) that is altered.
			this.$render.end = invert ? this.start : this.end;
			this.$render.start = invert ? this.end : this.start;

			if ( this.ctrl0 !== undefined ) {
				this.$render[ 'ctrl' + ( invert ? 1 : 0 ) ] = this.ctrl0;
			}
			if ( this.ctrl1 !== undefined ) {
				this.$render[ 'ctrl' + ( invert ? 0 : 1 ) ] = this.ctrl1;
			}
		}

		Segment.prototype = {
			update: function( data ) { parseUpdateSegment( this, data ); },
			absolutize: function( curPos ) { absolutizeSegment( this, curPos ); },
			toSVG: function() { return segmentToSVG( this ); },
			cut: function( from, to ) { return cutSegment( this, from, to ); },
			moveEnd: function( endPoint, newCoords ) { return moveSegmentEnd( this, endPoint, newCoords ); },
			transform: function( matrix ) { return transformSegment( this, matrix ); },
			smooth: function( render ) { return smoothSegment3( render ? this.$render : this, this.roundness ); },
			movePointTo: function( type, coords ) { return moveSegmentPointTo( this, type, coors ); }
		};

		// a segment has x and y properties that are copies of this.end.x and this.end.y
		Object.defineProperty(Segment.prototype, 'x', {
			get: function() { return this.end.x; }
		});
		Object.defineProperty(Segment.prototype, 'y', {
			get: function() { return this.end.y; }
		});
		// I thought this would prevent .next to be enumerated but it doesn't seem to work :-(
		Object.defineProperty(Segment.prototype, 'next', {
			writable: true,
			enumerable: false
		});
		Object.defineProperty(Segment.prototype, 'angle', {
			get: function() {
				return Math.atan2( this.end.x - this.start.x , this.start.y - this.end.y ) / Math.PI * 180;
			}
		});

		return Segment;
	})

	.factory('parseUpdateSegment', function( Point ) {
		var rnormalize = /[", \t]+/g;

		return function( segment, data ) {
			var tmp = data.replace(rnormalize, ' ').trim().split(' '),
				length = tmp.length;

			segment.command = tmp[0];

			switch ( tmp[0] ) {
			case 'h':
			case 'H':
				if ( segment.end === undefined ) {
					segment.end = Point( tmp[ length - 1 ], undefined );
				} else {
					segment.end.x = tmp[ length - 1 ];
				}
				break;
			case 'v':
			case 'V':
				if ( segment.end === undefined ) {
					segment.end = Point( undefined, tmp[ length - 1 ] );
				} else {
					segment.end.y = tmp[ length - 1 ];
				}
				break;
			case 'z':
			case 'Z':
				segment.end = undefined;
				break;
			case 'rq':
			case 'rQ':
			case 'rs':
			case 'rS':
				if ( segment.ctrl1 === undefined ) {
					segment.ctrl1 = Point( tmp[1], tmp[2] );
				} else {
					segment.ctrl1.x = tmp[1];
					segment.ctrl1.y = tmp[2];
				}

				// this code is duplicated below
				if ( segment.end === undefined ) {
					segment.end = Point( tmp[ length - 2 ], tmp[ length - 1 ] );
				} else {
					segment.end.x = tmp[ length - 2 ];
					segment.end.y = tmp[ length - 1 ];
				}

				break;
			case 'c+':
			case 'c-':
			case 'C+':
			case 'C-':
			case 'ch':
			case 'cv':
			case 'Ch':
			case 'Cv':
				segment.roundness = +tmp[1];

				if ( segment.ctrl0 === undefined && segment.ctrl1 === undefined ) {
					segment.ctrl0 = Point(0,0);
					segment.ctrl1 = Point(0,0);
				}

				// parse correction angles and negate them
				segment.corrections = tmp.slice(2,4).map(function(x, i) {
					if ( x === 'smooth' ) {
						segment[ 'ctrl' + i ].isSmooth = true;
						return 0;
					}
					return -x;
				});

				// duplicated code
				if ( segment.end === undefined ) {
					segment.end = Point( tmp[ length - 2 ], tmp[ length - 1 ] );
				} else {
					segment.end.x = tmp[ length - 2 ];
					segment.end.y = tmp[ length - 1 ];
				}

				break;
			default:
				if ( length > 3 ) {
					if ( segment.ctrl0 === undefined ) {
						segment.ctrl0 = Point( tmp[1], tmp[2] );
					} else {
						segment.ctrl0.x = tmp[1];
						segment.ctrl0.y = tmp[2];
					}
				}
				if ( length > 5 ) {
					if ( segment.ctrl1 === undefined ) {
						segment.ctrl1 = Point( tmp[3], tmp[4] );
					} else {
						segment.ctrl1.x = tmp[3];
						segment.ctrl1.y = tmp[4];
					}
				}

				// this code is duplicated above
				if ( segment.end === undefined ) {
					segment.end = Point( tmp[ length - 2 ], tmp[ length - 1 ] );
				} else {
					segment.end.x = tmp[ length - 2 ];
					segment.end.y = tmp[ length - 1 ];
				}

				break;
			}
		};
	})

	// make endpoint and control-points of the glyph absolute
	.factory('absolutizeSegment', function( Point, smoothSegment3 ) {
		return function( segment, curPos ) {
			if ( segment.start === undefined ) {
				segment.start = Point( curPos );
			} else {
				segment.start.x = curPos.x;
				segment.start.y = curPos.y;
			}

			switch ( segment.command ) {
			case 'h':
				curPos.x = segment.end.x += curPos.x;
				segment.end.y = curPos.y;
				break;
			case 'H':
				segment.end.y = curPos.y;
				break;
			case 'v':
				segment.end.x = curPos.x;
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'V':
				segment.end.x = curPos.x;
				break;
			case 'c':
				segment.ctrl0.x += curPos.x;
				segment.ctrl0.y += curPos.y;
				segment.ctrl1.x += curPos.x;
				segment.ctrl1.y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				segment.relativeControls = true;
				break;
			case 'q':
			case 's':
				segment.ctrl0.x += curPos.x;
				segment.ctrl0.y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				segment.relativeControls = true;
				break;
			case 'l':
			case 'm':
			case 't':
			case 'rq':
			case 'rc':
			case 'rs':
			case 'c+':
			case 'c-':
			case 'ch':
			case 'cv':
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'z':
			case 'Z':
				segment.end = segment.start;
				break;
			// absolute commands (M, L, C, Q, C+/-, ...) except Z, H & V
			default:
				curPos.x = segment.end.x;
				curPos.y = segment.end.y;
				break;
			}

			// uppercase command
			segment.command = segment.command.toUpperCase();

			// absolutize control-points relative to the ends of the segment
			if ( segment.command[0] === 'R' ) {
				if ( segment.command === 'RC' ) {
					segment.ctrl0.x += segment.start.x;
					segment.ctrl0.y += segment.start.y;
				}

				segment.ctrl1.x += segment.end.x;
				segment.ctrl1.y += segment.end.y;

				segment.command = segment.command[1];
				segment.relativeControls = true;
			}

			// cubic bezier angle
			if ( segment.command === 'C+' || segment.command === 'C-' ) {
				var dx = ( segment.end.x - segment.start.x ) * segment.roundness,
					dy = ( segment.end.y - segment.start.y ) * segment.roundness,
					c0length,
					c1length,
					angle0,
					angle1;

				if ( dx * dy === 0 ) {
					segment.ctrl0.x = segment.start.x;
					segment.ctrl0.y = segment.start.y;
					segment.ctrl1.x = segment.end.x;
					segment.ctrl1.y = segment.end.y;

				} else {
					if (
						( segment.command === 'C+' && ( dx * dy > 0 ) ) ||
						( segment.command === 'C-' && ( dx * dy < 0 ) )
					) {
						// Ch/Cv compat
						segment.isSmooth = 'CV';

						segment.ctrl0.x = segment.start.x;
						segment.ctrl0.y = segment.start.y + dy;
						c0length = Math.abs(dy);
						segment.ctrl1.x = segment.end.x - dx;
						segment.ctrl1.y = segment.end.y;
						c1length = Math.abs(dx);

					} else {
						// Ch/Cv compat
						segment.isSmooth = 'CH';

						segment.ctrl0.x = segment.start.x + dx;
						segment.ctrl0.y = segment.start.y;
						c0length = Math.abs(dx);
						segment.ctrl1.x = segment.end.x;
						segment.ctrl1.y = segment.end.y - dy;
						c1length = Math.abs(dy);
					}

					if ( segment.corrections[0] ) {
						angle0 =
							Math.atan2( segment.ctrl0.y - segment.start.y, segment.ctrl0.x - segment.start.x ) +
							segment.corrections[0] / 180 * Math.PI;
						segment.ctrl0.x = segment.start.x + Math.cos( angle0 ) * c0length;
						segment.ctrl0.y = segment.start.y + Math.sin( angle0 ) * c0length;
					}
					if ( segment.corrections[1] ) {
						angle1 =
							Math.atan2( segment.ctrl1.y - segment.end.y, segment.ctrl1.x - segment.end.x ) +
							segment.corrections[1] / 180 * Math.PI;
						segment.ctrl1.x = segment.end.x + Math.cos( angle1 ) * c1length;
						segment.ctrl1.y = segment.end.y + Math.sin( angle1 ) * c1length;
					}

					// these adjustments are necessary to make the curve pretty
					// at roundness === 1, control points should be aligned
					if ( segment.corrections[0] || segment.corrections[1] ) {
						smoothSegment3( segment, segment.roundness );
					}
				}

				segment.command = 'C';
				segment.relativeControls = true;
			}

			// cubic bezier angle v2
			if ( segment.command === 'CH' || segment.command === 'CV' ) {
				// TODO: we might be able to speed up cases where there are no serifs or no roundness
				var dx = ( segment.end.x - segment.start.x ) * segment.roundness,
					dy = ( segment.end.y - segment.start.y ) * segment.roundness,
					c0length,
					c1length,
					angle0,
					angle1;

				segment.isSmooth = segment.command;

				if ( segment.command === 'CV' ) {
					segment.ctrl0.x = segment.start.x;
					segment.ctrl0.y = segment.start.y + dy;
					c0length = Math.abs(dy);
					segment.ctrl1.x = segment.end.x - dx;
					segment.ctrl1.y = segment.end.y;
					c1length = Math.abs(dx);

				} else {
					segment.ctrl0.x = segment.start.x + dx;
					segment.ctrl0.y = segment.start.y;
					c0length = Math.abs(dx);
					segment.ctrl1.x = segment.end.x;
					segment.ctrl1.y = segment.end.y - dy;
					c1length = Math.abs(dy);
				}

				if ( segment.corrections[0] ) {
					angle0 =
						Math.atan2( segment.ctrl0.y - segment.start.y, segment.ctrl0.x - segment.start.x ) +
						segment.corrections[0] / 180 * Math.PI;
					segment.ctrl0.x = segment.start.x + Math.cos( angle0 ) * c0length;
					segment.ctrl0.y = segment.start.y + Math.sin( angle0 ) * c0length;
				}
				if ( segment.corrections[1] ) {
					angle1 =
						Math.atan2( segment.ctrl1.y - segment.start.y, segment.ctrl1.x - segment.start.x ) +
						segment.corrections[1] / 180 * Math.PI;
					segment.ctrl1.x = segment.end.x + Math.cos( angle1 ) * c1length;
					segment.ctrl1.y = segment.end.y + Math.sin( angle1 ) * c1length;
				}

				// when control angles are adjusted, curve need to be smoothed
				if ( segment.corrections[0] || segment.corrections[1] ) {
					smoothSegment3( segment, segment.roundness );
				}

				segment.command = 'C';
				segment.relativeControls = true;
			}
		};
	})

	// cut a segment given an x or y coordinate and move the segment end accordingly
	.factory('cutSegment', function( Point, moveSegmentEnd, pointOnCubicBezier ) {
		// this regexp is duplicated in Point.js
		var rstraight = /[LVMH]/;

		return function( segment, from, _to ) {

			// straight line
			if ( rstraight.test(segment.command) ) {
				var dx = segment.end.x - segment.start.x,
					dy = segment.end.y - segment.start.y;

				moveSegmentEnd(	segment, _to, !isNaN(from.x) ?
					Point( from.x, ( from.x - segment.start.x ) / dx * dy + segment.start.y ) :
					Point( ( from.y - segment.start.y ) / dy * dx + segment.start.x, from.y )
				);

			// curve
			} else {
				var points = pointOnCubicBezier( from, _to, segment );

				segment.$render.start.x = points[0].x;
				segment.$render.start.y = points[0].y;
				segment.$render.ctrl0.x = points[1].x;
				segment.$render.ctrl0.y = points[1].y;
				segment.$render.ctrl1.x = points[2].x;
				segment.$render.ctrl1.y = points[2].y;
				segment.$render.end.x = points[3].x;
				segment.$render.end.y = points[3].y;
			}

			return segment;
		};
	})

	// moves one endpoint of the segment and the attached control-points
	// the only way to prevent control-points from moving is to use C, Q and S
	.factory('moveSegmentEnd', function( Point ) {
		return function( segment, _endPoint, _newCoords ) {
			var render = segment.$render,
				newCoords = _newCoords instanceof Point ?
					_newCoords:
					Point( _newCoords ),
				// only accept 'start' or 'end' values
				endPoint = render[ segment.invert ? ( _endPoint === 'start' ? 'end' : 'start' ) : _endPoint ],
				dx,
				dy;

			if ( segment.relativeControls ) {
				dx = newCoords.coords[0] - endPoint.coords[0];
				dy = newCoords.coords[1] - endPoint.coords[1];

				if ( _endPoint === 'end' && render.ctrl1 !== undefined ) {
					render.ctrl1.coords[0] += dx;
					render.ctrl1.coords[1] += dy;
				}
				if ( _endPoint === 'start' && render.ctrl0 !== undefined ) {
					render.ctrl0.coords[0] += dx;
					render.ctrl0.coords[1] += dy;
				}
			}

			endPoint.coords[0] = newCoords.coords[0];
			endPoint.coords[1] = newCoords.coords[1];

		};
	})

	// useless!!?? (apparently segmentToSVG does late segment inversion, which is good)
	// we could use it again to invert the points once and for all in $render
	// but wen should it be invoked?
	// => not a good idea, moveSegmentEnd works on the $render object but shouldn't care
	// about .inverted. Or should it? If it allows othe classes to care less about .inverted,
	// then maybe...
	// => That's what we do right now, so yes it is useless
	.factory('invertSegment', function() {
		return function( segment ) {
			if ( !segment || !segment.start ) {
				return;
			}

			// destructuring assignment would be useful here
			var tmp = segment.end;
			segment.end = segment.start;
			segment.start = tmp;

			if ( segment.ctrl0 !== undefined || segment.ctrl1 !== undefined ) {
				tmp = segment.ctrl1;
				segment.ctrl1 = segment.ctrl0;
				segment.ctrl0 = tmp;
			}

			return segment;
		};
	})

	.factory('segmentToSVG', function() {
		return function( segment ) {
			var render = segment.$render,
				string = [];

			if ( render.ctrl0 ) {
				string.push( render.ctrl0.toString() );
			}
			if ( render.ctrl1 ) {
				string.push( render.ctrl1.toString() );
			}

			string.unshift( segment.command );

			switch( segment.command.toUpperCase() ) {
			case 'H':
				string.push( Math.round( render.end.x ) );
				break;
			case 'V':
				string.push( Math.round( render.end.y ) );
				break;
			case 'Z':
				break;
			default:
				string.push( render.end.toString() );
				break;
			}

			return string.join(' ');
		};
	})

	.factory('transformSegment', function( transformPoint ) {
		return function( segment, matrix, except ) {
			if ( segment.ctrl0 && ( except === undefined || except.indexOf( segment.ctrl0 ) === -1 ) ) {
				transformPoint( segment.ctrl0, matrix );
			}
			if ( segment.ctrl1 && ( except === undefined || except.indexOf( segment.ctrl1 ) === -1 ) ) {
				transformPoint( segment.ctrl1, matrix );
			}
			if ( segment.end && ( except === undefined || except.indexOf( segment.end ) === -1 ) ) {
				transformPoint( segment.end, matrix );
			}
		};
	})

	// efficient smoothing that always joins control when roundness === 1
	.factory('smoothSegment3', function( lineLineIntersection ) {
		return function( segment, roundness ) {
			var p = lineLineIntersection( segment.start, segment.ctrl0, segment.end, segment.ctrl1 );

			if ( p ) {
				segment.ctrl0.x = segment.start.x + ( p[0] - segment.start.x ) * roundness;
				segment.ctrl0.y = segment.start.y + ( p[1] - segment.start.y ) * roundness;

				segment.ctrl1.x = segment.end.x + ( p[0] - segment.end.x ) * roundness;
				segment.ctrl1.y = segment.end.y + ( p[1] - segment.end.y ) * roundness;
			}
		}
	})

	.factory('moveSegmentPointTo', function() {
		return function() {

		};
	})

	/*.factory('getControlAngle', function() {
		return function( segment, i ) {
			return segment.controls[i] ?
				Math.atan2( segment[ 'ctrl' + i ].y - segment.start.y, segment[ 'ctrl' + i ].x - segment.start.x ):
				0;
		};
	})

	// initial, broken smoothing
	.factory('smoothSegment1', function() {
		return function( segment, angle0, angle1, c0length, c1length ) {
			if ( segment.corrections[0] ) {
				if ( segment.isSmooth === 'Ch' ) {
					segment.ctrl1.x += Math.cos( angle0 ) * c0length;
				} else {
					segment.ctrl1.y += Math.sin( angle0 ) * c0length;
				}
			}
			if ( segment.corrections[1] ) {
				if ( segment.isSmooth === 'Ch' ) {
					segment.ctrl0.y += Math.sin( angle1 ) * c1length;
				} else {
					segment.ctrl0.x += Math.cos( angle1 ) * c1length;
				}
			}
		};
	})

	// alternative smoothing that I cannot get to work reliably
	.factory('smoothSegment2', function( getControlAngle ) {
		return function( segment, angle0, angle1 ) {
			var c0dx = segment.ctrl1.x - segment.start.x,
				c0dy = segment.ctrl1.y - segment.start.y,
				c1dx = segment.ctrl0.x - segment.end.x,
				c1dy = segment.ctrl0.y - segment.end.y;

			if ( segment.corrections[0] ) {
				if ( angle1 === undefined ) {
					angle1 = getControlAngle( segment, 1 );
				}

				if ( segment.isSmooth === 'Ch' ) {
					segment.ctrl1.x = segment.end.x + Math.sin( angle1 ) * c1dy;
					segment.ctrl1.y = segment.end.y + Math.cos( angle1 ) * c1dy;
				} else {
					segment.ctrl1.x = segment.end.x + Math.sin( angle1 ) * c1dx;
					segment.ctrl1.y = segment.end.y + Math.cos( angle1 ) * c1dx;
				}
			}
			if ( segment.corrections[1] ) {
				if ( angle0 === undefined ) {
					angle0 = getControlAngle( segment, 0 );
				}

				if ( segment.isSmooth === 'Ch' ) {
					segment.ctrl0.x = segment.start.x + Math.sin( angle0 ) * c0dy;
					segment.ctrl0.y = segment.start.y + Math.cos( angle0 ) * c0dy;
				} else {
					segment.ctrl0.x = segment.start.x + Math.sin( angle0 ) * c0dx;
					segment.ctrl0.y = segment.start.y + Math.cos( angle0 ) * c0dx;
				}
			}
		}
	})

	// very bad smoothing, shouldn't be used
	.factory('smoothSegment4', function( lineLineIntersection ) {
		return function( segment ) {
			segment.ctrl0.x = segment.start.x + ( segment.ctrl1.x - segment.start.x ) * segment.roundness;
			segment.ctrl0.y = segment.start.y + ( segment.ctrl1.y - segment.start.y ) * segment.roundness;

			segment.ctrl1.x = segment.end.x + ( segment.ctrl0.x - segment.end.x ) * segment.roundness;
			segment.ctrl1.y = segment.end.y + ( segment.ctrl0.y - segment.end.y ) * segment.roundness;
		}
	})*/;
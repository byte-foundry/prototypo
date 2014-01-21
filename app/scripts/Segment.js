'use strict';

angular.module('prototypo.Segment', ['prototypo.Point', 'prototypo.2D'])
	.factory('Segment', function( Point, parseUpdateSegment, absolutizeSegment, segmentToSVG, cutSegment, moveSegmentEnd, invertSegment, getSegmentPoints, transformSegment ) {
		function Segment( data, curPos, invert ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos, invert );
			}

			this.controls = [];
			this.invert = invert;
			this.$debug = [];
			this.$render = { controls: [] };

			parseUpdateSegment( this, data );

			this.absolutize( curPos || Point(0,0) );

			// this is a copy of the points that should be used when rendering the segment
			// this allows to have a representation of a component that isn't altered by its subcomponents,
			// and another representation (render) that is altered.
			this.$render.end = this.end;
			if ( this.start ) {
				this.$render.start = this.start;
			}
			if ( this.controls[0] ) {
				this.$render.controls[0] = this.controls[0];
			}
			if ( this.controls[1] ) {
				this.$render.controls[1] = this.controls[1];
			}
		}

		Segment.prototype = {
			update: function( data ) { parseUpdateSegment( this, data ); },
			absolutize: function( curPos ) { absolutizeSegment( this, curPos ); },
			toSVG: function() { return segmentToSVG( this ); },
			cut: function( from, to ) { return cutSegment( this, from, to ); },
			moveEnd: function( endPoint, newCoords ) { return moveSegmentEnd( this, endPoint, newCoords ); },
			invertSegment: function() { return invertSegment( this); },
			debug: function() { return getSegmentPoints( this ); },
			transform: function( matrix ) { return transformSegment( this, matrix ); }
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
				return Math.atan2( this.end.x - this.start.x , this.start.y - this.end.y );
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
				if ( segment.controls[1] === undefined ) {
					segment.controls[1] = Point( tmp[1], tmp[2] );
				} else {
					segment.controls[1].x = tmp[1];
					segment.controls[1].y = tmp[2];
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
				segment.roundness = +tmp[1];
				segment.corrections = tmp.slice(2,4);

				if ( segment.controls.length === 0 ) {
					segment.controls[0] = Point(0,0);
					segment.controls[1] = Point(0,0);
				}

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
					if ( segment.controls[0] === undefined ) {
						segment.controls[0] = Point( tmp[1], tmp[2] );
					} else {
						segment.controls[0].x = tmp[1];
						segment.controls[0].y = tmp[2];
					}
				}
				if ( length > 5 ) {
					if ( segment.controls[1] === undefined ) {
						segment.controls[1] = Point( tmp[3], tmp[4] );
					} else {
						segment.controls[1].x = tmp[3];
						segment.controls[1].y = tmp[4];
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
	.factory('absolutizeSegment', function( Point ) {
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
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
				segment.controls[1].x += curPos.x;
				segment.controls[1].y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				segment.relativeControls = true;
				break;
			case 'q':
			case 's':
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
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
					segment.controls[0].x += segment.start.x;
					segment.controls[0].y += segment.start.y;
				}

				segment.controls[1].x += segment.end.x;
				segment.controls[1].y += segment.end.y;

				segment.command = segment.command[1];
				segment.relativeControls = true;
			}

			// cubic bezier angle
			if ( segment.command === 'C+' || segment.command === 'C-' ) {
				var dx = ( segment.end.x - segment.start.x ) * segment.roundness,
					dy = ( segment.end.y - segment.start.y ) * segment.roundness;

				if (
					( segment.command === 'C+' && ( dx * dy > 0 ) ) ||
					( segment.command === 'C-' && ( dx * dy < 0 ) )
				) {
					segment.controls[0].x = segment.start.x;
					segment.controls[0].y = segment.start.y + dy;
					segment.controls[1].x = segment.end.x - dx;
					segment.controls[1].y = segment.end.y;

				} else {
					segment.controls[0].x = segment.start.x + dx;
					segment.controls[0].y = segment.start.y;
					segment.controls[1].x = segment.end.x;
					segment.controls[1].y = segment.end.y - dy;
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
				segment.$render.controls[0].x = points[1].x;
				segment.$render.controls[0].y = points[1].y;
				segment.$render.controls[1].x = points[2].x;
				segment.$render.controls[1].y = points[2].y;
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
				endPoint = render[ _endPoint ],
				dx,
				dy;

			if ( segment.relativeControls ) {
				dx = newCoords.coords[0] - endPoint.coords[0];
				dy = newCoords.coords[1] - endPoint.coords[1];

				if ( _endPoint === 'end' && render.controls[1] !== undefined ) {
					render.controls[1].coords[0] += dx;
					render.controls[1].coords[1] += dy;
				}
				if ( _endPoint === 'start' && render.controls[0] !== undefined ) {
					render.controls[0].coords[0] += dx;
					render.controls[0].coords[1] += dy;
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
	.factory('invertSegment', function() {
		return function( segment ) {
			if ( !segment || !segment.start ) {
				return;
			}

			// destructuring assignment would be useful here
			var tmp = segment.end;
			segment.end = segment.start;
			segment.start = tmp;

			if ( segment.controls ) {
				tmp = segment.controls[1];
				segment.controls[1] = segment.controls[0];
				segment.controls[0] = tmp;
			}

			return segment;
		};
	})

	.factory('segmentToSVG', function() {
		return function( segment ) {
			var render = segment.$render,
				string = [],
				end = segment.invert ? render.start : render.end;

			if ( render.controls[0] ) {
				string.push( render.controls[0].toString() );
			}
			if ( render.controls[1] ) {
				string[ segment.invert ? 'unshift' : 'push' ]( render.controls[1].toString() );
			}

			string.unshift( segment.command );

			switch( segment.command.toUpperCase() ) {
			case 'H':
				string.push( Math.round( end.x ) );
				break;
			case 'V':
				string.push( Math.round( end.y ) );
				break;
			case 'Z':
				break;
			default:
				string.push( end.toString() );
				break;
			}

			return string.join(' ');
		};
	})

	.factory('getSegmentPoints', function() {
		return function( segment ) {
			var end,
				render;

			if ( !segment.$debug.length ) {
				render = segment.$render;
				end = segment.invert ? render.start : render.end;

				if ( end ) {
					segment.$debug.push({
						color: 'blue',
						end: end
					});
				}
				if ( render.controls[0] ) {
					segment.$debug.push({
						color: 'green',
						start: render.start,
						end: render.controls[0]
					});
				}
				if ( render.controls[1] ) {
					segment.$debug.push({
						color: 'green',
						start: render.end,
						end: render.controls[1]
					});
				}
			}

			return segment.$debug;
		};
	})

	.factory('transformSegment', function( transformPoint ) {
		return function( segment, matrix, except ) {
			if ( segment.start && ( except === undefined || except.indexOf( segment.start ) === -1 ) ) {
				transformPoint( segment.start, matrix );
			}
			if ( segment.controls && segment.controls[0] && ( except === undefined || except.indexOf( segment.controls[0] ) === -1 ) ) {
				transformPoint( segment.controls[0], matrix );
			}
			if ( segment.controls && segment.controls[1] && ( except === undefined || except.indexOf( segment.controls[1] ) === -1 ) ) {
				transformPoint( segment.controls[1], matrix );
			}
			if ( segment.end && ( except === undefined || except.indexOf( segment.end ) === -1 ) ) {
				transformPoint( segment.end, matrix );
			}
		};
	});
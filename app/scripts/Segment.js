'use strict';

angular.module('prototypo.Segment', ['prototypo.Point'])
	.factory('Segment', function( parseUpdateSegment, absolutizeSegment, segmentToSVG, cutSegment, moveSegmentEnd, invertSegment, getSegmentPoints ) {
		function Segment( data, curPos, invert ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos, invert );
			}

			this.controls = [];
			this.invert = invert;
			this.$debug = [];

			parseUpdateSegment( this, data );

			this.absolutize( curPos );

			// make all points of the glyph available for debug
			// this can beirtual done only after the first parseUpdate and absolutize
		}

		Segment.prototype = {
			update: function( data ) { parseUpdateSegment( this, data ); },
			absolutize: function( curPos ) { absolutizeSegment( this, curPos ); },
			toSVG: function() { return segmentToSVG( this ); },
			cut: function( from, to ) { return cutSegment( this, from, to ); },
			moveEnd: function( endPoint, newCoords ) { return moveSegmentEnd( this, endPoint, newCoords ); },
			invertSegment: function() { return invertSegment( this); },
			debug: function() { return getSegmentPoints( this ); }
		};

		// a segment has x and y properties that are copies of this.end.x and this.end.y
		Object.defineProperty(Segment.prototype, 'x', {
			get: function() { return this.end.x; }
		});
		Object.defineProperty(Segment.prototype, 'y', {
			get: function() { return this.end.y; }
		});
		// I thought this would prevent .next to be enumerated but it doesn't seem to work
		Object.defineProperty(Segment.prototype, 'next', {
			writable: true,
			enumerable: false
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
		var rrelativeCP = /R[QCS]/;

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
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'z':
			case 'Z':
				segment.end = segment.start;
				break;
			// absolute commands (M, L, C, Q, ...) except Z, H & V
			default:
				curPos.x = segment.end.x;
				curPos.y = segment.end.y;
				break;
			}

			// uppercase command
			segment.command = segment.command.toUpperCase();

			// absolutize control-points relative to the ends of the segment
			if ( segment.command === 'RC' ) {
				segment.controls[0].x += segment.start.x;
				segment.controls[0].y += segment.start.y;
			}
			if ( rrelativeCP.test( segment.command ) ) {
				segment.relativeControls = true;
				segment.controls[1].x += segment.end.x;
				segment.controls[1].y += segment.end.y;
			}

			// remove 'r' indication
			segment.command = segment.command.slice(-1);
		};
	})

	// cut a segment given an x or y coordinate and move the segment end accordingly
	.factory('cutSegment', function( pointOn, moveSegmentEnd ) {
		// this regexp is duplicated in Point.js
		var rstraight = /[LVMH]/;

		return function( segment, from, _to ) {
			var p = pointOn( from, segment ),
				// accept 'start' or 'end' values
				to = typeof _to === 'string' ?
					segment[ _to ]:
					_to;

			// straight line
			if ( rstraight.test(segment.command) ) {
				moveSegmentEnd( segment, to, p );

			// curve
			} else {

			}

			return segment;
		};
	})

	// moves one endpoint of the segment and the attached control-points
	// the only way to prevent control-points from moving is to use C, Q and S
	.factory('moveSegmentEnd', function( Point ) {
		return function( segment, _endPoint, _newCoords ) {
			var newCoords = _newCoords instanceof Point ?
					_newCoords:
					Point( _newCoords ),
				// accept 'start' or 'end' values
				endPoint = typeof _endPoint === 'string' ?
					segment[ _endPoint ]:
					_endPoint,
				dx,
				dy;

			if ( segment.relativeControls ) {
				dx = newCoords.x - endPoint.x;
				dy = newCoords.y - endPoint.y;

				if ( endPoint === segment.end && segment.controls[1] !== undefined ) {
					segment.controls[1].coords[0] += dx;
					segment.controls[1].coords[1] += dy;
				}
				if ( endPoint === segment.start && segment.controls[0] !== undefined ) {
					segment.controls[0].coords[0] += dx;
					segment.controls[0].coords[1] += dy;
				}
			}

			endPoint.coords[0] = newCoords.coords[0];
			endPoint.coords[1] = newCoords.coords[1];
		};
	})

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
			var string = [],
				end = segment.invert ? segment.start : segment.end;

			if ( segment.controls[0] ) {
				string.push( segment.controls[0].toString() );
			}
			if ( segment.controls[1] ) {
				string[ segment.invert ? 'unshift' : 'push' ]( segment.controls[1].toString() );
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
			var end;

			if ( !segment.$debug.length ) {
				end = segment.invert ? segment.start : segment.end;

				if ( end ) {
					segment.$debug.push({
						color: 'blue',
						end: end
					});
				}
				if ( segment.controls[0] ) {
					segment.$debug.push({
						color: 'green',
						start: segment.start,
						end: segment.controls[0]
					});
				}
				if ( segment.controls[1] ) {
					segment.$debug.push({
						color: 'green',
						start: segment.end,
						end: segment.controls[1]
					});
				}
			}

			return segment.$debug;
		};
	});
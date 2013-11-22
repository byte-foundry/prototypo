'use strict';

angular.module('prototypo.Segment', ['prototypo.Point'])
	.factory('Segment', function( parseUpdateSegment, absolutizeSegment, segmentToSVG ) {
		function Segment( data, curPos ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos );
			}

			this.virtual = false;
			this.controls = [];

			parseUpdateSegment( this, data );

			this.absolutize( curPos );

			// make all points of the glyph available for debug
			// this can be done only after the first parseUpdate and absolutize
			this.$debug = [];
			if ( this.end ) {
				this.$debug.push({
					color: 'blue',
					end: this.end
				});
			}
			if ( this.controls[0] ) {
				this.$debug.push({
					color: 'green',
					start: this.start,
					end: this.controls[0]
				});
			}
			if ( this.controls[1] ) {
				this.$debug.push({
					color: 'green',
					start: this.end,
					end: this.controls[1]
				});
			}
		}

		Segment.prototype = {
			update: function( data ) { parseUpdateSegment( this, data ); },
			absolutize: function( curPos ) { absolutizeSegment( this, curPos ); },
			toSVG: function() { return segmentToSVG( this ); }
		};

		// a segment has x and y properties that are copies of this.end.x and this.end.y
		Object.defineProperty(Segment.prototype, 'x', {
			get: function() { return this.end.x; },
		});
		Object.defineProperty(Segment.prototype, 'y', {
			get: function() { return this.end.y; },
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
				break;
			case 'q':
			case 's':
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
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
				segment.controls[1].x += segment.end.x;
				segment.controls[1].y += segment.end.y;
			}

			// remove 'r' indication
			segment.command = segment.command.slice(-1);
		};
	})

	.factory('segmentToSVG', function() {
		return function( segment ) {
			var string = [ segment.command ];

			if ( segment.controls[0] ) {
				string.push( segment.controls[0].toString() );
			}
			if ( segment.controls[1] ) {
				string.push( segment.controls[1].toString() );
			}

			switch( segment.command.toUpperCase() ) {
			case 'H':
				string.push( Math.round( segment.end.x ) );
				break;
			case 'V':
				string.push( Math.round( segment.end.y ) );
				break;
			case 'Z':
				break;
			default:
				string.push( segment.end.toString() );
				break;
			}

			return string.join(' ');
		};
	});
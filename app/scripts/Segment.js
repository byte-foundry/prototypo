'use strict';

angular.module('prototypo.Segment', [])
	.factory('Segment', function( Point, absolutizeSegment ) {
		var rnormalize = /[, \t]+/g;

		function Segment( data, curPos ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos );
			}

			var tmp = data.replace(rnormalize, ' ').trim().split(' '),
				length = tmp.length;

			this.virtual = false;
			this.command = tmp[0];
			this.start = Point( curPos );

			switch ( tmp[0] ) {
			case 'h':
			case 'H':
				this.end = Point( tmp[ length - 1 ], undefined );
				break;
			case 'v':
			case 'V':
				this.end = Point( undefined, tmp[ length - 1 ] );
				break;
			case 'rq':
			case 'rQ':
			case 'rs':
			case 'rS':
				this.controls = [
					undefined,
					Point( tmp[1], tmp[2] )
				];
				break;
			case 'z':
			case 'Z':
				this.end = undefined;
				break;
			default:
				break;
			}

			if ( !( 'end' in this ) ) {
				this.end = Point( tmp[ length - 2 ], tmp[ length - 1 ] );
			}

			if ( !( 'controls' in this ) ) {
				this.controls = [];
				if ( length > 3 ) {
					this.controls[0] = Point( tmp[1], tmp[2] );
				}
				if ( length > 5 ) {
					this.controls[1] = Point( tmp[3], tmp[4] );
				}
			}

			this.absolutize( curPos );
		}

		Segment.prototype = {
			absolutize: function( curPos ) { absolutizeSegment( this, curPos ); }
		};

		return Segment;
	})

	// make endpoint and control-points of the glyph absolute
	.factory('absolutizeSegment', function() {
		var rrelative = /R[QCS]/;

		return function( segment, curPos ) {
			switch ( segment.command ) {
			case 'h':
				curPos.x = segment.end.x += curPos.x;
				break;
			case 'v':
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'rc':
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
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
				break;
			// absolute commands (M, L, C, Q, ...) except Z
			default:
				if ( segment.end.x ) {
					curPos.x = segment.end.x;
				}
				if ( segment.end.y ) {
					curPos.y = segment.end.y;
				}
				break;
			}

			// uppercase command
			segment.command = segment.command.toUpperCase();

			// absolutize control-points relative to the end of the segment
			if ( rrelative.test( segment.command ) ) {
				segment.controls[1].x += segment.end.x;
				segment.controls[1].y += segment.end.y;
			}

			// remove 'r' indication
			segment.command = segment.command.slice(-1);
		};
	});
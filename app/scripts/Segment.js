'use strict';

angular.module('prototypo.Segment', [])
	.factory('Segment', function( Point, absolutizeSegment ) {
		var rnormalize = /[, \t]+/g,
			rz = /z/i;

		function Segment( data, curPos ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos );
			}

			var tmp = data.replace(rnormalize, ' ').split(' '),
				length = tmp.length;

			this.virtual = false;
			this.command = tmp[0];
			this.start = Point( curPos );
			if ( !rz.test( tmp[0] ) ) {
				this.end = Point( tmp[ length - 2 ], tmp[ length - 1 ] );
			}
			this.controls = [];

			if ( length > 3 ) {
				this.controls[0] = Point( tmp[1], tmp[2] );
			}

			if ( length > 5 ) {
				this.controls[1] = Point( tmp[3], tmp[4] );
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
		return function( segment, curPos ) {
			switch ( segment.command ) {
			case 'h':
				curPos.x = segment.end.x += curPos.x;
				break;
			case 'v':
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'c':
				segment.controls[1].x += curPos.x;
				segment.controls[1].y += curPos.y;
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'rq':
			case 'q':
				segment.controls[0].x += curPos.x;
				segment.controls[0].y += curPos.y;
				curPos.x = segment.end.x += curPos.x;
				curPos.y = segment.end.y += curPos.y;
				break;
			case 'l':
			case 'm':
			case 's':
			case 't':
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
				curPos.x = segment.end.x;
				curPos.y = segment.end.y;
				break;
			}

			// uppercase command
			segment.command = segment.command.toUpperCase();

			// absolutize control-points relative to the end of the segment
			if ( segment.command === 'RC' ) {
				segment.controls[1].x += segment.end.x;
				segment.controls[1].y += segment.end.y;
			}
			if ( segment.command === 'RS' ) {
				segment.controls[0].x += segment.end.x;
				segment.controls[0].y += segment.end.y;
			}

			// remove 'r' indication
			segment.command = segment.command.slice(-1);
		};
	});
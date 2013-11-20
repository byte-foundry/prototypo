'use strict';

angular.module('prototypo.Segment', ['prototypo.Point'])
	.factory('Segment', function( Point, absolutizeSegment, segmentToSVG ) {
		var rnormalize = /[", \t]+/g;

		function Segment( data, curPos ) {
			// new is optional
			if ( !( this instanceof Segment ) ) {
				return new Segment( data, curPos );
			}

			var tmp = data.replace(rnormalize, ' ').trim().split(' '),
				length = tmp.length;

			this.virtual = false;
			this.command = tmp[0];

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

	// make endpoint and control-points of the glyph absolute
	.factory('absolutizeSegment', function( Point ) {
		var rrelativeCP = /R[QCS]/;

		return function( segment, curPos ) {
			segment.start = Point( curPos );

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

			// absolutize control-points relative to the end of the segment
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
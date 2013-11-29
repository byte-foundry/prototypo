'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point'])
	.factory('Glyph', function( Component, Point, glyphToSVG ) {

		function Glyph( name, args ) {
			// new is optional
			if ( !( this instanceof Glyph ) ) {
				return new Glyph( name, args );
			}

			// the root component is always merged "before 0"
			/*args.mergeAt = 0;
			args.mergeToGlyphAt = 0;
			args.after = false;*/

			args.cut = 0;
			args.to = 'end';

			this.origin = Point(0,0);
			this.segments = [];
			this.component = Component( args.formulaLib[ name ], args );
			this.component.init( Point(this.origin), [] );
		}

		Glyph.prototype = {
			process: function() {
				this.suid = Math.random();
				this.segments = [];
				this.component.process( Point(this.origin), this.segments );

				var currSegment = this.component.firstSegment;

				// flatten
				while ( currSegment ) {
					this.segments.push( currSegment );
					currSegment = currSegment.next;
				}

				return this;
			},
			toSVG: function() { return glyphToSVG( this ); }
		};

		return Glyph;
	})

	.factory('glyphToSVG', function() {
		return function( glyph ) {
			return glyph.segments.map(function( segment ) {
				return segment.toSVG();
			}).join('\n');
		};
	});
'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point'])
	.factory('Glyph', function( Component, Point, glyphToSVG ) {

		function Glyph( name, args ) {
			// new is optional
			if ( !( this instanceof Glyph ) ) {
				return new Glyph( name, args );
			}

			this.origin = Point(0,0);
			this.segments = [];
			this.component = Component( args.formulaLib[ name ], args );
			this.component.init( Point(this.origin) );
		}

		Glyph.prototype = {
			process: function() {console.log('glyph.process');
				this.suid = Math.random();
				this.segments = [];
				this.component.process( Point(this.origin), this.segments );
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
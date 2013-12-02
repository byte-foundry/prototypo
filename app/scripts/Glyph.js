'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point'])
	.factory('Glyph', function( Component, Point, glyphToSVG ) {

		function Glyph( name, formulaLib, params ) {
			// new is optional
			if ( !( this instanceof Glyph ) ) {
				return new Glyph( name, formulaLib, params );
			}

			// TODO: we dont need a .origin
			this.origin = Point(0,0);
			this.component = Component({
				type: 'add',
				name: name
			}, formulaLib, params );
			this.component.init( Point(this.origin), [] );

			this.segments = [];
			var currSegment = this.component.firstSegment;
			// flatten
			while ( currSegment ) {
				this.segments.push( currSegment );
				currSegment = currSegment.next;
			}
		}

		Glyph.prototype = {
			process: function() {
				this.suid = Math.random();
				// TODO: no need to reuse Point constructor here I believe
				this.component.process( Point(this.origin) );

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
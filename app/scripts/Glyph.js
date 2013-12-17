'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point'])
	.factory('Glyph', function( Component, Point, glyphToSVG ) {

		function Glyph( name, args ) {
			// new is optional
			if ( !( this instanceof Glyph ) ) {
				return new Glyph( name, args );
			}

			this.data = args.data;
			// TODO: we dont need a .origin
			this.origin = Point(0,0);
			this.component = Component({
				type: 'add',
				name: name
			}, args.formulaLib, args.params );
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
			read: function( params, full ) {
				this.component.process( Point(this.origin), full );

				return {
					segments: this.segments,
					svg: glyphToSVG( this ),
					// TODO: this formula shouldn't be hardcoded
					left: this.data.left,
					width: params.width * this.data.width + params.thickness + this.data.right
				};
			},
			process: function( full ) {
				//this.suid = Math.random();
				// TODO: no need to reuse Point constructor here I believe
				this.component.process( Point(this.origin), full );

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
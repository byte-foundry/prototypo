'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point', 'prototypo.2D'])
	.factory('Glyph', function( Component, Point, glyphToSVG, transformGlyph ) {

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
			toSVG: function() { return glyphToSVG( this ); },
			transform: function( transform ) {
				transformGlyph( this, transform );
				return this;
			}
		};

		return Glyph;
	})

	.factory('glyphToSVG', function() {
		return function( glyph ) {
			return glyph.segments.map(function( segment ) {
				return segment.toSVG();
			}).join('\n');
		};
	})

	// this function cannot be used to transform glyphs in real-time,
	// it would create important distortions when manipulating parameters.
	// SVG transforms should be used for real-time transformations,
	// and this function should only be used before generating font files
	.factory('transformGlyph', function( transformToMatrix2d, transformSegment ) {
		return function( glyph, transform ) {
			// accept both a matrix or a transform string
			var matrix = typeof transform === 'string' ?
					transformToMatrix2d( transform ):
					transform,
				currSegment = glyph.component.firstSegment;

			while ( currSegment ) {
				// when transforming the whole glyph, use "$render"ed points of the segments
				transformSegment( currSegment.$render, matrix );
				currSegment = currSegment.next;
			}
		};
	});
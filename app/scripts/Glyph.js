'use strict';
// TODO: don't recreate glyph segments on every pass, reuse them!

angular.module('prototypo.Glyph', ['prototypo.Component', 'prototypo.Point', 'prototypo.2D'])
	.factory('Glyph', function( Component, Point, glyphToSVG, transformGlyph, smoothGlyph ) {

		function Glyph( name, args ) {
			// new is optional
			if ( !( this instanceof Glyph ) ) {
				return new Glyph( name, args );
			}

			this.data = args.data;
			this.origin = Point(this.data.left,0);
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
				smoothGlyph( this );

				return {
					segments: this.segments,
					svg: glyphToSVG( this ),
					left: 0,
					// TODO: this formula shouldn't be hardcoded
					advance: this.data.left + params.width * this.data.width + params.thickness + this.data.right
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
	})

	.factory('smoothGlyph', function() {
		return function( glyph ) {
			// accept both a matrix or a transform string
			var currSegment = glyph.component.firstSegment,
				prevSegment,
				refAngle,
				refLength;

			while ( currSegment ) {
				if ( currSegment.controls[0] && currSegment.controls[0].isSmooth ) {console.log('here', currSegment)
					refLength = Math.sqrt(
						Math.pow( currSegment.$render.controls[0].x - currSegment.$render.start.x, 2 ) +
						Math.pow( currSegment.$render.controls[0].y - currSegment.$render.start.y, 2 )
					);

					refAngle = prevSegment.command === 'C' ?
						Math.atan2( prevSegment.$render.end.y - prevSegment.$render.controls[1].y, prevSegment.$render.end.x - prevSegment.$render.controls[1].x ):
						Math.atan2( prevSegment.$render.end.y - prevSegment.$render.start.y, prevSegment.$render.end.x - prevSegment.$render.start.x );

					currSegment.$render.controls[0].x = currSegment.$render.start.x + Math.cos( refAngle ) * refLength;
					currSegment.$render.controls[0].y = currSegment.$render.start.y + Math.sin( refAngle ) * refLength;
				}

				if ( prevSegment && prevSegment.controls[1] && prevSegment.controls[1].isSmooth ) {console.log('there', prevSegment)
					refLength = Math.sqrt(
						Math.pow( prevSegment.$render.controls[1].x - prevSegment.$render.end.x, 2 ) +
						Math.pow( prevSegment.$render.controls[1].y - prevSegment.$render.end.y, 2 )
					);

					refAngle = currSegment.command === 'C' ?
						Math.atan2( currSegment.$render.controls[0].y - prevSegment.$render.start.y, currSegment.$render.controls[0].x - prevSegment.$render.start.x ):
						Math.atan2( currSegment.$render.start.y - currSegment.$render.end.y, currSegment.$render.start.x - currSegment.$render.end.x );

					prevSegment.$render.controls[1].x = prevSegment.$render.end.x + Math.cos( refAngle ) * refLength;
					prevSegment.$render.controls[1].y = prevSegment.$render.end.y + Math.sin( refAngle ) * refLength;
				}

				if ( prevSegment && prevSegment.isSmooth && ( prevSegment.controls[0].isSmooth || prevSegment.controls[1].isSmooth ) ) {
					prevSegment.smooth( true );
				}

				prevSegment = currSegment;
				currSegment = currSegment.next;
			}
		};
	});
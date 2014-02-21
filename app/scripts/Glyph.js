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
					left: this.data.left,
					right: this.data.right,
					// TODO: this formula shouldn't be hardcoded
					// 80 is the original value of thickness
					advance: this.data.left + params.width * this.data.width + params.thickness - 80 + this.data.right
					// advance: this.data.left + this.leftestPoint + this.rightestPoint + this.data.right
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
			var bounding = [];
			var svg =  glyph.segments.map(function( segment ) {
				if ( glyph.component.name != 'sample') {
					bounding.push( segment.$render.end.x ) ;
				}
				return segment.toSVG();
			}).join('\n');
			var rightestPoint = Math.max.apply( null, bounding );
			glyph.rightestPoint = rightestPoint;
			var leftestPoint = Math.min.apply( null, bounding );
			glyph.leftestPoint = - leftestPoint;
			if ( glyph.component.name != 'sample') {
				/*console.log(
					glyph.component.name
					+ ' > ' +
					glyph.data.left,
					leftestPoint,
					glyph.data.right,
					rightestPoint
				);*/
			}
			return svg;
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
				if ( currSegment.ctrl0 && currSegment.ctrl0.isSmooth ) {
					refLength = Math.sqrt(
						Math.pow( currSegment.$render.ctrl0.x - currSegment.$render.start.x, 2 ) +
						Math.pow( currSegment.$render.ctrl0.y - currSegment.$render.start.y, 2 )
					);

					refAngle = prevSegment.command === 'C' ?
						Math.atan2( prevSegment.$render.end.y - prevSegment.$render.ctrl1.y, prevSegment.$render.end.x - prevSegment.$render.ctrl1.x ):
						Math.atan2( prevSegment.$render.end.y - prevSegment.$render.start.y, prevSegment.$render.end.x - prevSegment.$render.start.x );

					currSegment.$render.ctrl0.x = currSegment.$render.start.x + Math.cos( refAngle ) * refLength;
					currSegment.$render.ctrl0.y = currSegment.$render.start.y + Math.sin( refAngle ) * refLength;
				}

				if ( prevSegment && prevSegment.ctrl1 && prevSegment.ctrl1.isSmooth ) {
					refLength = Math.sqrt(
						Math.pow( prevSegment.$render.ctrl1.x - prevSegment.$render.end.x, 2 ) +
						Math.pow( prevSegment.$render.ctrl1.y - prevSegment.$render.end.y, 2 )
					);

					refAngle = currSegment.command === 'C' ?
						Math.atan2( currSegment.$render.ctrl0.y - prevSegment.$render.start.y, currSegment.$render.ctrl0.x - prevSegment.$render.start.x ):
						Math.atan2( currSegment.$render.start.y - currSegment.$render.end.y, currSegment.$render.start.x - currSegment.$render.end.x );

					prevSegment.$render.ctrl1.x = prevSegment.$render.end.x + Math.cos( refAngle ) * refLength;
					prevSegment.$render.ctrl1.y = prevSegment.$render.end.y + Math.sin( refAngle ) * refLength;
				}

				if ( prevSegment && prevSegment.isSmooth && ( prevSegment.ctrl0.isSmooth || prevSegment.ctrl1.isSmooth ) ) {
					prevSegment.smooth( true );
				}

				prevSegment = currSegment;
				currSegment = currSegment.next;
			}
		};
	});
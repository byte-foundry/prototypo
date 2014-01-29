'use strict';

angular.module('prototypo.Font', ['prototypo.Glyph', 'prototypo.Formula'])
	.factory('Font', function( Glyph, Formula, fontToDotSVG ) {
		function Font( name, args ) {
			var self = this;

			// new is optional
			if ( !( this instanceof Font ) ) {
				return new Font( name, args );
			}

			// merge glyph and component formulas in a single formulaLib
			this.formulaLib = {};

			for ( var i in args.glyphFormulas ) {
				this.formulaLib['glyph:' + i] = Formula( args.glyphFormulas[i] );
			}
			for ( var j in args.componentFormulas ) {
				this.formulaLib[j] = Formula( args.componentFormulas[j] );
			}

			this.name = name;
			this.glyphs = {};

			for ( var code in args.glyphData ) {
				try {
					self.glyphs[ code ] = Glyph( 'glyph:' + code, {
						data: args.glyphData[ code ],
						formulaLib: this.formulaLib,
						params: args.parameters
					});

				} catch ( e ) {
					if ( e.name === 'init component' ) {
						e.message = 'Glyph ' + code + ' cannot be initialized:\n' + e.message;
					}
					throw e;
				}
			}
		}

		Font.prototype = {
			read: function( code, params, full ) { return this.glyphs[ code ].read( params, full ); },
			// deprecated
			process: function( code, full ) { return this.glyphs[ code ].process( full ); },
			toDotSVG: function( params ) { return fontToDotSVG( this, params ); }
		};

		return Font;
	})

	.factory('fontToDotSVG', function() {
		var template = Handlebars.templates.dotsvg;

		return function( font, params ) {
			var glyphs = {};

			for ( var glyph in font.glyphs ) {
				if ( glyph.length === 1 ) {
					glyphs[ glyph ] = font.read( glyph, params, true );
					glyphs[ glyph ].code = glyph;
					glyphs[ glyph ].svg = glyphs[ glyph ].svg.replace(/\n/g, ' ');
				}
			}

			return template({glyphs: glyphs});
		};
	});
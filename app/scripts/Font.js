'use strict';

angular.module('prototypo.Font', ['prototypo.Glyph', 'prototypo.Formula'])
	.factory('Font', function( Glyph, Formula, fontToDotSVG ) {
		function Font( name, args ) {
			var self = this,
				code;

			// new is optional
			if ( !( this instanceof Font ) ) {
				return new Font( name, args );
			}

			// merge glyph and component formulas in a single formulaLib
			var formulaLib = {},
				i;

			for ( i in args.glyphFormulas ) {
				formulaLib['glyph:' + i] = Formula( args.glyphFormulas[i] );
			}
			for ( i in args.componentFormulas ) {
				formulaLib[i] = Formula( args.componentFormulas[i] );
			}

			this.name = name;
			this.glyphs = {};

			for ( code in args.glyphData ) {
				try {
					self.glyphs[ code ] = Glyph( 'glyph:' + code, {
						data: args.glyphData[ code ],
						formulaLib: formulaLib,
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
			toDotSVG: function() { return fontToDotSVG( this ); }
		};

		return Font;
	})

	.factory('fontToDotSVG', function() {
		var template = Handlebars.templates.dotsvg;

		return function( font ) {
			console.log(template({}));
		};
	});
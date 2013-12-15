'use strict';

angular.module('prototypo.Font', ['prototypo.Glyph', 'prototypo.Formula'])
	.factory('Font', function( Glyph, Formula ) {
		function Font( name, args ) {
			var self = this;

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
			$.each( args.glyphCodes, function( code ) {
				try {
					self.glyphs[ code ] = Glyph( 'glyph:' + code, formulaLib, args.parameters );
				} catch ( e ) {
					if ( e.name === 'init component' ) {
						e.message = 'Glyph ' + code + ' cannot be initialized:\n' + e.message;
					}
					throw e;
				}
			});
		}

		Font.prototype = {
			process: function( code, full ) { return this.glyphs[ code ].process( full ); }
		};

		return Font;
	});
'use strict';

angular.module('prototypo.Font', ['prototypo.Glyph', 'prototypo.Formula'])
	.factory('Font', function( Glyph, Formula ) {
		function Font( name, args ) {
			// new is optional
			if ( !( this instanceof Font ) ) {
				return new Font( name, args );
			}

			// merge glyph and component formulas in a single formulaLib
			var formulaLib = {},
				i;

			for ( i in args.glyphFormulas ) {
				formulaLib['glyph ' + i] = Formula( args.glyphFormulas[i] );
			}
			for ( i in args.componentFormulas ) {
				formulaLib[i] = Formula( args.componentFormulas[i] );
			}

			this.name = name;
			this.glyphs = {};
			args.glyphCodes.forEach(function( code ) {
				try {
					this.glyphs[ code ] = Glyph( 'glyph ' + code, formulaLib, args.controls );
				} catch (e) {
					throw 'Glyph ' + code + ' cannot be initialized:\n' + e;
				}
			}, this);
		}

		Font.prototype = {
			process: function( code ) { return this.glyphs[ code ].process(); }
		};

		return Font;
	});
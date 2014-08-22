'use strict';

angular.module('prototypo.Typeface', ['prototypo.Component', 'prototypo.Glyph'])
	.factory('Typeface', function( Component ) {
		function Typeface( data, fontValues ) {
			var self = this;

			this.components = {};
			this.glyphs = {};

			_(data.components).forEach(function(data, id) {
				self.components[id] = new Component( data, fontValues );
			});
		}

		Typeface.prototype.process = function( chars, fontValues, cmap ) {
			var allChars = {};

			chars.forEach(function(char) {
				if ( cmap[char] ) {
					allChars[char] = this.components[ cmap[char] ].process( fontValues );
				}
			}, this);

			return allChars;
		};

		return Typeface;
	});
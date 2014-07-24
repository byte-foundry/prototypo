'use strict';

angular.module('prototypo.Typeface', ['prototypo.Component', 'prototypo.Glyph'])
	.factory('Typeface', function( Component ) {
		function Typeface( data, fontValues ) {
			var self = this;

			this.components = {};
			this.glyphs = {};

			_(data.components).forEach(function(data, id) {
				self.components[id] = new Component( data, fontValues );

				var match;
				if ( ( match = id.match(/^glyph-(.+?)(?:-(.+?))?$/) ) ) {
					if ( !self.glyphs[match[1]] ) {
						self.glyphs[match[1]] = {};
					}
					self.glyphs[match[1]][match[2] || 0] = self.components[id];
				}
			});
		}

		Typeface.prototype.process = function( chars, fontValues/*, cmap*/ ) {
			chars.forEach(function(char) {
				if ( this.glyphs[char] ) {
					this.glyphs[char][0].process( fontValues );
				}
			}, this);

			return this.glyphs;
		};

		return Typeface;
	});
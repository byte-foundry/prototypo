'use strict';

angular.module('prototyp0.glyphs', ['prototyp0.components'])
	.constant('glyphs', {} )
	// make sure sliders values are int and combine some sliders
	.factory('normalize', function( _ ) {
		return function() {
			var self = this;

			_( self.sliders ).each(function( value, key ) {
				self.sliders[ key ] = +value;
			});
		};
	})
	// calculate the segments of a glyph according to the sliders
	// FIXME: this code is currently useless
	.factory('calcSegments', function() {
		return function( glyphFn ) {
			this.segments = glyphFn( this.sliders );
		};
	});
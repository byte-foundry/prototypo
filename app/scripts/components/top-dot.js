'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['top-dot'] = function( dim, glyph, index ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?
			tmp[0] = 90;
			tmp[1] = dim.x_height + 88; // 88 is the distance from the stem to the bottom of the dot: variable? or depends of Cap height?

			glyph[index] = [ 'M', tmp[0], tmp[1], tmp[0], tmp[1], tmp[0], tmp[1] ]; // duplicate g[X][1] & g[X][2] to avoid bug in components g[X-1][5] = null

			components['curve-top-left'](dim, glyph, index + 1, tmp[0] - 1.25 * dim.thickness / 2, tmp[1] + 1.25 * dim.thickness / 2 );
			components['curve-top-right'](dim, glyph, index + 2, tmp[0], tmp[1] + 1.25 * dim.thickness);
			components['curve-bottom-right'](dim, glyph, index + 3, tmp[0] + 1.25 * dim.thickness / 2, tmp[1] + 1.25 * dim.thickness / 2 );
			components['curve-bottom-left'](dim, glyph, index + 4, tmp[0], tmp[1]);
		};

	});
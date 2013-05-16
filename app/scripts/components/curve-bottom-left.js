'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['curve-bottom-left'] = function( dim, glyph, index, end_X, end_Y ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?

			glyph[index] = [ 'C',
				glyph[index - 1][5],
				glyph[index - 1][6] - (glyph[index - 1][6] - end_Y) * dim.roundness,
				end_X + (glyph[index - 1][5] - end_X) * dim.roundness,
				end_Y,
				end_X,
				end_Y
			];

		};

	});
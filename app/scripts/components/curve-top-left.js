'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['curve-top-left'] = function( dim, glyph, index, end_X, end_Y ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?

			glyph[index] = [ 'C',
				glyph[index - 1][5] - (glyph[index - 1][5] - end_X) * dim.roundness,
				glyph[index - 1][6],
				end_X,
				end_Y - (end_Y - glyph[index - 1][6]) * dim.roundness,
				end_X,
				end_Y
			];

		};

	});
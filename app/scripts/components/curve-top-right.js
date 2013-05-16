'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['curve-top-right'] = function( dim, glyph, index, end_X, end_Y ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?

			glyph[index] = [ 'C',
				glyph[index - 1][5],
				glyph[index - 1][6] + (end_Y - glyph[index - 1][6]) * dim.roundness,
				end_X - (end_X - glyph[index - 1][5]) * dim.roundness,
				end_Y,
				end_X,
				end_Y
			];

		};

	});
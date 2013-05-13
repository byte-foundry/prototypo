'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['serif-top-left'] = function( dim, glyph, index ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?

			glyph[index] = [ 'C',
				glyph[index - 1][5],
				glyph[index - 1][6],
				glyph[index][5],
				glyph[index][6],
				glyph[index - 1][5],
				dim.x_height - 3 - dim.s_height - ( dim.s_curve * dim.s_width )
			];

			glyph[index + 1] = [ 'C',
				glyph[index][5],
				glyph[index][6] + ( dim.s_curve * dim.s_width ),
				( tmp[0] = glyph[index][5] - 1 - dim.s_width ) + ( dim.s_curve * dim.s_width ) /* glyph[index + 3][5] */,
				( tmp[4] = dim.x_height - 2 - dim.s_height * dim.s_median ) /* glyph[index + 1][6] */,
				tmp[0],
				tmp[4]
			];

			glyph[index + 2] = [ 'C',
				tmp[0] - ( tmp[0] - ( tmp[1] = tmp[0] - dim.s_terminal * dim.s_width ) /* glyph[index + 2][5] */ ) * dim.roundness,
				glyph[index + 1][6],
				tmp[1],
				( tmp[2] = glyph[index + 1][6] + (glyph[index + 3][6] - glyph[index + 1][6]) / 2 ) /* glyph[index + 2][6] */ - ( tmp[2] - tmp[4] ) * dim.roundness,
				tmp[1] /* tmp[1] */ ,
				tmp[2]
			];

			glyph[index + 3] = [ 'C',
				tmp[1],
				tmp[2] + ( ( tmp[3] = dim.x_height ) /* glyph[index + 3][6] */ - tmp[2] ) * dim.roundness,
				tmp[0] - ( tmp[0] - tmp[1] ) * dim.roundness,
				tmp[3],
				tmp[0] /* tmp[0] */,
				tmp[3]
			];

			glyph[index + 4] = [ 'C',
				tmp[0],
				tmp[3] /* - ( dim.s_arc * dim.s_width ) */,
				( tmp[5] = 89 ) /* - ( dim.s_arc * dim.s_width ) */ /* glyph[index + 4][5] */,
				tmp[3],
				tmp[5] /* tmp[5] */,
				tmp[3] - ( dim.s_arc * dim.s_height )
			];

		};

	});

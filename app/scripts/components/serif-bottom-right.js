'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['serif-bottom-right'] = function( dim, glyph, index ) {

			var tmp = [];

			// Simplfy by placing the tmp definitions on top ?

			glyph[index] = [ 'C',
				glyph[index -1][5],
				glyph[index -1][6],
				glyph[index][5],
				glyph[index][6],
				130, /*  /!\ must create relative coordinates /!\  */
				3 + dim.s_height + ( dim.s_curve * dim.s_width )
			];

			glyph[index + 1] = [ 'C',
				glyph[index][5],
				glyph[index][6] - ( dim.s_curve * dim.s_width ),
				( tmp[0] = glyph[index][5] + 1 + dim.s_width ) - ( dim.s_curve * dim.s_width ) /* glyph[index + 1][5] */,
				( tmp[1] = 2 + dim.s_height * dim.s_median ) /* glyph[index + 1][6] */,
				tmp[0] /* tmp[0] */,
				tmp[1] /* tmp[1] */
			];

			glyph[index + 2] = [ 'C',
				glyph[index + 1][5] + ( ( tmp[2] = glyph[index + 1][5] + dim.s_terminal * dim.s_width ) /* glyph[index + 2][5] */ - glyph[index + 1][5] ) * dim.roundness,
				glyph[index + 1][6],
				tmp[2],
				( tmp[3] = tmp[1] / 2 ) /* glyph[index + 2][6] */ + ( tmp[1] - tmp[3] ) * dim.roundness,
				tmp[2] /* tmp[2] */,
				tmp[3] /* tmp[3] */
			];

			glyph[index + 3] = [ 'C',
				tmp[2],
				tmp[3] - ( tmp[3] ) * dim.roundness,
				tmp[0] + ( tmp[2] - tmp[0] ) * dim.roundness,
				0,
				tmp[0],
				0
			];

			glyph[index + 4] = [ 'C',
				tmp[0] - ( tmp[0] - ( tmp[5] = tmp[0] - ( tmp[0] - ( tmp[4] = glyph[index + 4][5] - dim.thickness / 2 - 1 - dim.s_width)  /* may cause some troubles when the start point is not centered on the stem   //  glyph[index][5] */ ) / 2 ) ) * dim.roundness,
				glyph[index + 3][6],
				tmp[5] + ( tmp[0] - tmp[5] ) * dim.roundness,
				glyph[index + 4][6],
				tmp[5],
				dim.s_arc * dim.s_height
			];

		};

	});
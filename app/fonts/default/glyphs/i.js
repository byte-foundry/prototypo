'use strict';

angular.module('prototyp0.glyphs')
	.config(function( glyphs, components ) {
		glyphs['i'] = function( dim ) {
			var glyph = [];
			var tmp = [];

			// need an initialization to use forward points

			glyph[0] = [ 'M', 130, 465 ];
			glyph[1] = [ 'C', 130, 465, 130, 3, 130, 3 ];
			glyph[2] = [ 'C', 130, 3, 131, 2, 131, 2 ];
			glyph[3] = [ 'C', 131, 2, 131, 1, 131, 1 ];
			glyph[4] = [ 'C', 131, 1, 131, 0, 131, 0 ];
			glyph[5] = [ 'C', 131, 0, 91, 0, 90, 0 ];
			glyph[6] = [ 'C', 90, 0, 49, 0, 49, 0 ];
			glyph[7] = [ 'C', 49, 0, 49, 1, 49, 1 ];
			glyph[8] = [ 'C', 49, 1, 49, 2, 49, 2 ];
			glyph[9] = [ 'C', 49, 2, 50, 3, 50, 3 ];
			glyph[10] = [ 'C', 50, 3, 50, 462, 50, 462 ];
			glyph[11] = [ 'C', 50, 462, 49, 463, 49, 463 ];
			glyph[12] = [ 'C', 49, 463, 49, 464, 49, 464 ];
			glyph[13] = [ 'C', 49, 464, 49, 465, 49, 465 ];
			glyph[14] = [ 'C', 49, 465, 89, 465, 89, 465 ];
			glyph[15] = [ 'C', 89, 465, 130, 465, 130, 465 ];

			glyph[16] = [ 'M', 90, 652 ];
			glyph[17] = [ 'C', 117, 652, 139, 630, 139, 603 ];
			glyph[18] = [ 'C', 139, 576, 117, 553, 90, 553 ];
			glyph[19] = [ 'C', 63, 553, 42, 576, 42, 603 ];
			glyph[20] = [ 'C', 42, 630, 63, 652, 90, 652 ];

			//

			glyph[0] = [ 'M', glyph[15][5], dim.x_height, glyph[15][5], dim.x_height, glyph[15][5], dim.x_height ];  // duplicate [1] & [2] to avoid bug in components [X-1][5] = null

			components['serif-bottom-right'](dim, glyph, 1);
			components['serif-bottom-left'](dim, glyph, 6);

			components['serif-top-left'](dim, glyph, 10);

			glyph[15] = [ 'C', 89, glyph[0][6] - dim.s_arc * dim.s_height, glyph[0][1], glyph[0][6] - dim.s_arc * dim.s_height, glyph[14][5] + dim.thickness / 2 + 1, glyph[0][6] ];

			components['top-dot'](dim, glyph, 16);

			return glyph;


		};


	});



angular.module('prototyp0Components', ['prototyp0App'])
	.run(function( components ) {
		components['serif-top-left'] = function( dim, glyph, index ) {
			var tmp = [];
		
			glyph[index] = [ 'C', 50, dim.x_height - 3 - dim.s_height, glyph[index][1] - 1 - dim.s_width, dim.x_height - 2, glyph[index][1] - 1 - dim.s_width, dim.x_height - 2 ];
			glyph[index + 1] = [ 'C', glyph[index][1] - 1 - dim.s_width, dim.x_height - 2, glyph[index][1] - 1 - dim.s_width, glyph[index][6] + (glyph[index+2][6] - glyph[index][6]) / 2, glyph[index][1] - 1 - dim.s_width, glyph[index][6] + (glyph[14][6] - glyph[index][6]) / 2 ];
			glyph[index + 2] = [ 'C', glyph[index][1] - 1 - dim.s_width, glyph[index][6] + (glyph[index+2][6] - glyph[index][6]) / 2, glyph[index][1] - 1 - dim.s_width, glyph[index + 4][2], glyph[index][1] - 1 - dim.s_width, glyph[index + 4][2] ];
			glyph[index + 3] = [ 'C', glyph[index][1] - 1 - dim.s_width, glyph[index + 4][2] - dim.s_arc, 89, glyph[index + 4][2] - dim.s_arc, 89, glyph[index + 4][2] - dim.s_arc ];
		};

	});
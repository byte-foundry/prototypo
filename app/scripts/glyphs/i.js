angular.module('prototyp0Glyph', ['prototyp0App'])
	.run(function( glyphs ) {
		glyphs['i'] = function( dim ) {
			var glyph = [];

			glyph[0] = ['M', 655, 650 - dim.hauteur];
			glyph[1] = ['L', 655, 281];
			glyph[2] = ['L', 534 - dim.largeur, 281];
			glyph[3] = ['L', 534 - dim.largeur, 308 + dim.hauteur];
			glyph[4] = ['L', 534 - dim.largeur, 335 + dim.hauteur];
			glyph[5] = ['L', 571, 335 + dim.hauteur];
			glyph[6] = ['L', 571, 650 - dim.hauteur];
			glyph[7] = ['L', 534 - dim.largeur, 650 - dim.hauteur];
			glyph[8] = ['L', 534 - dim.largeur, 675];
			glyph[9] = ['L', 534 - dim.largeur, 703];
			glyph[10] = ['L', 612, 703];
			glyph[11] = ['L', 690 + dim.largeur, 703];
			glyph[12] = ['L', 690 + dim.largeur, 675];
			glyph[13] = ['L', 690 + dim.largeur, 650 - dim.hauteur];

			return glyph;
		};

		glyphs['H'] = [
			['M', '347','127'],
			['v', '235'],
			['h', '272'],
			['V', '127'],
			['h', '73'],
			['v', '563'],
			['h', '-73'],
			['V', '426'],
			['H', '347'],
			['v', '264'],
			['h', '-73'],
			['V', '127'],
			['H', '347']
		];

	});
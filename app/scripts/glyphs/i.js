angular.module('prototyp0Glyph', ['prototyp0App'])
	.run(function( glyphs ) {
		glyphs['i'] = [
			['M', '655', '{{650 - dim.hauteur}}'],
			['L', '655', '281'],
			['L', '{{534 - dim.largeur}}', '281'],
			['L', '{{534 - dim.largeur}}', '{{308 -- dim.hauteur}}'],
			['L', '{{534 - dim.largeur}}', '{{335 -- dim.hauteur}}'],
			['L', '571', '{{335 -- dim.hauteur}}'],
			['L', '571', '{{650 - dim.hauteur}}'],
			['L', '{{534 - dim.largeur}}', '{{650 - dim.hauteur}}'],
			['L', '{{534 - dim.largeur}}', '675'],
			['L', '{{534 - dim.largeur}}', '703'],
			['L', '612', '703'],
			['L', '{{690 -- dim.largeur}}', '703'],
			['L', '{{690 -- dim.largeur}}', '675'],
			['L', '{{690 -- dim.largeur}}', '{{650 - dim.hauteur}}']
		];

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
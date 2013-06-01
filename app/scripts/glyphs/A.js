'use strict';

angular.module('prototyp0.glyphs')
	.config(function( glyphs ) {
		glyphs['ref:A'] = {
			0: [ 'M' ]
		};

		glyphs['A'] = {
			0: 'M 0 0',
			1: 'l 200 {{x_height}}',
			2: 'l 200 -{{x_height}}',
			3: 'l -20 0',
			4: 'l {{ [x,x_height / 2] | onLine:[-200,x_height] }}',
			5: 'L {{ [x,x_height / 2] | onLine:[200,x_height] | add:[20,0] }}',
			6: 'L 20 0',
			7: 'Z'
		};
	});
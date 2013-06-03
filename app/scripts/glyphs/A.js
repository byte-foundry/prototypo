'use strict';

angular.module('prototyp0.glyphs')
	.config(function( glyphs ) {
		glyphs['ref:A'] = {
			0:  [ 'M', 0, 0 ],
			1:  [ 'L', ]
		};

		glyphs['A'] = {
			0:  'M 20 0',
			1:  'l -20 0',
			2:  'l 200 {{x_height}}',
			3:  'l 200 -{{x_height}}',
			4:  'l -20 0',
			5:  'L {{ { y: x_height / 2 } | on:{ vector:[point(3),point(2)], origin:point(4) } }}',
			6:  'L {{ { y: x_height / 2 } | on:{ vector:[point(1),point(2)], origin:point(0) } }}',
			7:  'Z',
			8:  'M {{ { y: x_height / 2 + 20 } | on:{ vector:[point(3),point(2)], origin:point(4) } }}',
			9:  'L {{ { x: +point(2)[0] - 20 } | on:{ vector:[point(1),point(2)], origin:point(0) } }}',
			10: 'L {{ { y: x_height / 2 + 20 } | on:{ vector:[point(1),point(2)], origin:point(0) } }}',
			11: 'Z'
		};
	});
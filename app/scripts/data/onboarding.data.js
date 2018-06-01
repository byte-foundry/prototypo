export default {
	steps: [
		{
			type: 'start',
			title: 'Welcome on board!',
			description:
				[
					'Let’s get you set up for success from the start.',
					'In five quick steps, you will define the shape of your font',
					'using the recommended parameters.',

				],
			name: 'Start',
		},
		{
			type: 'sliders',
			title: 'Define your font proportions',
			letters: 'Hamburgefonstiv',
			sliders: ['xHeight', 'width'],
			description:
				[
					'Proportion refers to the width of a character in relation to its height.',
					'It’s a crucial step since it will define a big part of what your typeface will express and how you will be able to use it:',
					'a title may have some extreme proportions, in contrary to body copy that needs that to be more legible.',
				],
			name: 'Proportions',
		},
		{
			type: 'sliders',
			title: 'Define the style of your font',
			letters: 'Hamburgefonstiv',
			sliders: ['thickness', '_contrast'],
			description:
				[
					'The thickness and contrast amount define the final usage of your font.',
					'A very thick and high contrast typeface is suitable for large sizes,',
					'while a low contrast typeface with regular thickness is best used for texts.',
				],
			name: 'Style',
		},
		{
			type: 'sliders',
			title: 'Define the length of the ascenders and descenders',
			letters: 'bgf',
			sliders: ['ascender', 'descender'],
			description:
				[
					'The ascenders\' and descenders\' length is important to create rhythm and variation, especially in regards to text setting.',
					'For compact texts with small leading values, it is recommended to have short ascenders and descenders.',
					'Long ascenders and descenders will work best with looser leading.',
				],
			name: 'Ascenders / Descenders',
		},
		{
			type: 'alternates',
			title: 'Pick your alternates',
			letters: {
				97: 'Caracas', // a
				99: 'Typeface', // c
				162: '10¢', // ¢
				49: '1 for all', // 1
				36: 'Many $$', // $
				82: 'Raging', // R
				52: 'Like 1984', // 4
				53: 'All 5 of them', // 5
				71: 'Good!', // G
				77: 'Marvelous', // M
				81: 'Quite', // Q
				116: 'Pretty', // t
				121: 'Hypnotic', // y
				126: 'Swirly ~',
				96: '`',
			},
			name: 'Alternates',
			description:
				[
					'Choosing your alternates is a great way to give your typeface the right tone to make it more unique and flavorful.',
				],
		},
		{
			type: 'serifs',
			title: 'Define the serif style',
			letters: 'n',
			sliders: ['serifHeight', 'serifWidth', 'serifMedian'],
			name: 'Serifs',
			description:
				[
					'Serifs are key components of a typeface.',
					'Their height, width and median directly affect the look of your typeface.',
					'By using thick slab serifs you\'re able to design solid and sturdy fonts.',
					'Thin and sharp serifs will look great for elegant and refined letters.',
				],
		},
		{
			type: 'finish',
			title: 'Congratulations!',
			name: 'Finish',
			description:
				[
					'Congratulations, you’re doing great!',
					'You’ve prototyped your font. Let’s take it a step further and dive into the app to make it even better.',
					'If you get stuck at any point, we’re just a click away in your in-app chat. Also, the Academy tutorials might come in handy.',
					'And hey, here’s a little recap of all the shortcuts:',
				],
		},
	],
};

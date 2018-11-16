export default {
	steps: [
		{
			type: 'start',
			title: 'Welcome on board!',
			description: [
				'Let’s get you set up for success from the start.',
				'In five quick steps you will define your font’s shape with the key parameters.',
			],
			name: 'Start',
		},
		{
			type: 'sliders',
			title: 'Define your font proportions',
			letters: 'Hamburgefonstiv',
			sliders: ['xHeight', 'width'],
			description: [
				'The font proportions refer to the width of a character in relation to its height.',
				'Getting your proportions right is crucial, since it will have a big impact on your typeface’s final look.',
				'A title may have extreme proportions, while body texts are commonly more balanced to be legible.',
			],
			name: 'Proportions',
		},
		{
			type: 'sliders',
			title: 'Define your font style',
			letters: 'Hamburgefonstiv',
			sliders: ['thickness', '_contrast'],
			description: [
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
			description: [
				'The ascenders’ and descenders’ length is important to create rhythm, especially in regards to text setting.',
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
				48: '0123',
				102: 'flourish', // f
				104: 'huge', // h
				106: 'joy', // j
				109: 'humming', // m
				110: 'nice', // n
				114: 'perfect', // r
				117: 'Human', // u
			},
			name: 'Alternates',
			description: [
				'Choosing your alternates is a great way to give your typeface the right tone to make it more unique and impactful.',
			],
		},
		{
			type: 'serifs',
			title: 'Define the serif style',
			letters: 'n',
			sliders: ['serifHeight', 'serifWidth', 'serifMedian'],
			name: 'Serifs',
			description: [
				'Serifs are key components of a typeface, because their height, width, and median directly affect the look of your typeface.',
				'',
				'By using thick slab serifs you’re able to design solid and sturdy fonts.',
				'Thin and sharp serifs will look great for elegant and refined letters.',
			],
		},
		{
			type: 'finish',
			title: 'Congratulations!',
			name: 'Finish',
			description: [
				'You’re doing great!',
				'You’ve prototyped your font. Let’s take it a step further and dive into the app to make it even better.',
				'If you get stuck at any point, we’re just a click away in your in-app chat. Also, the Academy tutorials might come in handy.',
			],
		},
	],
};

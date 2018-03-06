export default {
	steps: [
		{
			type: 'sliders',
			title: 'Define proportions',
			letters: 'Hamburgefonstiv',
			sliders: ['xHeight', 'width'],
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
		{
			type: 'sliders',
			title: 'Define ascenders and descenders',
			letters: 'bgft',
			sliders: ['ascender', 'descender'],
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
        },
        {
			type: 'sliders',
			title: 'Define style',
			letters: 'Hamburgefonstiv',
			sliders: ['thickness', '_contrast'],
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
		{
			type: 'sliders',
			title: 'Define aperture',
			letters: 'ages',
			sliders: ['aperture'],
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
		{
			type: 'alternates',
			title: 'Define alternates',
			letters: {
				97: 'Adam', // a
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
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
		{
			type: 'serifs',
			title: 'Define serifs',
			letters: 'n',
			sliders: ['serifHeight', 'serifWidth', 'serifMedian'],
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
		{
			type: 'finish',
			title: 'Congratulations!',
			description:
				'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
		},
	],
};

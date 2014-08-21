exports.parameters = [
	{
		tab: true,
		label: 'Func',
		icon: '...',
		parameters: [
			{
				name: 'xHeight',
				label: 'x Height',
				min: 300,
				max: 900,
				step: 1,
				init: 465,
				minAdvised: 300,
				maxAdvised: 800
			},
			{
				name: 'capDelta',
				label: 'Capital Height',
				min: 0,
				max: 400,
				step: 1,
				init: 233,
				minAdvised: 0,
				maxAdvised: 350
			},
			{
				name: 'ascender',
				label: 'Ascender',
				min: 50,
				max: 500,
				step: 1,
				init: 250,
				minAdvised: 50,
				maxAdvised: 500
			},
			{
				name: 'descender',
				label: 'Descender',
				min: -450,
				max: -50,
				step: 1,
				init: -210,
				minAdvised: -350,
				maxAdvised: -100
			},
			{
				name: 'crossbar',
				label: 'Crossbar',
				min: 0.8,
				max: 1.1,
				step: 0.001,
				init: 1,
				minAdvised: 0.88,
				maxAdvised: 1.05
			},
			{
				name: 'width',
				label: 'Width',
				min: 0.5,
				max: 2,
				step: 0.01,
				init: 1,
				minAdvised: 0.85,
				maxAdvised: 2
			},
			{
				name: 'slant',
				label: 'Slant',
				min: -5,
				max: 8,
				step: 0.2,
				init: 0,
				minAdvised: -5,
				maxAdvised: 8
			},
			{
				name: 'overshoot',
				label: 'Overshoot',
				min: 0,
				max: 20,
				step: 1,
				init: 10,
				minAdvised: 0,
				maxAdvised: 20
			}
		]
	},
	{
		tab: true,
		label: 'Style',
		icon: '...',
		parameters: [
			{
				name: 'thickness',
				label: 'Thickness',
				min: 10,
				max: 300,
				step: 1,
				init: 80,
				minAdvised: 60,
				maxAdvised: 180
			},
			{
				name: '_contrast',
				label: 'Contrast',
				min: -1,
				max: -0.1,
				step: 0.01,
				init: -1,
				minAdvised: -1,
				maxAdvised: -0.3
			},
			{
				name: 'aperture',
				label: 'Aperture',
				min: 0,
				max: 2.2,
				step: 0.01,
				init: 1,
				minAdvised: 0,
				maxAdvised: 2.2
			},
			{
				name: 'opticThickness',
				label: 'Optic thickness',
				min: 1,
				max: 2,
				step: 0.1,
				init: 1.1,
				minAdvised: 1,
				maxAdvised: 2
			},
			{
				name: 'roundness',
				label: 'Roundness',
				min: 1,
				max: 4,
				step: 0.1,
				init: 1,
				minAdvised: 1,
				maxAdvised: 1.5
			},
			{
				name: 'breakPath',
				label: 'Break Path',
				min: 0,
				max: 35,
				step: 0.1,
				init: 0,
				minAdvised: 0,
				maxAdvised: 35
			},
			{
				name: 'axis',
				label: 'axis',
				min: -90,
				max: 90,
				step: 1,
				init: 0,
				minAdvised: -30,
				maxAdvised: 30
			}
		]
	},
	{
		tab: true,
		label: 'Serif',
		icon: '...',
		parameters: [
			{
				name: 'serifWidth',
				label: 'Serif Width',
				min: 0,
				max: 200,
				step: 1,
				init: 0,
				minAdvised: 0,
				maxAdvised: 80
			},
			{
				name: 'serifHeight',
				label: 'Serif Height',
				min: 0,
				max: 200,
				step: 1,
				init: 0,
				minAdvised: 0,
				maxAdvised: 80
			},
			{
				name: 'serifMedian',
				label: 'Serif Median',
				min: -1,
				max: 2,
				step: 0.1,
				init: 0,
				minAdvised: -1,
				maxAdvised: 2
			},
			{
				name: 'serifCurve',
				label: 'Serif Curve',
				min: 0,
				max: 3,
				step: 0.01,
				init: 0,
				minAdvised: 0,
				maxAdvised: 3
			},
			{
				name: 'serifRoundness',
				label: 'Serif Curve Roundness',
				min: 0,
				max: 2,
				step: 0.01,
				init: 0.55,
				minAdvised: 0,
				maxAdvised: 2
			},
			{
				name: 'serifArc',
				label: 'Serif Arc',
				min: -0.5,
				max: 0.5,
				step: 0.01,
				init: 0,
				minAdvised: -0.5,
				maxAdvised: 0.5
			},
			{
				name: 'serifTerminal',
				label: 'Serif Terminal',
				min: -0.2,
				max: 1,
				step: 0.01,
				init: 0,
				minAdvised: -0.2,
				maxAdvised: 1
			},
			{
				name: 'serifTerminalCurve',
				label: 'Serif Terminal Curve',
				min: 0,
				max: 1.5,
				step: 0.01,
				init: 0.55,
				minAdvised: 0,
				maxAdvised: 1.5
			},
			{
				name: 'serifRotate',
				label: 'Serif Rotation',
				min: -35,
				max: 15,
				step: 1,
				init: 0,
				minAdvised: -35,
				maxAdvised: 15
			},
			{
				name: 'terminalBall',
				label: 'Terminal Ball',
				min: 0,
				max: 1,
				step: 0.01,
				init: 0,
				minAdvised: 0,
				maxAdvised: 1
			}
		]
	}
];

exports.calculated = {
	capHeight: 'xHeight + capDelta',
	contrast: '_contrast * -1',
	ascenderHeight: 'xHeight + ascender'
};

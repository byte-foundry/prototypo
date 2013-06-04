'use strict';

angular.module('prototyp0.sliders', [])
	.constant('slidersUI', [
		{
			name: 'serifWidth',
			label: 'Serif Width',
			min: 0,
			max: 100,
			step: 1,
			init: 0
		},
		{
			name: 'serifHeight',
			label: 'Serif Height',
			min: 0,
			max: 50,
			step: 1,
			init: 0
		},
		{
			name: 'serifMedian',
			label: 'Serif Median',
			min: 0,
			max: 2,
			step: 0.1,
			init: 1
		},
		{
			name: 'serifCurve',
			label: 'Serif Curve',
			min: -0.1,
			max: 1.1,
			step: 0.01,
			init: 0
		},
		{
			name: 'serifArc',
			label: 'Serif Arc',
			min: -1,
			max: 1,
			step: 0.1,
			init: 0
		},
		{
			name: 'serifTerminal',
			label: 'Serif Terminal',
			min: -0.2,
			max: 1,
			step: 0.01,
			init: 0
		},
		{
			name: 'serifSymmetry',
			label: 'Serif Symmetry',
			min: 0,
			max: 1,
			step: 0.01,
			init: 0
		},
		{
			name: 'xHeight',
			label: 'x Height',
			min: 200,
			max: 600,
			step: 1,
			init: 465
		},
		{
			name: 'capDelta',
			label: 'Capital Height',
			min: 0,
			max: 200,
			step: 1,
			init: 50
		},
		{
			name: 'ascender',
			label: 'Ascender',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'descender',
			label: 'Descender',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'crossbar',
			label: 'Crossbar',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'thickness',
			label: 'Thickness',
			min: -70,
			max: 200,
			step: 1,
			init: 80
		},
		{
			name: 'width',
			label: 'Width',
			min: 0,
			max: 200,
			step: 1,
			init: 0
		},
		{
			name: 'slant',
			label: 'Slant',
			min: -5,
			max: 8,
			step: 0.2,
			init: 0
		},
		{
			name: 'vertContrast',
			label: 'Vertical Contrast',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'horzContrast',
			label: 'horizontal Contrast',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'contrast',
			label: 'Contrast',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'breakPath',
			label: 'Break Path',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'counter',
			label: 'Counter',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'inktrap',
			label: 'Inktrap',
			min: 0,
			max: 20,
			step: 1,
			init: 0
		},
		{
			name: 'roundness',
			label: 'Roundness',
			min: 0,
			max: 1,
			step: 0.01,
			init: 0.55
		}
	])

	// make sure all sliders vales are numbers and combine some values
	.factory('slidersWatcher', function( _ ) {
		return function( sliders ) {
			_( sliders ).each(function(slider, name) {
				sliders[name] = +slider;
			});

			/*if ( sliders.xHeight !== undefined ) {
				sliders.capHeight = sliders.xHeight + sliders.capDelta;
				sliders.ascenderHeight = sliders.xHeight + sliders.ascender;
			}*/
		};
	});
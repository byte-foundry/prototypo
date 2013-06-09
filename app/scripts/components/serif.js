'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['serif'] = {
			formula: {
				0: 'vm 0 20',
				1: 'L {{ find({y: self[0].y + 20, on:params.on }) }}',
				2: 'l  -40 -20',
				3: 'l  0 -20',
				invert: true
			}
		};

		components['invertedSerif'] = {
			formula: {
				0: 'vm 0 -20',
				1: 'L {{ find({y: self[0].y - 20, on:params.on }) }}',
				2: 'l  -40 20',
				3: 'l  0 20',
				invert: false
			}
		};

		components['test'] = {
			formula: {
				0: 'vm 0 0',
				1: 'l -20 20',
				2: 'l -20 -20',
				invert: true
			}
		};
	});
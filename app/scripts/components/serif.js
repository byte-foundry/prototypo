'use strict';

angular.module('prototyp0.components')
	.config(function( components ) {
		components['serif'] = {
			formula: {
				$hDir: '/left$/.test(params.side) ? -1 : 1',
				$vDir: '/^top/.test(params.side) ? -1 : 1',

				0: 'vm 0 {{ 20 * $vDir }}',
				1: 'L {{ find({y: self[0].y + 20 * $vDir, on:params.on }) }}',
				2: 'l  {{ 40 * $hDir }} {{ -20 * $vDir }}',
				3: 'l  0 {{ -20 * $vDir }}',

				invert: '( $vDir * $hDir ) == -1'
			}
		};
	});
'use strict';

angular.module('prototyp0.segmentUtils', [])
	.constant('segmentMethods', {})

	.config(function( segmentMethods ) {
		segmentMethods.find = function( params ) {
			var start = params.on[0],
				end = params.on[1],
				vector = {
					x: end.x - start.x,
					y: end.y - start.y
				},
				point = params.x ?
					[ params.x, ( params.x - start.x ) / vector.x * vector.y + start.y ]:
					[ ( params.y - start.y ) / vector.y * vector.x + start.x, params.y ];

			return point.join(' ');
		};
	});
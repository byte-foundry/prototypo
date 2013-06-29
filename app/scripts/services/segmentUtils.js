'use strict';

angular.module('prototyp0.segmentUtils', [])
	.constant('segmentMethods', {})

	.factory('findOnBezier', function( segmentMethods ) {
		return segmentMethods.findOnBezier = function( params ) {
			var start = params.on[0],
				end = params.on[1],
				// intermediate points
				tmp1 = {
					x: start.x + ( end.controls[0].x - start.x ) * params.t,
					y: start.y + ( end.controls[0].y - start.y ) * params.t,
				},
				tmp2 = {
					x: start.x + ( end.controls[1].x - start.x ) * params.t,
					y: start.y + ( end.controls[1].y - start.y ) * params.t,
				};

				//console.log( [].indeOf.apply( this.self, [params.on[0]] ) )
				//control1 =
			// find coordinates of a point at a given percentage on a bezier

		};
	})

	.factory('findOnLineSegment', function( segmentMethods ) {
		return segmentMethods.find = function( params ) {
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
	})/*

	.config('pointOnStraightSegmentFromPercentage', function(start, end, percentage) {

	})*/;
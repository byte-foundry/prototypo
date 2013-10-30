'use strict';

angular.module('prototyp0.segmentUtils', [])
	.constant('segmentMethods', {})

	.factory('segment', function() {
		//function Segment()
	})

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
	})/*

	.config('findOnBezier', function( params ) {
		var start = params.on[0],
			end = params.on[1];

			console.log( [].indeOf.apply( this.self, [params.on[0]] ) )
			//control1 =
		// find coordinates of a point at a given percentage on a bezier
	});

	.config('pointOnStraightSegmentFromPercentage', function(start, end, percentage) {

	})*/;
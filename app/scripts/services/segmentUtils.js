'use strict';

angular.module('prototypo.segmentUtils', [])
	.constant('segmentMethods', {})

	.factory('Segment', function() {
		var rseparator = /[ ,]+/g;

		function Segment( processedSegment, origin ) {
			var segmentArray = processedSegment.replace(rseparator, ' ').split(' ');


		}

		return Segment;
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

	.config('pointOnStraightSegmentFromPercentage', function(start, end, percentage) {

	})*/;
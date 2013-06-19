'use strict';

angular.module('prototyp0.controlpointDirective', [])
	.directive('segmentControl', function() {
		return function( scope, element ) {
			scope.$watch('control', function( control ) {
				// find related endPoint
				/*var segmentIndex = scope.processedSegment.indexOf( scope.segment ),
					controlIndex = scope;*/

				element.attr('d',
					'M ' + control.x + ',' + control.y +
					'm 0 2' +
					'h 2' +
					'v -4' +
					'h -4' +
					'v 4' +
					'z' +
					'm 0 -2'
				);

				if ( scope.segment.command === '*' ) {
					element.attr('fill', 'orange');
				}
			});
		};
	});
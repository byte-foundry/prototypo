'use strict';

angular.module('prototypo.controlpointDirective', [])
	.directive('segmentControl', function() {
		return function( scope, element ) {
			scope.$watch('control', function( control ) {
				// find related endPoint
				var segmentIndex = scope.processedGlyph.indexOf( scope.segment ),
					controlIndex = [].indexOf.call( scope.segment.controls, control ),
					endpoint = scope.processedGlyph[ segmentIndex - 1 + controlIndex ] || {
						x:  0,
						y: 0
					};

				element.attr('d',
					'M ' + endpoint.x + ',' + endpoint.y +
					'L ' + control.x + ',' + control.y +
					'Z' +
					'M ' + ( control.x -2 ) + ',' + control.y +
					'l  2  2' +
					'l  2 -2' +
					'l -2 -2' +
					'Z'
				);

				if ( scope.segment.command === '*' ) {
					element.attr('fill', 'orange');
				}
			});
		};
	});
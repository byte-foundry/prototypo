'use strict';

angular.module('prototyp0.controlpointDirective', [])
	.directive('segmentControl', function() {
		return function( scope, element, attrs ) {
			scope.$watch('processedGlyph[' + attrs.index + ']', function( segment ) {
				element.attr('d',
					'M ' + segment.xy +
					'm 0 2' +
					'h 2' +
					'v -4' +
					'h -4' +
					'v 4' +
					'z' +
					'm 0 -2'
				);

				if ( segment.command === '*' ) {
					element.attr('fill', 'green');
				}
			});
		};
	});
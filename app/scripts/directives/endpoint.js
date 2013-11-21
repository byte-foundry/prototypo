'use strict';

angular.module('prototypo.endpointDirective', [])
	.directive('segmentEndpoint', function() {
		return function( scope, element, attrs ) {
			scope.$watch('processedGlyph[' + attrs.index + ']', function( segment ) {
				if ( segment.length === 1 ) {
					return;
				}

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
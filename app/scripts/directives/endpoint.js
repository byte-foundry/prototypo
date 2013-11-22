'use strict';

angular.module('prototypo.endpointDirective', [])
	.directive('segmentEndpoint', function() {
		return function( $scope, $element, $attrs ) {
			$attrs.$observe('coords', function( coords ) {

				$element.attr('d', [
					'M ', coords,
					'm 0 2',
					'h 2',
					'v -4',
					'h -4',
					'v 4',
					'z',
					'm 0 -2'
				].join(' '));

				/*if ( segment.command === '*' ) {
					element.attr('fill', 'green');
				}*/
			});
		};
	});
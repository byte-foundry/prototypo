'use strict';

angular.module('prototypo.endpointDirective', [])
	.directive('segmentEndpoint', function() {
		return function( $scope, $element, $attrs ) {
			$attrs.$observe('coords', function( coords ) {
				var tmp = coords.trim().split(' ');

				if ( tmp.length === 4 ) {
					$element.attr('d', [
						'M ' + tmp[0] + ',' + tmp[1],
						'L ' + tmp[2] + ',' + tmp[3],
						'Z',
						'M ' + ( tmp[2] -2 ) + ',' + tmp[3],
						'l  2  2',
						'l  2 -2',
						'l -2 -2',
						'Z'
					].join(' '));

				} else {
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
				}

				/*if ( segment.command === '*' ) {
					element.attr('fill', 'green');
				}*/
			});
		};
	});
'use strict';
angular.module('angular.nginput', [])
	.directive('ngInput',function( $parse ) {
		return {
			compile: function($element, attr) {
				var fn = $parse(attr['ng-input']);

				return function( scope, element ) {
					element.on('input', function( event ) {
						scope.$apply(function() {
							fn(scope, { $event:event });
						});
					});
				};
			}
		};
	});
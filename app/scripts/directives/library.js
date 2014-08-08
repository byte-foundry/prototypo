'use strict';

angular.module('prototypo.libraryDirective', [])
	.directive('library', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/library.html',
			replace: true,
			link: function postLink( /*$scope, $element*/ ) {
			}

		};
	});
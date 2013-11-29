'use strict';

angular.module('prototypo.glyphDirective', [])
	.directive('glyph', function() {
		return {
			//priority: 0,
			//template: '<div></div>',
			templateUrl: 'views/glyph.html',
			//replace: true,
			//transclude: false,
			restrict: 'EA',
			//scope: false,
			// FIXME: this controller's logic can probably
			// be implemented using the scope attribute above
			controller: function() {}
		};
	});
'use strict';

angular.module('prototyp0.glyphDirective', [])
	.directive('glyph', function( processGlyph ) {
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
			controller: function( $scope, $element, $attrs ) {
				// FIXME: we shouldn't need this check
				if ( !$scope.$parent ) {
					return;
				}

				var processGlyphTrigger = function() {
					// FIXME: we shouldn't need this check
					if ( !$scope.$parent ) {
						return;
					}

					$scope.processedGlyph = processGlyph(
						$scope.$parent.currentFont,
						$attrs.glyphCode,
						$scope.$parent.controlValues
					);
				};

				$attrs.$observe('glyph-code', processGlyphTrigger);
				$scope.$parent.$watch('controlValues', processGlyphTrigger, true);
				$scope.$parent.$watch('currentFont', processGlyphTrigger, true);

			}
			//link: function( scope, iElement, iAttrs ) {}
		};
	});
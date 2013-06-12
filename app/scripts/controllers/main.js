'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, _, processGlyph, loadFont ) {
		var deferedChanges = [];

		$scope.currentFontName = 'default';
		$scope.processGlyph = processGlyph;

		$scope.$watch('currentFontName', function() {
			loadFont( $scope.currentFontName )
				.then(function( font ) {
					$scope.currentFont = font;
					$scope.currentGlyphCode = font.order[0];
					$scope.inputValues = {};
					$scope.deferChange = function( handler ) {
						deferedChanges.push( handler );
					};
				});
		});

		$scope.$watch('currentGlyphCode', function() {
			if ( $scope.currentFont && $scope.currentGlyphCode ) {
				$scope.currentGlyph = $scope.currentFont.glyphs[ $scope.currentGlyphCode ];
			}
		});

		// make sure all input values are integers
		$scope.$watch('inputValues', function() {
			_( $scope.inputValues ).each(function(value, key) {
				$scope.inputValues[key] = +value;
			});

			_( deferedChanges ).each(function( handler ) {
				handler( $scope.inputValues );
			});
			deferedChanges = [];
		}, true);
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {

		$scope.$watch('currentGlyphCode', function() {
			$scope.$parent.$parent.currentGlyphCode = $scope.currentGlyphCode;
		});
	});
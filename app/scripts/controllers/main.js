'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, _, processGlyph, loadFont ) {
		var deferedChanges = [];

		$scope.currentFontName = 'default';
		$scope.currentGlyphCodes = [];

		$scope.$watch('currentFontName', function() {
			loadFont( $scope.currentFontName )
				.then(function( font ) {
					$scope.currentFont = font;
					$scope.inputValues = {};

					$scope.currentGlyphCodes = [font.order[0]];
					$scope.deferChange = function( handler ) {
						deferedChanges.push( handler );
					};
				});
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
		$scope.currentGlyphCodes = [];

		$scope.$watch('currentGlyphCodes[0]', function() {
			$scope.$parent.$parent.currentGlyphCodes = $scope.currentGlyphCodes;
		});
	});
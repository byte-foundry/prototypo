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
					$scope.controlValues = {};

					$scope.currentGlyphCodes = [font.order[0]];
					$scope.deferChange = function( handler ) {
						deferedChanges.push( handler );
					};
				});
		});

		// make sure all control values are integers
		$scope.$watch('controlValues', function() {
			_( $scope.controlValues ).each(function(value, key) {
				$scope.controlValues[key] = +value;
			});

			_( deferedChanges ).each(function( handler ) {
				handler( $scope.controlValues );
			});
			deferedChanges = [];
		}, true);
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {
		$scope.$watch('currentGlyphCodes[0]', function() {
			$scope.$parent.$parent.currentGlyphCodes = $scope.currentGlyphCodes;
		});
	});
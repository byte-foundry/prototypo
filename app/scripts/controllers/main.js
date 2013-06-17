'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, _, processGlyph, loadFont, ControlValues ) {
		var deferredChanges = [];

		$scope.currentFontName = 'default';
		$scope.currentGlyphCodes = [];

		$scope.$watch('currentFontName', function() {
			loadFont( $scope.currentFontName )
				.then(function( font ) {
					$scope.currentFont = font;

					// load default or saved control values
					$scope.controlValues = {};
					ControlValues.get({ font: $scope.currentFontName })
						.then(function( controlValues ) {
							// load initial values if none have been saved
							if ( Object.keys( controlValues ).length === 0 ) {
								_( font.controls ).each(function(definition) {
									controlValues[ definition.name ] = definition.init;
								});
							}

							$scope.controlValues = controlValues;
						});

					$scope.currentGlyphCodes = [font.order[0]];
					$scope.deferChange = function( handler ) {
						deferredChanges.push( handler );
					};
				});
		});

		// make sure all control values are integers
		$scope.$watch('controlValues', function() {
			_( $scope.controlValues ).each(function(value, key) {
				$scope.controlValues[key] = +value;
			});

			_( deferredChanges ).each(function( handler ) {
				handler( $scope.controlValues );
			});
			deferredChanges = [];

			ControlValues.save({
				font: $scope.currentFontName,
				values: $scope.controlValues
			});
		}, true);
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {
		$scope.$watch('currentGlyphCodes[0]', function() {
			$scope.$parent.$parent.currentGlyphCodes = $scope.currentGlyphCodes;
		});
	});
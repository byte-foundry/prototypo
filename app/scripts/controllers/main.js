'use strict';

angular.module('prototypoApp')
	.controller('MainCtrl', function( $scope, _, loadFont, ControlValues, AppValues, Font, Point ) {
		var deferredChanges = [];

		$scope.currentFontName = 'default';
		//$scope.currentGlyphCodes = [];

		$scope.$watch('currentFontName', function( name ) {
			loadFont( $scope.currentFontName )
				.then(function( font ) {
					$scope.currentFontUI = font;

					$scope.deferChange = function( handler ) {
						deferredChanges.push( handler );
					};

					// load default or saved control values
					$scope.controlValues = {};
					$scope.resetControlValues = function() {
						ControlValues.getDefault()
							.then(function( values ) {
								$scope.controlValues = values;
							});
					};
					ControlValues.get({ font: $scope.currentFontName })
						.then(function( controlValues ) {
							$scope.controlValues = controlValues;

							// we need the controlValues to build & init the font
							$scope.currentFont = Font( name, {
								glyphCodes: font.order,
								glyphFormulas: font.glyphs,
								componentFormulas: font.components,
								controls: controlValues,
							});
						});

					// load default or saved app values
					$scope.appValues = {};
					$scope.resetAppValues = function() {
						AppValues.getDefault()
							.then(function( values ) {
								$scope.appValues = values;
							});
					};
					AppValues.get({ font: $scope.currentFontName })
						.then(function( appValues ) {
							$scope.appValues = appValues;
						});
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

			if ( $scope.currentFont ) {
				$scope.processedGlyph = $scope.currentFont.process( $scope.appValues.glyphCodes );
			}
		}, true);

		// when we try to watch '[appValues.glyphCodes,controlsValues]' we reach the 10 digest limit
		// todo: find out why
		$scope.$watch('appValues.glyphCodes[0]', function() {
			if ( $scope.currentFont ) {
				$scope.processedGlyph = $scope.currentFont.process( $scope.appValues.glyphCodes );
			}
		});

		$scope.$watch('appValues', function() {
			AppValues.save({
				font: $scope.currentFontName,
				values: $scope.appValues
			});
		}, true);
	});

	/*// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {
		/*$scope.$watch('userValues.glyphCodes[0]', function() {
			$scope.$parent.$parent.userValues.glyphCodes = $scope.userValues.glyphCodes;
		});
	});*/
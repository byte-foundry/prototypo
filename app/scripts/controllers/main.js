'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, _, processGlyph, loadFont, ControlValues, AppValues ) {
		var deferredChanges = [];

		$scope.currentFontName = 'default';
		//$scope.currentGlyphCodes = [];

		$scope.$watch('currentFontName', function() {
			loadFont( $scope.currentFontName )
				.then(function( font ) {
					$scope.currentFont = font;

					$scope.deferChange = function( handler ) {
						deferredChanges.push( handler );
					};

					// load default or saved control values
					$scope.controlValues = {};
					$scope.resetControlValues = function() {
						$scope.controlValues = ControlValues.getDefault();
					};
					ControlValues.get({ font: $scope.currentFontName })
						.then(function( controlValues ) {
							$scope.controlValues = controlValues;
						});

					// load default or saved app values
					$scope.appValues = {};
					$scope.resetAppValues = function() {
						$scope.appValues = AppValues.getDefault();
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
		}, true);

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
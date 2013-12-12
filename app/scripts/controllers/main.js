'use strict';

angular.module('prototypoApp')
	.controller('MainCtrl', function( $scope, $routeParams, $parse, $q, Typeface, FontValues, AppValues, Font ) {
		var calculated = [];
		function updateCalculatedParams( values ) {
			calculated.forEach(function( param ) {
				if ( $scope.fontValues ) {
					$scope.fontValues[ param.name ] = param.calculate( values );
				}
			});
		}

		// initial state
		$scope.typeface = {};
		$scope.fontValues = {};
		$scope.appValues = {
			paramTab: 0
		};
		$scope.processGlyphs = function() {
			$scope.glyph = $scope.font.process( $scope.appValues.glyphName, true );
			$scope.$digest();
		};

		Typeface.get( $routeParams.typeface )
			/*
			 * 1. Download typeface data
			 */
			.then(function( data ) {
				// filter params that are calculated and have no UI
				data.parameters = data.parameters.filter(function( group ) {
					if ( group.vars ) {
						group.parameters.forEach(function( param ) {
							param.calculate = $parse( param.calculate );
							calculated.push( param );
						});
						return false;
					}
					return true;
				});
				// keep calculated params updated
				$scope.$watch('fontValues',	updateCalculatedParams,	true);

				$.extend( $scope.typeface, data );

				return data;
			})

			/*
			 * 2. Load font and app values
			 */
			.then(function( typeface ) {
				var promises = [];

				/*
				 * 2.1 Font values
				 */
				$scope.$watch('fontValues', function() {
					// make sure all control values are integers
					// todo: that should be handled by the directive
					/*_( $scope.fontValues ).each(function(value, key) {
						$scope.fontValues[key] = +value;
					});*/

					// persist changes
					FontValues.save({
						typeface: $routeParams.typeface,
						values: $scope.fontValues
					});
				// deep watch
				}, true);

				$scope.resetFontValues = function() {
					$scope.typeface.parameters.forEach(function( group ) {
						group.parameters.forEach(function( param ) {
							$scope.fontValues[ param.name ] = param.init;
						});
					});
					updateCalculatedParams( $scope.fontValues );
				};

				promises.push( FontValues.get({ typeface: $routeParams.typeface })
					.then(function( data ) {

						if ( data === undefined ) {
							$scope.resetFontValues();

						} else {
							$.extend( $scope.fontValues, data );
						}

						// we can prepare the font
						$scope.font = Font( name, {
							glyphCodes: typeface.order,
							glyphFormulas: typeface.glyphs,
							componentFormulas: typeface.components,
							parameters: $scope.fontValues,
						});
					}));

				/*
				 * 2.2 App values
				 */
				$scope.$watch('appValues', function() {
					// persist changes
					AppValues.save({
						typeface: $routeParams.typeface,
						values: $scope.appValues
					});
				}, true);

				$scope.resetAppValues = function() {
					$scope.appValues.glyphName = Object.keys( $scope.typeface.order )[0];
					$scope.appValues.paramTab = 0;
				};

				promises.push( AppValues.get({ typeface: $routeParams.typeface })
					.then(function( data ) {
						$scope.appValues = {};

						if ( data === undefined || !( data.glyphName in $scope.typeface.order ) ) {
							$scope.resetAppValues();

						} else {
							$.extend( $scope.appValues, data );
						}
					}));

				return $q.all( promises );
			})
			/*
			 * 3. Watch font and app values to process the glyphs
			 */
			.then(function() {
				$scope.$watch('fontValues', function() {
					$scope.glyph = $scope.font.process( $scope.appValues.glyphName );
				// deep
				}, true);

				$scope.$watch('appValues.glyphName', function() {
					$scope.glyph = $scope.font.process(
						$scope.appValues.glyphName,
						// full
						true
					);
				});
			});
	});

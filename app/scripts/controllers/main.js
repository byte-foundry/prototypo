'use strict';

angular.module('prototypoApp', ['ngRoute', 'prototypo.Typeface'])
	.controller('MainCtrl', function( $scope, $routeParams, $parse, $q, _, Typeface, FontValues, AppValues, Font ) {
		Typeface.get({ typeface: $routeParams.typeface })
			/*
			 * 1. Download typeface data
			 */
			.then(function( data ) {
				var calculated = [];
				// filter params that are calculated and have no UI
				data.parameters.forEach(function( param, i ) {
					if ( param.calculate ) {
						param.calculate = $parse( param.calculate );
						calculated.push(param);
						delete data.parameters[i];
					}
				});
				// keep them updated
				$scope.$watch('fontValues', function( values ) {
					calculated.forEach(function( param ) {
						if ( $scope.fontValues ) {
							$scope.fontValues[ param.name ] = param.calculate( values );
						}
					});
				// deep watch
				}, true);

				$scope.typeface = data;

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
					_( $scope.fontValues ).each(function(value, key) {
						$scope.fontValues[key] = +value;
					});

					// persist changes
					FontValues.save({
						parameters: $scope.fontValues
					});
				// deep watch
				}, true);

				$scope.resetFontValues = function() {
					$scope.typeface.parameters.forEach(function( param ) {
						$scope.fontValues[ param.name ] = param.init;
					});
				};

				promises.push( FontValues.get({ typeface: $routeParams.typeface })
					.then(function( data ) {
						$scope.fontValues = {};

						if ( data === undefined ) {
							$scope.resetFontValues();

						} else {
							data.parameters.forEach(function( param ) {
								$scope.fontValues[ param.name ] = param.init;
							});
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
					AppValues.save( $scope.appValues );
				}, true);

				$scope.resetAppValues = function() {
					$scope.appValues.glyphName = $scope.typeface.order[0];
				};

				promises.push( AppValues.get({ typeface: $routeParams.typeface })
					.then(function( data ) {
						$scope.appValues = {};

						if ( data === undefined || $scope.typeface.order.indexOf( data.glyphName ) === -1 ) {
							$scope.resetAppValues();

						} else {
							$scope.appValues = data;
						}
					}));

				return $q.all( promises );
			})
			/*
			 * 3. Watch font and app values to process the glyphs
			 */
			.then(function() {
				$scope.$watch(['fontValues','appValues.glyphName'], function() {
					console.log('watcher, will process');
					$scope.glyph = $scope.font.process( $scope.appValues.glyphName );
				// deep watch
				}, true);
			});
	});

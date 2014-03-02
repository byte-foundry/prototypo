'use strict';

angular.module('prototypoApp')
	.controller('MainCtrl', function( $scope, $routeParams, $parse, $q, Typeface, FontValues, AppValues, Font, Glyph ) {
		var calculated = [];
		function updateCalculatedParams( values ) {
			calculated.forEach(function( param ) {
				if ( $scope.fontValues ) {
					$scope.fontValues[ param.name ] = param.calculate( values );
				}
			});
		}

		/* initial state */
		// agregated content of json files
		$scope.typeface = {};
		// font parameters values
		$scope.fontValues = {};
		// app values
		var initialAppValues = {
			showSplash: true,
			viewMode: 'single',
			invertedFont: false,
			displayNodes: false,
			outlineOnly: false,
			negative: false,
			displayGrid: true,
			displayGuideLines: true,
			displaySpacing: false,
			paramTab: 0,
			zoom: 1.5,
			scenePanX: -120,
			scenePanY: 0,
			stringChars: 'Hamburgfonstiv',
			currentPreset: 'Sans-serif'
		};
		$scope.appValues = {};
		$scope.allChars = {};
		$scope.allGlyphs = {};
		$scope.allOutlines = {};
		$scope.zoom = function( val ) {
			if ( val === 0 ) {
				$scope.appValues.zoom = 1;
			} else {
				$scope.appValues.zoom =
					Math.min( Math.max( $scope.appValues.zoom + ( val > 0 ? -0.15 : +0.15 ), 0.3 ), 7);
			}
		};
		$scope.changeViewMode = function( mode ) {
			$scope.appValues.viewMode = mode;
			return mode;
		};
		$scope.exportToSVG = function() {
			saveAs(
				new Blob(
					[$scope.font.toDotSVG( $scope.fontValues )],
					{type: 'application/svg+xml;charset=utf-8'}
				),
				'default.svg'
			);

			// dependency-free exporter, to test.
			/*var reader = new FileReader();
			reader.onloadend = function() {
				window.location = reader.result;
			};
			reader.readAsDataURL(new Blob(
				[$scope.font.toDotSVG( $scope.fontValues )],
				{type: 'application/svg+xml;charset=utf-8'}
			));*/
		};
		$scope.applyPreset = function( name ) {
			// the svg path shouldn't be merged to fontValues and its no longer necessary
			delete $scope.typeface.presets[name].svg;

			$scope.appValues.currentPreset = name;
			$.extend( $scope.fontValues, $scope.typeface.presets[name] );

			$scope.$apply();
		};
		$scope.resetApp = function() {
			localStorage.clear();
			window.location.reload();
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

				// calculate presets
				for ( var i in data.presets ) {
					calculated.forEach(function( param ) {
						data.presets[i][ param.name ] = param.calculate( data.presets[i] );
					});
				}

				// keep calculated params updated
				$scope.$watchCollection( 'fontValues', updateCalculatedParams );

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
				$scope.$watchCollection('fontValues', function() {
					// persist changes
					FontValues.save({
						typeface: $routeParams.typeface,
						values: $scope.fontValues
					});
				});

				$scope.resetFontValues = function() {
					$scope.typeface.parameters.forEach(function( group ) {
						group.parameters.forEach(function( param ) {
							$scope.fontValues[ param.name ] = param.init;
						});
					});
					updateCalculatedParams( $scope.fontValues );
				};

				promises.push( FontValues.get({ typeface: $routeParams.typeface })
					.then(
						function done( data ) {
							$.extend( $scope.fontValues, data );

						}, function fail() {
							$scope.resetFontValues();
						}

					).always(function() {
						// we can prepare the font
						$scope.font = Font( name, {
							glyphData: typeface.order,
							glyphFormulas: typeface.glyphs,
							componentFormulas: typeface.components,
							parameters: $scope.fontValues,
						});
					}));

				/*
				 * 2.2 App values
				 */
				$scope.$watchCollection('appValues', function() {
					// persist changes
					AppValues.save({
						typeface: $routeParams.typeface,
						values: $scope.appValues
					});
				});

				$scope.resetAppValues = function() {
					$scope.appValues = $.extend($scope.appValues, initialAppValues);
					$scope.appValues.singleChar = Object.keys( $scope.typeface.order )[0];
				};

				promises.push( AppValues.get({ typeface: $routeParams.typeface })
					.then(
						function done( data ) {
							if ( !( data.singleChar in $scope.typeface.order ) ) {
								$scope.resetAppValues();
							} else {
								$.extend( $scope.appValues, initialAppValues, data );
							}
						}, function fail() {
							$scope.resetAppValues();
						}
					));

				return $q.all( promises );
			})
			/*
			 * 3. Draw presets
			 */
			.finally(function() {
				for ( var i in $scope.typeface.presets ) {
					var glyph = Glyph( 'sample', {
							data: { left: 0 },
							params: $.extend( {}, $scope.fontValues, $scope.typeface.presets[i] ),
							formulaLib: $scope.font.formulaLib
						});

					$scope.typeface.presets[i].svg = glyph.toSVG();
				}
			})
			/*
			 * 4. Watch font and app values to process the glyphs
			 */
			.finally(function() {
				var timeout;
				$scope.$watchCollection('fontValues', function() {
					// debounced full read
					clearTimeout( timeout );
					timeout = setTimeout(function() {
						$scope.puid = Math.random();
						for ( var char in $scope.allChars ) {
							$scope.allGlyphs[char] = $scope.font.read( char, $scope.fontValues, true );
						}
						$scope.$digest();
					}, 100);

					$scope.puid = Math.random();
					for ( var char in $scope.allChars ) {
						$scope.allGlyphs[char] = $scope.font.read( char, $scope.fontValues );
					}
				});

				$scope.$watch('appValues.stringChars + appValues.singleChar', function( string ) {
					var chars = {};

					string.split('').forEach(function( char ) {
						chars[ char ] = true;
					});

					$scope.allChars = chars;
				});

				$scope.$watch('allChars', function( newVal, oldVal ) {
					$scope.puid = Math.random();

					for ( var char in newVal ) {
						if ( !oldVal[char] || newVal === oldVal ) {
							$scope.allGlyphs[char] = $scope.font.read( char, $scope.fontValues, true );
						}
					}
				// deep
				}, true);
			});
	});
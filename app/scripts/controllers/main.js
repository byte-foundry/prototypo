'use strict';

angular.module('prototypoApp')
	.controller('MainCtrl', function( $scope, $routeParams, $parse, $q, History, Typeface, FontValues, AppValues, LibraryValues, Font, Glyph ) {
		var calculated = [];

		function updateCalculatedParams( values ) {
			if ( values && Object.keys( values ).length ) {
				calculated.forEach(function( param ) {
					$scope.fontValues[ param.name ] = param.calculate( values );
				});
			}
		}

		window.resetValues = function() {
			$scope.resetAppValues();
			$scope.resetFontValues();
			$scope.$apply();
		};

		/* initial state */
		// agregated content of json files
		$scope.typeface = {};
		// all fonts values
		$scope.libraryValues = {};
		// font parameters values
		$scope.fontValues = {};
		// app values
		var initialAppValues = {
			showFontVersions: true,
			showTrackInfo: true,
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
		// $scope.fontValues.saveFont = [];
		$scope.allChars = {};
		$scope.allGlyphs = {};
		$scope.allOutlines = {};

		$scope.debug = function() {
			// console.log($scope.fontValues);
			// console.log($scope.appValues);
			console.log($scope.libraryValues);
			// console.log($scope.libraryValues.typefaceName);
		};

		$scope.saveCurrent = function() {

			// console.log($scope.fontValues.saveFont.lenght);
			var save = {};
				// version = $scope.fontValues.saveFont.length + 1,
				// title = 'version #' + version;
				// save['title'] = title;

			$scope.typeface.parameters.forEach(function( group ) {
				group.parameters.forEach(function( param ) {
					save[ param.name ] = $scope.fontValues[ param.name ];
				});
			});

			// $scope.fontValues.saveFont.push( save );
			$scope.libraryValues.variants[0].versions.push( save );
			//console.log(old);
			// $scope.libraryValues.variants[0].versions.push( save );
		};


		$scope.loadVersion = function() {
			// $scope.typeface.parameters.forEach(function( group ) {
			// 	group.parameters.forEach(function( param ) {
			// 		save[ param.name ] = $scope.fontValues[ param.name ];
			// 	});
			// });
		};

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
		// export fonts via http://onlinefontconverter.com API
		$scope.exportFont = function( format ) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'https://ofc.p.mashape.com/directConvert/', true);

			xhr.setRequestHeader('X-Mashape-Authorization', 'HpnoZhEC5AmdsUaFtNpf2WPv0vLoT4LT');
			xhr.responseType = 'arraybuffer';

			xhr.onload = function() {
				saveAs(
					new Blob(
						[xhr.response],
						{type: 'application/octet-stream'}
					),
					'font.zip'
				);
			};
			try { 
				var data = new FormData(),
				font = new Blob(
					[$scope.font.toDotSVG( $scope.fontValues )],
					{type: 'application/svg+xml;charset=utf-8'}
				);
			data.append( 'file', font );
			data.append( 'format', format );

			xhr.send( data );

			} catch (e) {
				console.log(e);
			}
			return false;
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

		$scope.hardReset = function() {
			$scope.resetAppValues();
			$scope.resetFontValues();
			localStorage.clear();
			hoodie.store.removeAll('fontvalues')
			  	.done(function (objects) {
				  	FontValues.save({
							typeface: $routeParams.typeface,
							values: $scope.fontValues
						});
				  	// $scope.fontValues.saveFont = [];
				});
			hoodie.store.removeAll('appvalues')
			  	.done(function (objects) {
				  	AppValues.save({
							typeface: $routeParams.typeface,
							values: $scope.appValues
						});
				});
			window.location.reload();
		};

		$scope.updateCalculatedParams = updateCalculatedParams;

		Typeface.get( 'default' )
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
			 * 2. Load font, app & library values
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

					// we can prepare the font
					).always(function() {
						// try user values first
						try {
							$scope.font = Font( name, {
								glyphData: typeface.order,
								glyphFormulas: typeface.glyphs,
								componentFormulas: typeface.components,
								parameters: $scope.fontValues
							});

						// fallback to default values
						} catch (e) {
							console.error('corrupted font values');
							$scope.resetFontValues();
							$scope.font = Font( name, {
								glyphData: typeface.order,
								glyphFormulas: typeface.glyphs,
								componentFormulas: typeface.components,
								parameters: $scope.fontValues
							});
						}
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

				promises.push( AppValues.get({ typeface: 'default' })
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

			/*
			 * 2.3 Library values
			 */
			 $scope.$watchCollection('libraryValues', function() {
					// persist changes
					LibraryValues.save({
						typeface: $routeParams.typeface,
						values: $scope.libraryValues
					});
				});

				$scope.resetLibraryValues = function() {
					$scope.libraryValues = [];
				};

				promises.push( LibraryValues.get({ typeface: 'default' })
					.then(
						function done( data ) {
							$.extend( $scope.libraryValues, data );

						}, function fail() {
							$scope.resetLibraryValues();
						}

					// we can prepare the library
					).always(function() {
						// try user values first
						try {
							$scope.library = Library( name, {
								// glyphData: typeface.order,
								// glyphFormulas: typeface.glyphs,
								// componentFormulas: typeface.components,
								// parameters: $scope.fontValues
							});
						// fallback to default values
						} catch (e) {
							console.error('corrupted library values');
							$scope.resetLibraryValues();
							// Store default fontValues depending url names
							$scope.libraryValues = {
								typefaceName: $routeParams.typeface,
								variants: [
									{
										variantName: $routeParams.variant,
										versions: [ $scope.fontValues ]
									}
								]
							};
						}
					}));

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
				

				var isDoing = false,
					historyTimeout,
					_oldValues;

				$scope.undo = function() { 
					isDoing = true;
					History.undo( $scope.fontValues );
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
					    $scope.$apply();
					}

					setTimeout(function() {
						// this should always happen after the next apply
						// but we can't delay the apply of ng-click
						isDoing = false;
					}, 0);
				};

				$scope.redo = function() {
					isDoing = true;
					History.redo( $scope.fontValues );
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
					    $scope.$apply();
					}

					setTimeout(function() {
						// this should always happen after the next apply
						// but we can't delay the apply of ng-click
						isDoing = false;
					}, 0);
				};

				$scope.$watchCollection('fontValues', function(newValues, oldValues) {
					if ( isDoing ) {
						return;
					}

					if ( !_oldValues ) {
						_oldValues = oldValues;
					}

					clearTimeout( historyTimeout );
					historyTimeout = setTimeout(function() {
						var modified = {};

						for ( var i in newValues ) {
							if ( newValues[i] !== _oldValues[i] ) {
								modified[i] = newValues[i] - _oldValues[i];
							}
						}

						if ( Object.keys(modified).length ) {
							History.add(modified);
						}

						_oldValues = undefined;
					}, 500);
				});
			});

	});
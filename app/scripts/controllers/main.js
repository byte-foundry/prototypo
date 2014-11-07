'use strict';

(function(angular) {

	angular.module('prototypoApp').controller('MainCtrl', [
		'$scope', '$routeParams', '$parse', '$q', 'Typefaces', 'FontValues', 'AppValues',
		MainCtrl
	]);

	// jshint latedef:nofunc
	function MainCtrl( $scope, $routeParams, $parse, $q, Typefaces, FontValues, AppValues ) {

		var thisCtrl = this;

		// initial state
		this.initialAppValues = {
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
			singleChar: 'A',
			stringChars: 'Hamburgfonstiv',
			currentPreset: 'Sans-serif'
		};

		$scope.fontValues = this.fontValues = {};
		$scope.appValues = this.appValues = {};
		$scope.allChars = this.allChars = {};
		$scope.cAlt = {};
		$scope.cMap = {};
		//$scope.allOutlines = {};
		//$scope.appValues.singleChar = '';
		//$scope.appValues.stringChars = '';
		$scope.zoom = this.zoom;
		$scope.resetApp = this.resetApp;
		$scope.changeViewMode = this.changeViewMode;
		$scope.exportToSVG = this.exportToSVG.bind(this);
		$scope.exportToOTF = this.exportToOTF.bind(this);
		$scope.applyPreset = this.applyPreset;
		$scope.updateCalculatedParams = this.updateCalculatedParams;
		$scope.resetFontValue = this.resetFontValue;

		// load default typeface
		Typefaces.get({ typeface: $routeParams.typeface }).$promise.then(function( typedata ) {
			$scope.fontObject = thisCtrl.fontObject = typedata;

			thisCtrl.initialFontValues = {};
			// save initial fontValues
			typedata.parameters.forEach(function( group ) {
				group.parameters.forEach(function( param ) {
					thisCtrl.initialFontValues[ param.name ] = param.init;
				});
			});
			$scope.parameters = typedata.parameters;

			// some parameters need to be recalculated according to other params
			thisCtrl.calculated = {};
			_(typedata.calculated).forEach(function(calc, name) {
				thisCtrl.calculated[name] = $parse( calc );
			});

			// the presets need to be extended with their calculated params
			_(typedata.presets).forEach(function(preset) {
				_(thisCtrl.calculated).forEach(function(calc, name) {
					preset[name] = calc( preset );
				});
			});

			$scope.cAlt = typedata.info.cAlt;
			_(typedata.info['glyph-order']).forEach(function( c, i ) {
				$scope.cMap[i] = c[0];
			});

			var promises = [];

			promises.push( FontValues.get({ typeface: $routeParams.typeface })
				.then(
					function done( data ) {
						$.extend( $scope.fontValues, data );

					}, function fail() {
						$.extend( $scope.fontValues, thisCtrl.initialFontValues );
					}

				).always(function() {
					thisCtrl.font = prototypo( typedata );
				}));

			promises.push( AppValues.get({ typeface: $routeParams.typeface })
				.then(
					function done( data ) {
						//if ( !( data.singleChar in $scope.typeface.order ) ) {
						//	$scope.resetAppValues();
						//} else {
						$.extend( $scope.appValues, thisCtrl.initialAppValues, data );
						//}
					}, function fail() {
						$.extend($scope.appValues, thisCtrl.initialAppValues, {
							singleChar: typedata.info['glyph-order'][ Object.keys(typedata.info['glyph-order'])[0] ]
						});
					}
				));

			return $q.all( promises );
		})
		.finally($scope.apply);

		var allChars = [];

		$scope.$watch('fontValues', function() {
			if ( !Object.keys( $scope.fontValues ).length ) {
				return;
			}

			// update calculated params
			_(thisCtrl.calculated).forEach(function(calc, name) {
				$scope.fontValues[name] = calc( $scope.fontValues );
			});

			thisCtrl.updateSVGOT( $scope, allChars );

			// persist values
			FontValues.save({
				typeface: $routeParams.typeface,
				values: $scope.fontValues
			});

		// deep
		}, true);

		$scope.$watch(
			// watch the list of unique characters used throughout the app
			function() {
				if ( !$scope.appValues.singleChar && !$scope.appValues.stringChars ) {
					return '';
				}

				allChars = _.unique(($scope.appValues.singleChar + $scope.appValues.stringChars).split('')).sort();

				return allChars.join('');
			},
			function() {
				if ( !thisCtrl.font ) {
					return;
				}

				thisCtrl.updateSVGOT( $scope, allChars );
			});

		$scope.$watchCollection('appValues', function() {
			if ( !Object.keys( $scope.fontValues ).length ) {
				return;
			}

			// persist values
			AppValues.save({
				typeface: $routeParams.typeface,
				values: $scope.appValues
			});
		});
	}

	MainCtrl.prototype.zoom = function( val ) {
		if ( val === 0 ) {
			this.appValues.zoom = 1;
		} else {
			this.appValues.zoom =
				Math.min( Math.max( this.appValues.zoom + ( val > 0 ? -0.15 : +0.15 ), 0.3 ), 7);
		}
	};

	MainCtrl.prototype.resetApp = function() {
		localStorage.clear();
		window.location.reload();
	};

	MainCtrl.prototype.changeMode = function( mode ) {
		this.appValues.viewMode = mode;
		return mode;
	};

	MainCtrl.prototype.updateSVGOT = function( $scope, allChars ) {
		$scope.allChars = this.font.update(
			allChars,
			$scope.fontValues
		);

		this.font.toSVG( allChars );
		this.font.addToFonts( allChars, {familyName: 'preview'} );
	};

	MainCtrl.prototype.exportToSVG = function() {
		this.font.update( true, this.fontValues );

		saveAs(
			new Blob(
				[ Handlebars.templates.dotsvg({
					glyphs: this.font.toSVG( true, this.fontValues )
				}) ],
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

	MainCtrl.prototype.exportToOTF = function() {
		this.font.update( true, this.fontValues );

		saveAs(
			new Blob(
				[ new DataView( this.font.toOT( true ).toBuffer() ) ],
				{type: 'font/opentype'}
			),
			'default.otf'
		);
	};

	MainCtrl.prototype.applyPreset = function( name ) {
		// the svg path shouldn't be merged to fontValues and its no longer necessary
		delete this.fontObject.presets[name].svg;

		this.appValues.currentPreset = name;
		$.extend( this.fontValues, this.fontObject.presets[name] );

		this.$apply();
	};

})(angular);
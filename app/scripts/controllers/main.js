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
			viewMode: 'string',
			invertedFont: false,
			displayNodes: false,
			displayNodesSkeleton: false,
			displayNodesCoordinates: false,
			displayCtrlCoordinates: false,
			outlineOnly: false,
			negative: false,
			displayGrid: true,
			displayPattern: false,
			displayGuideLines: true,
			displaySpacing: false,
			paramTab: 0,
			zoom: 1.5,
			scenePanX: -120,
			scenePanY: 0,
			singleChar: 'A',
			stringChars: 'Type your text',
			// paragraphChars: 'abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ',
			paragraphChars: 'abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n,;.:-!?\‘\’\“\”\'\"\«\»()[]\n0123456789\n+&\/\náàâäéèêëíìîïóòôöúùûü\nÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ\n\nᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀsᴛᴜᴠᴡʏᴢ',
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
		$scope.openInGlyphr = this.openInGlyphr.bind(this);
		$scope.applyPreset = this.applyPreset;
		$scope.updateCalculatedParams = this.updateCalculatedParams;
		$scope.resetFontValue = this.resetFontValue;
		$scope.StringFromCharCode = String.fromCharCode;

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

			prototypo.setup(document.createElement('canvas'));
			$scope.font = prototypo.parametricFont( typedata );
			$scope.font.glyphs.forEach(function(glyph) {
				glyph.allNodes = thisCtrl.gatherNodes( glyph );
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

			$scope.font.update( $scope.fontValues );
			$scope.font.updateSVGData();
			$scope.font.updateOTCommands();
			$scope.font.addToFonts();

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
				if ( !$scope.appValues.singleChar && !$scope.appValues.stringChars && !$scope.appValues.paragraphChars ) {
					return '';
				}

				// TODO: single char should be a character, not a number
				allChars = _.unique((String.fromCharCode($scope.appValues.singleChar) + $scope.appValues.stringChars + $scope.appValues.paragraphChars).split('')).sort();

				return allChars.join('');
			},
			function() {
				if ( !$scope.font ) {
					return;
				}

				$scope.font.subset = allChars.join('');
				$scope.font.update( $scope.fontValues );
				$scope.font.updateSVGData();
				$scope.font.updateOTCommands();
				$scope.font.addToFonts();
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
		if( this.appValues.viewMode === 'single' ) {
			if ( val === 0 ) {
				this.appValues.zoom = 1;
			} else {
				this.appValues.zoom =
					Math.min( Math.max( this.appValues.zoom + ( val > 0 ? -0.15 : +0.15 ), 0.3 ), 7);
			}
		}
		else {
			var size = parseFloat($('textarea.string').css('font-size'));
			$('textarea.string').css('font-size', size + val * -10 + 'px' );
		}
	};

	MainCtrl.prototype.resetApp = function() {
		localStorage.clear();
		window.location.reload();
	};

	MainCtrl.prototype.changeViewMode = function( mode ) {
		this.appValues.viewMode = mode;
		return mode;
	};

	// MainCtrl.prototype.updateSVGOT = function( $scope, allChars ) {console.log('here');
	// 	// this.font.update( allChars,
	// 	// 	$scope.fontValues
	// 	// );

	// 	// this.font.toSVG( allChars );
	// 	// this.font.addToFonts( allChars, {familyName: 'preview'} );

	// 	this.font.subset = allChars;
	// 	this.font.update( $scope.fontValues );
	// 	this.font.updateSVGData();
	// 	this.font.addToFonts();
	// };

	var messageListener;
	MainCtrl.prototype.openInGlyphr = function() {
		this.font.update( true, this.fontValues );
		this.font.updateSVGData();

		window.open('http://glyphrstudio.com/online/');

		if ( messageListener ) {
			return;
		}

		var self = this;
		messageListener = window.addEventListener('message', function( event ) {
			if ( event.data === 'ready' ) {
				var data = Handlebars.templates.dotsvg({
							glyphs: self.font.charMap,
						});

				event.source.postMessage(
					data,
					event.origin
				);
			}
		});
	};

	MainCtrl.prototype.exportToSVG = function() {
		this.font.update( this.fontValues );
		this.font.updateSVGData();

		saveAs(
			new Blob(
				[ Handlebars.templates.dotsvg({
					glyphs: this.font.charMap
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
		this.font.update( this.fontValues );
		this.font.updateOTCommands();

		saveAs(
			new Blob(
				[ new DataView( this.font.ot.toBuffer() ) ],
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

	MainCtrl.prototype.gatherNodes = function( glyph, allNodes ) {
		if ( !allNodes ) {
			allNodes = [];
		}

		glyph.contours.forEach(function(contour) {
			contour.nodes.forEach(function(node) {
				allNodes.push(node);
			});
		});

		glyph.components.forEach(function(component) {
			this.gatherNodes(component, allNodes);
		}, this);

		return allNodes;
	};


})(angular);

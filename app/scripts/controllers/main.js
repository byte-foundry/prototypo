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
			displayUI: false,
			displayNodes: false,
			displayNodesCoordinates: false,
			displayCtrlCoordinates: false,
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
			stringChars: 'Type your text',
			paragraphChars: 'Hamburgfonstiv',
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
				if ( !$scope.appValues.singleChar && !$scope.appValues.stringChars && !$scope.appValues.paragraphChars ) {
					return '';
				}

				allChars = _.unique(($scope.appValues.singleChar + $scope.appValues.stringChars + $scope.appValues.paragraphChars).split('')).sort();

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
	
		// Console BDSE
		var socket = io('http://0.0.0.0:9001');

		socket.on('update', function(obj){
			// console.log(obj.id, obj.value);
			if(obj.id === "A-1"){
				$scope.fontValues.thickness = Math.round(obj.value) * 2;
				$scope.$apply();
			}
		});

		// socket.on('reset', function(obj){
		// 	console.log(obj.id);
		// 	if( obj.value === true ) {
		// 		$('.slider').css('background-color', 'red');
		// 	} else {
		// 		$('.slider').css('background-color', 'blue');
		// 	}
		// });

		// socket.on('switch', function(obj){
		// 	console.log(obj.id);
		// 	if( obj.value === false ) {
		// 		$('.slider').css('background-color', 'black');
		// 		$('body').css('background-color', 'white');
		// 	} else {
		// 		$('.slider').css('background-color', 'white');
		// 		$('body').css('background-color', 'black');
		// 	}
		// });


		// socket.on('export', function(obj){
		// 	console.log(obj.id);
		// 	if( obj.value === false ) {
		// 		$('body').css('background-color', 'white');
		// 	} else {
		// 		$('body').css('background-color', 'red');
		// 	}
		// });

	}
// end MainCtrl
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
			$('textarea.string').css('font-size', size + val * -10 + "px" );
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

	MainCtrl.prototype.updateSVGOT = function( $scope, allChars ) {
		$scope.allChars = this.font.update(
			allChars,
			$scope.fontValues
		);

		this.font.toSVG( allChars );
		this.font.addToFonts( allChars, {familyName: 'preview'} );
	};

	var messageListener;
	MainCtrl.prototype.openInGlyphr = function() {
		this.font.update( true, this.fontValues );

		window.open('http://localhost:8081/dev/Glyphr_Studio.html');

		if ( messageListener ) {
			return;
		}

		var self = this;
		messageListener = window.addEventListener('message', function( event ) {
			if ( event.data === 'ready' ) {
				var glyphs = self.font.toSVG( true, self.fontValues ),
					data = Handlebars.templates.dotsvg({
							glyphs: glyphs
						});

				event.source.postMessage(
					data,
					event.origin
				);
			}
		});
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

		var date = new Date;
	
		var seconds = date.getSeconds();
		var minutes = date.getMinutes();
		var hour = date.getHours();

		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();

		var the_id = '' + month + day + hour + minutes + seconds;

		this.font.update( true, this.fontValues );

		saveAs(
			new Blob(
				[ new DataView( this.font.toOT( true ).toBuffer() ) ],
				{type: 'font/opentype'}
			),
			the_id + '.otf'
		);

		// autotweet 
		console.log('export & autotweet');

		
		console.log(the_id);

		var socket = io('http://0.0.0.0:9001');

		// create a twitpic
		var canvas = document.getElementById("twitpic");
		var context = canvas.getContext("2d");
		var colors = Array('#49e4a9','#ff725e','#f5e462','#00c4d6');
		var item = colors[Math.floor(Math.random()*colors.length)];
		context.fillStyle = item;
  		context.fillRect(0,0,660,400);
  		context.fillStyle = "Black";
  		context.opacity = .5;
		context.font = "60px 'preview'";
		context.textAlign = "center";
		var ele = "Biennale du Design";
		context.fillText(ele, 330, 200);
		var img = document.getElementById("exportedImage");
		img.src = canvas.toDataURL('image/png');
		// end create a twitpic

		socket.emit('autotweet', { 
			id: the_id,
			hashtag: "#BiennaleDesign2015 #prototypo",
			url: "http://designprototypo.tumblr.com/ more at http://www.prototypo.io/ via @prototypoApp",
			img: img.src
		});

	};

	MainCtrl.prototype.applyPreset = function( name ) {
		// the svg path shouldn't be merged to fontValues and its no longer necessary
		delete this.fontObject.presets[name].svg;

		this.appValues.currentPreset = name;
		$.extend( this.fontValues, this.fontObject.presets[name] );

		this.$apply();
	};

})(angular);
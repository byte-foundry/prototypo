'use strict';

angular.module('prototyp0.fontLoader', ['ngResource'])
	.factory( 'Font', function( $resource ) {

		return $resource( '/fonts/:font/font.json', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Glyph', function( $resource ) {

		return $resource( '/fonts/:font/glyphs/:glyph', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Component', function( $resource ) {

		return $resource( '/fonts/:font/components/:component', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Inputs', function( $resource ) {

		return $resource( '/fonts/:font/inputs/inputs.json', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory('loadFont', function( _, $q, $parse, Font, Glyph, Component, Inputs ) {
		return function( fontName ) {
			var font;

			return Font.get({font: fontName})
				.$then(function( response ) {
					font = response.data;
					var promises = [],
						components = font.components;

					if ( !font.glyphs ) {
						font.glyphs = {};
						_( font.order ).each(function( glyphCode ) {
							promises.push(
								Glyph.get({ font: fontName, glyph: glyphCode + '.json' })
									.$then(function( response ) {
										font.glyphs[ glyphCode ] = response.data;
									})
							);
						});
					}

					if ( components.constructor === Array ) {
						font.components = {};
						_( components ).each(function( componentName ) {
							promises.push(
								Component.get({ font: fontName, component: componentName + '.json' })
									.$then(function( response ) {
										font.components[ componentName ] = response.data;
									})
							);
						});
					}

					if ( !font.inputs ) {
						promises.push(
							Inputs.get({font: fontName })
								.$then(function( response ) {
									font.inputs = response.data.inputs;

									_( font.inputs ).each(function( input ) {
										if ( input.onchange ) {
											input.onchange = $parse( input.onchange );
										}
									});
								})
						);
					}

					return $q.all( promises );

				}).then(function() {
					return font;
				});
		};
	});
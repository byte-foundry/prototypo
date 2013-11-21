'use strict';

angular.module('prototypo.fontLoader', ['ngResource'])
	.factory( 'Fonts', function( $resource ) {

		return $resource( '/fonts/:font/font.json', {}, {
			get: { method:'GET', params: {font: 'default'} }
		});
	})

	.factory( 'Glyphs', function( $resource ) {

		return $resource( '/fonts/:font/glyphs/:glyph', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				return {
					data: data
				};
			}]}
		});
	})

	.factory( 'Components', function( $resource ) {

		return $resource( '/fonts/:font/components/:component', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				return {
					data: data
				};
			}]}
		});
	})

	.factory( 'Controls', function( $resource ) {

		return $resource( '/fonts/:font/controls/controls.json', {}, {
			get: { method:'GET', params: {} }
		});
	})

	.factory('loadFont', function( _, $q, $parse, Fonts, Glyphs, Components, Controls ) {
		return function( fontName ) {
			var font;

			return Fonts.get({font: fontName})
				.$promise.then(function( response ) {
					font = response;
					var promises = [],
						components = font.components;

					if ( !font.glyphs ) {
						font.glyphs = {};
						_( font.order ).each(function( glyphCode ) {
							promises.push(
								Glyphs.get({ font: fontName, glyph: glyphCode + '.txt' })
									.$promise.then(function( response ) {
										font.glyphs[ glyphCode ] = response.data;
									})
							);
						});
					}

					if ( components.constructor === Array ) {
						font.components = {};
						_( components ).each(function( componentName ) {
							promises.push(
								Components.get({ font: fontName, component: componentName + '.txt' })
									.$promise.then(function( response ) {
										font.components[ componentName ] = response.data;
									})
							);
						});
					}

					if ( !font.controls ) {
						promises.push(
							Controls.get({font: fontName })
								.$promise.then(function( response ) {
									font.controls = response.controls;

									// this doesn't belong here.
									// The loader shouldn't know about the internal structure of the files
									_( font.controls ).each(function( control ) {
										if ( control.onchange ) {
											control.onchange = $parse( control.onchange );
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
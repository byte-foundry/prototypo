'use strict';

angular.module('prototypo.Typeface', ['ngResource'])
	// The following resources are only needed as long as there isn't any server side
	// ultimately, a typeface should be loaded in a single request
	.factory( 'Typefaces', function( $resource ) {

		return $resource( '/_typeface/:typeface/typeface.json', {}, {
			get: { method:'GET', params: {} }
		});
	})

	.factory( 'Glyphs', function( $resource ) {

		return $resource( '/_typeface/:typeface/glyphs/:glyph', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				return {
					data: data
				};
			}]}
		});
	})

	.factory( 'Components', function( $resource ) {

		return $resource( '/_typeface/:typeface/components/:component', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				return {
					data: data
				};
			}]}
		});
	})

	.factory( 'Parameters', function( $resource ) {

		return $resource( '/_typeface/:typeface/parameters/parameters.json', {}, {
			get: { method:'GET', params: {} }
		});
	})

	.factory( 'Presets', function( $resource ) {

		return $resource( '/_typeface/:typeface/parameters/presets.json', {}, {
			get: { method:'GET', params: {} }
		});
	})

	// This is the simili-resource used in the app
	.factory('Typeface', function( $q, Typefaces, Glyphs, Components, Parameters, Presets ) {
		return { get: function( typefaceName ) {
			var typeface;

			return Typefaces.get({typeface: typefaceName})
				.$promise.then(function( response ) {
					typeface = response;
					var promises = [],
						components = typeface.components;

					if ( !typeface.glyphs ) {
						typeface.glyphs = {};
						$.each(typeface.order, function( glyphCode, glyph ) {
							promises.push(
								Glyphs.get({ typeface: typefaceName, glyph : glyph.fileName + '.pgf' })
									.$promise.then(function( response ) {
										typeface.glyphs[ glyphCode ] = response.data;
									})
							);
						});
					}

					if ( components.constructor === Array ) {
						typeface.components = {};
						$.each(components, function( i, componentName ) {
							promises.push(
								Components.get({ typeface: typefaceName, component: componentName + '.pgf' })
									.$promise.then(function( response ) {
										typeface.components[ componentName ] = response.data;
									})
							);
						});
					}

					if ( !typeface.params ) {
						promises.push(
							Parameters.get({typeface: typefaceName })
								.$promise.then(function( response ) {
									typeface.parameters = response.parameters;
								})
						);

						promises.push(
							Presets.get({typeface: typefaceName })
								.$promise.then(function( response ) {
									typeface.presets = response.presets;
								})
						);
					}

					return $q.all( promises );

				}).then(function() {
					return typeface;
				});
		}};
	});
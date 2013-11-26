'use strict';

angular.module('prototypo.valuesLoader', [])
	.factory('valuesLoader', function( $q ) {
		return function(prefix, getDefault) {
			return {
				getDefault: getDefault,
				get: function( params ) {
					var deferred = $q.defer(),
						storedValues = JSON.parse( localStorage[ prefix + 'Values[' + params.font + ']' ] || '{}' );

					if ( Object.keys( storedValues ).length !== 0 ) {
						deferred.resolve( storedValues );
						return deferred.promise;

					} else {
						return getDefault( params );
					}
				},
				save: function( params ) {
					var deferred = $q.defer();

					if ( !params || !params.values || Object.keys( params.values ).length === 0 ) {
						deferred.reject( false );
						return deferred.promise;
					}

					localStorage[ prefix + 'Values[' + params.font + ']' ] = JSON.stringify( params.values );
					deferred.resolve( true );
					return deferred.promise;
				}
			};
		};
	})
	.factory( 'ControlValues', function( $q, _, valuesLoader, Controls ) {
		return valuesLoader(
			'control',
			function( params ) {
				return Controls.get(params)
					.$promise.then(function( response ) {
						var controlValues = {};

						_( response.controls ).each(function(control) {
							controlValues[ control.name ] = control.init;
						});

						return controlValues;
					});
			}
		);
	})

	.factory( 'AppValues', function( $q, valuesLoader, Fonts ) {
		return valuesLoader(
			'app',
			function( params ) {
				return Fonts.get(params)
					.$promise.then(function( response ) {
						return {
							glyphCodes: [response.order[0]]
						};
					});
			}
		);
	});
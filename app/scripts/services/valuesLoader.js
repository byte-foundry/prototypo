'use strict';

angular.module('prototyp0.valuesLoader', [])
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
						return getDefault();
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
					.$then(function( response ) {
						var controlValues = {};

						_( response.data.controls ).each(function(control) {
							controlValues[ control.name ] = control.init;
						});

						return controlValues;
					});
			}
		);
	})

	.factory( 'AppValues', function( $q, valuesLoader, Font ) {
		return valuesLoader(
			'app',
			function( params ) {
				return Font.get(params)
					.$then(function( response ) {
						return {
							glyphCodes: [response.data.order[0]]
						};
					});
			}
		);
	});
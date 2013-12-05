'use strict';

angular.module('prototypo.Values', [])
	.factory('valuesResource', function( $q ) {
		return function( prefix ) {
			return {
				get: function( params ) {
					var deferred = $q.defer(),
						storedValues = JSON.parse( localStorage[ prefix + 'Values[' + params.typeface + ']' ] || '{}' );

					deferred.resolve( Object.keys( storedValues ).length !== 0 ?
						storedValues:
						undefined
					);
					return deferred.promise;
				},
				save: function( params ) {
					var deferred = $q.defer();

					if ( !params || !params.values || Object.keys( params.values ).length === 0 ) {
						deferred.reject( false );
						return deferred.promise;
					}

					localStorage[ prefix + 'Values[' + params.typeface + ']' ] = JSON.stringify( params.values );
					deferred.resolve( true );
					return deferred.promise;
				}
			};
		};
	})

	.factory( 'FontValues', function( valuesResource ) {
		return valuesResource( 'font' );
	})

	.factory( 'AppValues', function( valuesResource ) {
		return valuesResource( 'app' );
	});
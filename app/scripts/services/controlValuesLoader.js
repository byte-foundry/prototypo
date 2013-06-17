'use strict';

angular.module('prototyp0.controlValuesLoader', [])
	.factory( 'ControlValues', function( $q ) {
		return {
			get: function( params ) {
				var deferred = $q.defer();
				deferred.resolve( JSON.parse( localStorage['controlValues[' + params.font + ']'] || '{}' ) );
				return deferred.promise;
			},
			save: function( params ) {
				var deferred = $q.defer();

				if ( !params || !params.values || Object.keys( params.values ).length === 0 ) {
					deferred.reject( false );
					return deferred.promise;
				}

				localStorage['controlValues[' + params.font + ']'] = JSON.stringify( params.values );
				deferred.resolve( true );
				return deferred.promise;
			}
		};
	});
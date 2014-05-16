'use strict';

angular.module('prototypo.Values', [])
	.factory('valuesResource', function() {
		/*$.ajaxSetup({
			beforeSend: function( xhr, opts ) {
				// block hoodie synchronization for now
				//return !!opts.url.indexOf('/_api/');
			}
		});*/

		var hoodie = window.hoodie = new Hoodie('http://prototypo.cloudapp.net:6001/');

		return function( prefix ) {
			return {
				get: function( params ) {
					return hoodie.store.find( prefix + 'values', params.typeface )
						.then(function( object ) {
							return object.values;
						});
				},

				save: function( params ) {
					return hoodie.store.add( prefix + 'values', {
							id: params.typeface,
							values: params.values
						});
				},

				clear: function() {
					return hoodie.store.removeAll( prefix + 'values' );
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
'use strict';

angular.module('prototypo.Typefaces', ['ngResource'])
	.factory( 'Typefaces', function( $resource ) {
		return $resource( '/_typeface/:typeface.typeface.js', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				// jshint evil: true
				return eval(data);
			}]}
		});
	});
'use strict';

angular.module('prototypo.Typefaces', ['ngResource'])
	.factory( 'Typefaces', function( $resource ) {
		//return $resource( '/bower_components/:typeface.ptf/dist/font.json', {}, {
		return $resource( '/bower_components/genese.ptf/dist/font.json', {}, {
			get: { method:'GET', isArray: false, responseType: 'text', params: {}, transformResponse: [function( data ) {
				return JSON.parse(data);
			}]}
		});
	});
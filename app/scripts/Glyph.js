'use strict';

angular.module('prototypo.Glyph', [])
	.factory('Glyph', function() {

		function Glyph( component ) {
			this.component = component;
		}

		return Glyph;
	});
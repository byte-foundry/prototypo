'use strict';
angular.module('angular.hoodie', [])
	.provider('hoodie',function() {
		var hoodie;

		this.config = function( url ) {
			window.hoodie = hoodie = new Hoodie( url );
		};

		this.$get = [function() {
			if ( !hoodie ) {
				throw new Error('hoodieProvider.config should be called before requiring hoodie');
			}

			return hoodie;
		}];
	});
'use strict';

angular.module('angular.watchCollectionDiff', [])
	.run(function( $rootScope ) {
		$rootScope.constructor.prototype.$watchCollectionDiff = function( obj, listener ) {
			this.$watchCollection( obj, function(newValues, oldValues) {
				var diff = {},
					key;

				for ( key in newValues ) {
					if (newValues.hasOwnProperty(key)) {
						if ( newValues[key] !== oldValues[key] ) {
							diff[key] = [newValues[key], oldValues[key]];
							delete oldValues[key];
						}
					}
				}

				for ( key in oldValues ) {
					if (oldValues.hasOwnProperty(key)) {
						if ( newValues[key] !== oldValues[key] ) {
							diff[key] = [newValues[key], oldValues[key]];
							delete oldValues[key];
						}
					}
				}

				listener( diff );
			});
		};
	});
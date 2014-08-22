'use strict';

angular.module('prototypo.Collection', [])
	.factory('Collection', function() {

		function Collection( Type ) {
			var indexer = function indexer(id) {
					if ( indexer.all[id] ) {
						return indexer.all[id];

					} else {
						return {
							_: function() {
								return ( indexer.all[id] = Type.apply(null, arguments) );
							}
						};
					}
				};

			indexer.all = [];

			return indexer;
		}

		return Collection;
	});
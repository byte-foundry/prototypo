'use strict';

angular.module('prototypo.Component', ['prototypo.Collection', 'prototypo.Skeleton', 'prototypo.Contour', 'prototypo.Point'])
	.factory('Component', function( $parse, Collection, Skeleton, Contour, Point ) {

		function Component( data ) {
			//var self = this;

			this.origin = new Point(0, 0);
			this.points = new Collection( Point );
			this.skeletons = new Collection( Skeleton );
			this.contours = new Collection( Contour );

			this.processor = data(
				this.points,
				this.skeletons,
				this.contours,
				function include() {}
			);
		}

		Component.prototype.process = function( fontValues ) {
			execWith(this.processor, _.extend({origin: this.origin}, fontValues));

			this.skeletons.all.forEach(function(skeleton) {
				skeleton.updateContours();
			});

			this.contours.all.forEach(function(contour) {
				contour.updateControls();
			});

			return this;
		};

		function execWith( argNames, scope ) {
			var fn = argNames[argNames.length -1],
				args = [];

			argNames.forEach(function(name) {
				if ( typeof name === 'string' ) {
					args.push(scope[name]);
				}
			});

			fn.apply(null, args);
		}

		return Component;
	});
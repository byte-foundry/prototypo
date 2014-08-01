'use strict';

angular.module('prototypo.Component', ['prototypo.Collection', 'prototypo.Skeleton', 'prototypo.Contour', 'prototypo.Point'])
	.factory('Component', function( $parse, Collection, Skeleton, Contour, Point ) {

		function Component( data ) {
			//var self = this;

			this.origin = new Point(0, 0);
			var points = new Collection( Point ),
				skeletons = new Collection( Skeleton ),
				contours = new Collection( Contour );

			this.skeletons = skeletons.all;
			this.contours = contours.all;
			this.allContours = [];
			this.allNodes = [];

			this.processor = data(
				points,
				skeletons,
				contours,
				function include() {}
			);
		}

		Component.prototype.process = function( fontValues ) {
			execWith(this.processor, _.extend({origin: this.origin}, fontValues));

			this.skeletons.forEach(function(skeleton) {
				skeleton.updateContours(fontValues);
			});

			this.contours.forEach(function(contour) {
				contour.updateControls(fontValues);
			});

			if ( this.allNodes.length === 0 ) {
				this.collectContours();

				this.collectNodes();
			}

			this.allContours.forEach(function( contour ) {
				contour.toSVG();
			});

			return this;
		};

		// to test
		Component.prototype.collectContours = function() {
			this.allContours = [].concat.apply(
				this.contours,
				this.skeletons.map(function( skeleton ) {
					return skeleton.contours;
				})
			);

			return this;
		};

		// to test
		Component.prototype.collectNodes = function() {
			this.allNodes = [].concat.apply(
				[],
				this.allContours.map(function( contour ) {
					return contour.nodes;
				})
			);

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

			fn.apply(scope, args);
		}

		return Component;
	});
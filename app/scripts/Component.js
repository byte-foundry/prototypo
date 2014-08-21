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
			this.allComponents = [];
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
				this.collectComponents();

				this.collectNodes();
			}

			this.allComponents.forEach(function( component ) {
				component.toSVG();
			});

			return this;
		};

		// to test
		Component.prototype.collectComponents = function() {
			this.allComponents = this.contours.concat( this.skeletons );

			return this;
		};

		// to test
		Component.prototype.collectNodes = function() {
			this.allNodes = [].concat.apply(
				[],
				this.allComponents.map(function( component ) {
					// cycling skeleton
					if ( component.contours && component.contours.length === 2 ) {
						return component.contours[0].nodes.concat( component.contours[1].nodes );

					// open skeleton
					} else if ( component.contours && component.contours.length === 1 ) {
						return component.contours[0].nodes;

					// contour
					} else {
						return component.nodes;

					}
				})
			);

			return this;
		};

		Component.prototype.toSVG = function() {
			// cycling skeleton
			if ( this.contours && this.contours.length === 2 ) {
				return this.contours[0].toSVG() + this.contours[1].toSVG();

			// open skeleton
			} else if ( this.contours && this.contours.length === 1 ) {
				return this.contours[0].toSVG();

			// contour
			} else {
				return this.toSVG();

			}
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
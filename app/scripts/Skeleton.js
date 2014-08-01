'use strict';

angular.module('prototypo.Skeleton', ['prototypo.Contour', 'prototypo.NodeList', 'prototypo.Node'])
	.factory('Skeleton', function( Contour, NodeList, Node ) {

		function Skeleton( nodesData, cycle ) {
			// nodes can be in a single array or all arguments
			if ( !(nodesData instanceof Array ) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			// new is optional
			if ( !( this instanceof Skeleton ) ) {
				return new Skeleton( nodesData, cycle );
			}

			NodeList.call(this, nodesData, cycle);

			this.initContours();
		}

		Skeleton.prototype = Object.create(NodeList.prototype);

		Skeleton.prototype.initContours = function() {
			this.contours = [];
			var contour;

			contour = new Contour( this.nodes.map(function(node) {
					return ( node.left = new Node({
							c: null,
							lType: node.lType,
							rType: node.rType
						})
					);
				})
			);

			this.contours.push( contour );

			contour = new Contour( this.nodes.reverse().map(function(node) {
					return ( node.right = new Node({
							c: null,
							// use opposite type
							lType: node.rType,
							rType: node.lType
						})
					);
				})
			);

			// unreverse the nodeList
			this.nodes.reverse();

			// if the skeleton cycles (e.g. an "O"),
			// then we have two distinct contours
			if ( this.cycle ) {
				this.contours.push( contour );

			// if the skeleton doesn't cycle (e.g. an "L"),
			// then we have a single contour
			} else {
				this.contours[0].add( contour.nodes );
			}

			return this;
		};

		Skeleton.prototype.expand = function( fontValues ) {
			this.nodes.forEach(function(node) {
				var width = node.width || fontValues.thickness,
					distribution = ( node.distr === undefined ? 0.5 : node.distr ),
					angle = node.angle * ( Math.PI * 2 / 360 ) || 0;

				node.left.x = node.x + ( width * ( distribution ) * Math.cos( angle + Math.PI ) );
				node.left.y = node.y + ( width * ( distribution ) * Math.sin( angle + Math.PI ) );

				node.right.x = node.x + ( width * ( 1 - distribution ) * Math.cos( angle ) );
				node.right.y = node.y + ( width * ( 1 - distribution ) * Math.sin( angle ) );
			});
		};

		// TODO: this function should be part of the typeface file
		// (but this one can be the default one)
		Skeleton.prototype.updateContours = function( fontValues ) {
			this.expand( fontValues );

			if ( !this.cycle ) {
				var firstNode = this.nodes[0],
					lastNode = this.nodes[this.nodes.length - 1];

				firstNode.right.rType = 'line';
				firstNode.left.lType = 'line';

				lastNode.right.lType = 'line';
				lastNode.left.rType = 'line';
			}

			this.contours.forEach(function(contour) {
				contour.updateControls();
			});

			return this;
		};

		Skeleton.prototype.toSVG = function() {

		};

		return Skeleton;
	});
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
					return ( node.right = new Node({
							c: null,
							lType: node.lType,
							rType: node.rType
						})
					);
				})
			);

			this.contours.push( contour );

			contour = new Contour( this.nodes.reverse().map(function(node) {
					return ( node.left = new Node({
							c: null,
							lType: node.lType,
							rType: node.rType
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

		Skeleton.prototype.updateContours = function() {
			this.nodes.forEach(function(node) {
				node.rc.x = node.x + 5;
				node.rc.y = node.y;

				node.lc.x = node.x - 5;
				node.lc.y = node.y;
			});

			this.contours.forEach(function(contour) {
				contour.updateControls();
			});

			return this;
		};

		Skeleton.prototype.toSVG = function() {

		};

		return Skeleton;
	});
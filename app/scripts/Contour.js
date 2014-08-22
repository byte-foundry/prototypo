'use strict';

angular.module('prototypo.Contour', ['prototypo.NodeList', 'prototypo.Point', 'prototypo.2D', 'prototypo.Hobby'])
	.factory('Contour', function( NodeList, Point, updateControls, lineLineIntersection ) {

		function Contour( nodesData ) {
			// nodes can be in a single array or all arguments
			if ( !(nodesData instanceof Array ) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			// new is optional
			if ( !( this instanceof Contour ) ) {
				return new Contour( nodesData );
			}

			NodeList.call(this, nodesData, 'cycle');
		}

		Contour.prototype = Object.create(NodeList.prototype);

		Contour.prototype.toSVG = function() {
			var path = [],
				firstNode = this.nodes[0],
				lastNode = this.nodes[this.nodes.length - 1];

			this.nodes.forEach(function( node, i ) {
				// add letter
				if ( i === 0 ) {
					path.push('M');
				} else {
					path.push('C');
				}

				// add controls
				if ( i !== 0 ) {
					path.push(this.nodes[i-1].rc.toString());

					path.push(node.lc.toString());
				}

				// add node coordinates
				path.push(node.toString());

			}, this);

			// cycle
			path.push([
				'C',
				lastNode.rc.toString(),
				firstNode.lc.toString(),
				firstNode.toString(),
				'Z'
			].join(' '));

			this.d = path.join(' ');

			return this.d;
		};

		Contour.prototype.updateControls = function() {

			this.nodes.forEach(function(node) {
				if ( node.lType === 'line' ) {
					node.lc.coords[0] = node.coords[0];
					node.lc.coords[1] = node.coords[1];
				}

				if ( node.rType === 'line' ) {
					node.rc.coords[0] = node.coords[0];
					node.rc.coords[1] = node.coords[1];
				}
			}, this);

			updateControls( this.nodes[0] );

			return this;
		};

		Contour.prototype.applyRoundness = function( roundness ) {
			var p = new Point();

			this.nodes.forEach(function(node) {
				if ( node.rType === 'open' && node.next ) {
					p._( lineLineIntersection( node, node.rc, node.next, node.next.lc ) );

					node.rc._(
						node.x + roundness * ( p.x - node.x ),
						node.y + roundness * ( p.y - node.y )
					);

					node.next.lc._(
						node.next.x + roundness * ( p.x - node.next.x ),
						node.next.y + roundness * ( p.y - node.next.y )
					);
				}
			});
		};

		return Contour;
	});
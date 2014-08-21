'use strict';

angular.module('prototypo.Contour', ['prototypo.NodeList'])
	.factory('Contour', function( NodeList ) {

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

		return Contour;
	});
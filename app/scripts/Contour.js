'use strict';

angular.module('prototypo.Contour', ['prototypo.NodeList', 'prototypo.Hobby'])
	.factory('Contour', function( NodeList, updateControls ) {

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

		Contour.prototype.updateControls = function() {
			updateControls( this.nodes[0] );

			return this;
		};

		return Contour;
	});
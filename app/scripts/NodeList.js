'use strict';

angular.module('prototypo.NodeList', ['prototypo.Node'])
	.factory('NodeList', function( Node ) {

		function NodeList( nodesData, cycle ) {
			// nodes can be in a single array or all arguments
			if ( !(nodesData instanceof Array) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			return this instanceof NodeList ?
				NodeList.prototype._.call( this, nodesData, cycle ):
				new NodeList.prototype._( nodesData, cycle );
		}

		// setter shorthand
		NodeList.prototype._ = function( nodesData, cycle ) {
			// the arguments can be an array nodesData, or many nodeData
			if ( !(nodesData instanceof Array) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			// cycle can be set either through the second argument of the function,
			// or, for convenience, as the last element of nodesData
			if ( nodesData[ nodesData.length -1 ] === 'cycle' ) {
				nodesData.splice(-1);
				this.cycle = true;
			} else {
				this.cycle = cycle === true || cycle === 'cycle';
			}

			// treat and remove 'line' instructions
			nodesData = nodesData
				.filter(function( data, i ) {
					if ( data === 'line' ) {
						// we consider that the nodeList always cycles.
						// when it doesn't, lines at the end are pointless anyway.
						nodesData[ i > 0 ? i - 1 : nodesData.length - 1 ].rType = 'line';
						nodesData[ i < nodesData.length - 1 ? i + 1 : 0 ].lType = 'line';

						return false;
					}

					return true;
				});

			// create
			if ( !this.nodes ) {
				// make nodes out of the data
				this.nodes = nodesData.map(function( data ) {
						return data instanceof Node ?
							data:
							new Node( data );
					});

				// link the nodes
				for ( var i in this.nodes ) {
					this.nodes[+i].next = this.nodes[+i + 1] || this.nodes[0];
					this.nodes[+i].prev = this.nodes[+i - 1] || this.lastNode;
				}

				// open node-list needs an endpoint
				if ( !this.cycle ) {
					this.nodes[0].lType = 'endpoint';
					this.lastNode.rType = 'endpoint';
				}

			// update
			} else {
				this.nodes.forEach(function( node, i ) {
					node._( nodesData[i] );
				});
			}

			// if ( this.cycle ) {
			// 	this.lastNode.next = this.nodes[0];
			// 	this.nodes[0].prev = this.lastNode;
			// }

			return this;
		};

		// concatenate with another nodeList or an array of nodes
		NodeList.prototype.add = function( nodeList ) {
			var nodes =
					// NodeList instance or Skeleton or Contour instance
					'nodes' in nodeList ? nodeList.nodes:
					// Node instance
					nodeList instanceof Node ? [nodeList]:
					// Array of nodes
					(new NodeList(nodeList)).nodes;

			if ( this.cycle ) {
				var lastNode = nodes[nodes.length - 1];
				lastNode.next = this.lastNode.next;
				lastNode.next.prev = lastNode;
			}

			this.lastNode.next = nodes[0];
			nodes[0].prev = this.lastNode;

			this.nodes = this.nodes.concat( nodes );
		};

		Object.defineProperty(NodeList.prototype, 'lastNode', {
			get: function() { return this.nodes[this.nodes.length - 1]; }
		});
		Object.defineProperty(NodeList.prototype, 'length', {
			get: function() { return this.nodes.length; }
		});

		return NodeList;
	});
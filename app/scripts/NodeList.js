'use strict';

angular.module('prototypo.NodeList', ['prototypo.Node'])
	.factory('NodeList', function( Node ) {

		function NodeList( nodesData, cycle ) {
			// nodes can be in a single array or all arguments
			if ( !(nodesData instanceof Array) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			// new is optional
			if ( !( this instanceof NodeList ) ) {
				return new NodeList( nodesData, cycle );
			}

			// cycle can be set either through the second argument of the function,
			// or, for convenience, as the last element of nodesData
			if ( nodesData[ nodesData.length -1 ] === 'cycle' ) {//console.log('cycle!')
				nodesData.splice(-1);
				this.cycle = true;
			} else {
				this.cycle = cycle === true || cycle === 'cycle';
			}

			this.nodes = nodesData.map(function( data ) {
				return data.constructor === Node ?
					data:
					new Node( data );
			});

			// link the nodes
			for ( var i in this.nodes ) {
				if ( this.nodes[+i + 1] ) {
					this.nodes[+i].next = this.nodes[+i + 1];
				}
				if ( this.nodes[+i - 1] ) {
					this.nodes[+i].prev = this.nodes[+i - 1];
				}
			}

			if ( this.cycle ) {
				this.lastNode.next = this.nodes[0];
				this.nodes[0].prev = this.lastNode;
			}
		}

		// setter shorthand
		NodeList.prototype._ = function( nodesData ) {
			// the arguments can be an array nodesData, or many nodeData
			if ( !(nodesData instanceof Array) ) {
				nodesData = Array.prototype.slice.call(arguments, 0);
			}

			this.nodes.forEach(function( node, i ) {
				node._( nodesData[i] );
			});

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
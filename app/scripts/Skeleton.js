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

		// init a single contour
		function initContour( nodes, side, cycle ) {
			var contourNodes = [],
				length = nodes.length;

			nodes.forEach(function(node, i) {
				var contourNode;
				node[side] = [];

				contourNode = new Node({
					c: null,
					lType: node[ side === 'left' ? 'lType' : 'rType' ],
					rType: node[ side === 'left' ? 'rType' : 'lType' ]
				});

				node[side][0] = contourNode;

				// when a segment is followed by a line,
				// we need to add two nodes on each side to the contour
				if ( ( cycle || ( i !== 0 && i !== length - 1 ) ) &&
						( node.lType === 'line' || node.rType === 'line' ) ) {

					contourNode = new Node({
						c: null,
						lType: node[ side === 'left' ? 'lType' : 'rType' ],
						rType: node[ side === 'left' ? 'rType' : 'lType' ]
					});

					node[side][ side === 'left' ? 'push' : 'unshift' ]( contourNode );
				}

				contourNodes = contourNodes.concat( node[side] );
			});

			return new Contour( contourNodes );
		}

		Skeleton.prototype.initContours = function() {
			this.contours = [];
			var contour;

			contour = initContour( this.nodes, 'left', this.cycle );

			this.contours.push( contour );

			contour = initContour( this.nodes.reverse(), 'right' );
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

		Skeleton.prototype.expand = function() {
			var length = this.nodes.length;

			this.nodes.forEach(function(node, i) {

				// when a segment is followed by a line,
				// we expend the node into four points, as if it was the end of two distinct segments
				if ( ( this.cycle || ( i !== 0 && i !== length - 1 ) ) &&
						( node.lType === 'line' || node.rType === 'line' ) ) {

					var lWidth = node.prev.width === undefined ? 10 : node.prev.width,
						rWidth = node.next.width === undefined ? 10 : node.next.width,
						lDistr = node.prev.distr === undefined ? 0.5 : node.prev.distr,
						rDistr = node.next.distr === undefined ? 0.5 : node.next.distr,
						lAngle = node.prev.angle === undefined ? 0 : node.prev.angle * ( Math.PI * 2 / 360 ),
						rAngle = node.next.angle === undefined ? 0 : node.next.angle * ( Math.PI * 2 / 360 );

					node.left[0].x = node.x + ( lWidth * ( lDistr ) * Math.cos( lAngle + Math.PI ) );
					node.left[0].y = node.y + ( lWidth * ( lDistr ) * Math.sin( lAngle + Math.PI ) );
					node.right[1].x = node.x + ( lWidth * ( 1 - lDistr ) * Math.cos( lAngle ) );
					node.right[1].y = node.y + ( lWidth * ( 1 - lDistr ) * Math.sin( lAngle ) );

					node.left[1].x = node.x + ( rWidth * ( rDistr ) * Math.cos( rAngle + Math.PI ) );
					node.left[1].y = node.y + ( rWidth * ( rDistr ) * Math.sin( rAngle + Math.PI ) );
					node.right[0].x = node.x + ( rWidth * ( 1 - rDistr ) * Math.cos( rAngle ) );
					node.right[0].y = node.y + ( rWidth * ( 1 - rDistr ) * Math.sin( rAngle ) );

				} else {
					var width = node.width || 10,
						distribution = ( node.distr === undefined ? 0.5 : node.distr ),
						angle = node.angle * ( Math.PI * 2 / 360 ) || 0;

					node.left[0].x = node.x + ( width * ( distribution ) * Math.cos( angle + Math.PI ) );
					node.left[0].y = node.y + ( width * ( distribution ) * Math.sin( angle + Math.PI ) );
					node.right[0].x = node.x + ( width * ( 1 - distribution ) * Math.cos( angle ) );
					node.right[0].y = node.y + ( width * ( 1 - distribution ) * Math.sin( angle ) );

					node.left[0].lTension = node.lTension;
					node.left[0].rTension = node.rTension;
					// use opposite tension
					node.right[0].lTension = node.rTension;
					node.right[0].rTension = node.lTension;
				}
			}, this);

			return this;
		};

		Skeleton.prototype.updateEnds = function() {
			if ( this.cycle ) {
				return;
			}

			var firstNode = this.nodes[0],
				lastNode = this.nodes[this.nodes.length - 1];

			firstNode.right[0].rType = 'line';
			firstNode.left[0].lType = 'line';

			lastNode.right[0].lType = 'line';
			lastNode.left[0].rType = 'line';
		};

		// TODO: this function should be part of the typeface file
		// (but this one can be the default one)
		Skeleton.prototype.updateContours = function( fontValues ) {

			this.updateControls();

			this.expand( fontValues );

			this.updateEnds();

			this.contours.forEach(function(contour) {
				contour.updateControls();

				//contour.cleanCut();
			});

			return this;
		};

		Skeleton.prototype.toSVG = function() {
			this.d = this.contours.map(function( contour ) {
					return contour.toSVG();
				}).join(' ');

			return this.d;
		};

		return Skeleton;
	});
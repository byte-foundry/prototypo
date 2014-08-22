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
		function initContour( nodes, side ) {
			return new Contour( nodes.map(function(node) {
				return ( node[side] = new Node({
					c: null,
					lType: node[ side === 'left' ? 'lType' : 'rType' ],
					rType: node[ side === 'left' ? 'rType' : 'lType' ]
				}));
			}));
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

		Skeleton.prototype.expand = function( fontValues ) {

			this.nodes.forEach(function( node ) {
				var width = node.width !== undefined ? node.width : fontValues.width,
					distr = node.distr !== undefined ? node.distr : 0.5,
					angle = ( node.angle !== undefined ? node.angle : ( fontValues.angle || 0 ) ) * ( Math.PI * 2 / 360 );

				node.left.x = node.x + ( width * ( distr ) * Math.cos( angle + Math.PI ) );
				node.left.y = node.y + ( width * ( distr ) * Math.sin( angle + Math.PI ) );
				node.right.x = node.x + ( width * ( 1 - distr ) * Math.cos( angle ) );
				node.right.y = node.y + ( width * ( 1 - distr ) * Math.sin( angle ) );

				node.left.lTension = node.lTension;
				node.left.rTension = node.rTension;
				// use opposite tension
				node.right.lTension = node.rTension;
				node.right.rTension = node.lTension;

			});

			return this;
		};

		Skeleton.prototype.updateEnds = function() {
			if ( this.cycle ) {
				return;
			}

			var firstNode = this.nodes[0],
				lastNode = this.nodes[this.nodes.length - 1];

			firstNode.right.rType = 'line';
			firstNode.left.lType = 'line';

			lastNode.right.lType = 'line';
			lastNode.left.rType = 'line';
		};

		// TODO: this function should be part of the typeface file
		// (but this one can be the default one)
		Skeleton.prototype.updateContours = function( fontValues ) {

			//this.updateControls();

			this.expand( fontValues );

			this.updateEnds();

			this.contours.forEach(function(contour) {
				contour.updateControls();

				contour.applyRoundness( fontValues.roundness - 1 );
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
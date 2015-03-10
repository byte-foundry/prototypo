(function( P ) {
	'use strict';

	function expand( skeleton, glyph, params ) {
		var isOpen = skeleton.type === 'open';

		// create skins if needed
		if ( !skeleton.expanded ) {
			var i = isOpen ? 1 : 2;
			skeleton.expanded = [];

			while ( i-- ) {
				var skin = glyph.addContour();
				skin.tags.add('skin');
				skin.type = 'closed';
				skeleton.expanded.push( skin );
			}

			if ( !isOpen ) {
				skeleton.expanded[0].next = skeleton.expanded[1];
				skeleton.expanded[1].prev = skeleton.expanded[0];
			}
		}

		// the nodes of all expanded are re-linked on each update
		// (in case new skeleton nodes are created)
		var skins = [[], []];
		skeleton.nodes.forEach(function( node ) {
			var rib;

			if ( node.src && node.src.rDir === undefined && node.src.lDir !== undefined ) {
				node.rDir = node.lDir - Math.PI;
			}
			if ( node.src && node.src.lDir === undefined && node.src.rDir !== undefined ) {
				node.lDir = node.rDir - Math.PI;
			}

			if ( !node.expanded ) {
				node.expanded = [];

				rib = new P.Node();
				rib.tags.add('rib');
				rib.type = node.type || 'smooth';
				rib.lType = node.src.lType || 'smooth';
				rib.rType = node.src.rType || 'smooth';

				node.expanded.push( rib );

				rib = new P.Node();
				rib.tags.add('rib');
				rib.type = node.type || 'smooth';
				rib.lType = node.src.rType || 'smooth';
				rib.rType = node.src.lType || 'smooth';

				node.expanded.push( rib );
			}

			node.expanded[0].lDir = node.expanded[1].rDir = node.lDir;
			node.expanded[0].rDir = node.expanded[1].lDir = node.rDir;

			node.expanded[0].lTension = node.expanded[1].rTension = node.lTension;
			node.expanded[0].rTension = node.expanded[1].lTension = node.rTension;

			skins[0].push( node.expanded[0] );
			skins[1].push( node.expanded[1] );

			updateNodeRibs( node, params );
		});

		outline( skeleton, skins );
	}

	function updateNodeRibs( node, params ) {
		var left = node.expanded[0],
			right = node.expanded[1],
			width = node.width !== undefined ? node.width : params.width,
			distr = node.distr !== undefined ? node.distr : 0.5,
			angle = node.angle !== undefined ? node.angle : (
				node.lDir !== undefined ?
					node.lDir - Math.PI / 2:
					node.rDir + Math.PI / 2
			);

		left.x = node.x + ( width * ( distr ) * Math.cos( angle + Math.PI ) );
		left.y = node.y + ( width * ( distr ) * Math.sin( angle + Math.PI ) );
		right.x = node.x + ( width * ( 1 - distr ) * Math.cos( angle ) );
		right.y = node.y + ( width * ( 1 - distr ) * Math.sin( angle ) );
	}

	function outline( skeleton, skins ) {
		if ( skeleton.type === 'open' ) {
			var firstNode = skeleton.nodes[0],
				lastNode = skeleton.nodes[skeleton.nodes.length -1];

			skeleton.expanded[0].type = 'closed';
			skeleton.expanded[0].nodes = skins[0].concat( skins[1].reverse() );

			firstNode.expanded[0].type = firstNode.expanded[1].type = 'corner';
			firstNode.expanded[0].rType = 'line';
			firstNode.expanded[1].lType = 'line';

			lastNode.expanded[0].type = lastNode.expanded[1].type = 'corner';
			lastNode.expanded[0].lType = 'line';
			lastNode.expanded[1].rType = 'line';

		} else {
			skeleton.expanded[0].type = 'closed';
			skeleton.expanded[0].nodes = skins[0];

			skeleton.expanded[1].type = 'closed';
			skeleton.expanded[1].nodes = skins[1].reverse();
		}
	}

	// - link nodes in the contour
	// - make sure lines are set on both endpoints of a segment
	// - make sure types of endpoints are correctly set
	function prepareContour( contour ) {
		var length = contour.nodes.length,
			i = -1,
			node,
			firstNode = contour.nodes[0],
			lastNode = contour.nodes[length -1];

		while ( ++i < length ) {
			node = contour.nodes[i];

			if ( node.src && node.src.rDir === undefined && node.src.lDir !== undefined ) {
				node.rDir = node.lDir - Math.PI;
			}
			if ( node.src && node.src.lDir === undefined && node.src.rDir !== undefined ) {
				node.lDir = node.rDir - Math.PI;
			}

			// hobby requires that the last point always links to the start point
			node.prev = contour.nodes[i-1] || lastNode;
			node.next = contour.nodes[i+1] || firstNode;

			if ( node.lType === 'line' ) {
				node.next.rType = 'line';
				if ( node.type === 'smooth' ) {
					node.lDir = P.Utils.lineAngle( node, node.next );
					node.rDir = node.lDir + Math.PI;
				}
			}
			if ( node.rType === 'line' ) {
				node.prev.lType = 'line';
				if ( node.type === 'smooth' ) {
					node.rDir = P.Utils.lineAngle( node, node.prev );
					node.lDir = node.rDir + Math.PI;
				}
			}
		}
	}

	function notomaticSegments( contour, params ) {
		var curviness = params.curviness || 2/3;

		contour.segments.forEach(function(segment) {
			if ( segment.start.lType === 'line' || segment.end.rType === 'line' ) {
				segment.lCtrl.x = segment.start.x;
				segment.lCtrl.y = segment.start.y;
				segment.rCtrl.x = segment.end.x;
				segment.rCtrl.y = segment.end.y;

				return;
			}

			// var lli,
			var	lTension = segment.start.lTension !== undefined ? segment.start.lTension : 1,
				rTension = segment.end.rTension !== undefined ? segment.end.rTension : 1;

			// if ( segment.start.x === 0 ) {
			// 	lli = [ 0, segment.end.y - Math.tan( segment.end.rDir ) * segment.end.x ];

			// } else if ( segment.end.x === 0 ) {
			// 	lli = [ 0, segment.start.y - Math.tan( segment.start.lDir ) * segment.start.x ];

			// } else {
			// 	lli = P.Utils.lineLineIntersection(
			// 		segment.start,
			// 		{x: 0, y: segment.start.y - Math.tan( segment.start.lDir ) * segment.start.x },
			// 		segment.end,
			// 		{x: 0, y: segment.end.y - Math.tan( segment.end.rDir ) * segment.end.x }
			// 	);
			// }

			// segment.lCtrl.x = segment.start.x + ( lli[0] - segment.start.x ) * curviness * lTension;
			// segment.lCtrl.y = segment.start.y + ( lli[1] - segment.start.y ) * curviness * lTension;
			// segment.rCtrl.x = segment.end.x + ( lli[0] - segment.end.x ) * curviness * rTension;
			// segment.rCtrl.y = segment.end.y + ( lli[1] - segment.end.y ) * curviness * rTension;

			var rri = P.Utils.rayRayIntersection(
				segment.start,
				segment.start.lDir,
				segment.end,
				segment.end.rDir
			);

			// direction of handles is parallel
			if ( rri === null ) {
				// startCtrl.x = 0;
				// startCtrl.y = 0;
				// endCtrl.x = 0;
				// endCtrl.y = 0;

				segment.lCtrl.x = segment.start.x;
				segment.lCtrl.y = segment.start.y;
				segment.rCtrl.x = segment.end.x;
				segment.rCtrl.y = segment.end.y;

				return;
			}

			// startCtrl.x = ( Math.round(rri[0]) - start.point.x ) * curviness * startTension;
			// startCtrl.y = ( Math.round(rri[1]) - start.point.y ) * curviness * startTension;
			// endCtrl.x = ( Math.round(rri[0]) - end.point.x ) * curviness * endTension;
			// endCtrl.y = ( Math.round(rri[1]) - end.point.y ) * curviness * endTension;

			segment.lCtrl.x = segment.start.x + ( Math.round(rri[0]) - segment.start.x ) * curviness * lTension;
			segment.lCtrl.y = segment.start.y + ( Math.round(rri[1]) - segment.start.y ) * curviness * lTension;
			segment.rCtrl.x = segment.end.x + ( Math.round(rri[0]) - segment.end.x ) * curviness * rTension;
			segment.rCtrl.y = segment.end.y + ( Math.round(rri[1]) - segment.end.y ) * curviness * rTension;

		});
	}

	if ( !P.naive ) {
		P.naive = {};
	}
	Object.mixin( P.naive, {
		expand: expand,
		updateNodeRibs: updateNodeRibs,
		prepareContour: prepareContour,
		notomaticSegments: notomaticSegments
	});

	// extend built-in objects types
	P.Glyph.prototype.update = function( params ) {
		this.anchors.forEach(function(anchor) {
			anchor.update( params, this );
		}, this);
		this.contours.forEach(function(contour) {
			contour.update( params, this );
		}, this);

		this.contours.forEach(function( skeleton ) {
			if ( !skeleton.tags.has('skeleton') ) {
				return;
			}

			P.naive.expand( skeleton, this, params );
		}, this);

		this.contours.forEach(function( contour ) {
			if ( contour.tags.has('skeleton') ) {
				return;
			}

			P.naive.prepareContour( contour );
			P.naive.notomaticSegments(contour, params);
		});

		this.components.forEach(function(component) {
			component.parentAnchors.forEach(function(anchor) {
				anchor.update( params, this );
			}, this);
			component.update( params );
		}, this);

		if ( this.src.advanceWidth ) {
			var attr = this.src.advanceWidth,
				args = [ this.contours, this.anchors, this.parentAnchors, null, P.Utils ];

			attr.parameters.forEach(function( name ) {
				args.push( params[name] );
			});
			this.advanceWidth = attr.updater.apply( {}, args );
		}

		this.transform( null, true );

		this.gatherNodes();

		return this;
	};

	P.Glyph.prototype.toSVG = function( path ) {
		if ( !path ) {
			path = [];
		};

		this.contours.forEach(function( contour ) {
			if ( contour.prev || contour.tags.has('skeleton') ) {
				return;
			}

			path.push( contour.toSVG() );
		});

		this.components.forEach(function( component ) {
			component.toSVG( path );
		});

		return ( this.pathData = path.join(' ') );
	};

	P.Glyph.prototype.toOT = function( path ) {
		if ( !path ) {
			path = new P.opentype.Path();
		};

		this.allContours.forEach(function( contour ) {
			if ( contour.prev || contour.tags.has('skeleton') ) {
				return;
			}

			contour.toOT( path );
		});

		this.components.forEach(function( component ) {
			component.toOT( path );
		});

		return new P.opentype.Glyph({
			name: this.name,
			unicode: this.unicode,
			path: path,
			advanceWidth: this.advanceWidth || 512
		});
	};

	// contour.update() shouldn't update the SVG dataPath attr,
	// as control points are only ready much later
	P.Contour.prototype.update = function( params, glyph ) {
		this.nodes.forEach(function(node) {
			node.update( params, glyph, this );
		}, this);

		if ( this.src && this.src.transform ) {
			this.transform( this.src.transform, true );
		}
	};

	P.Contour.prototype._toSVG = P.Contour.prototype.toSVG;
	P.Contour.prototype.toSVG = function() {
		var pathData = [],
			contour = this;

		do {
			pathData.push( contour._toSVG() );
			delete contour.pathData;

		} while ( ( contour = contour.next ) );

		return ( this.pathData = pathData.join(' ') );
	};

	P.Contour.prototype._toOT = P.Contour.prototype.toOT;
	P.Contour.prototype.toOT = function( path ) {
		var contour = this;

		do {
			contour._toOT( path );

		} while ( ( contour = contour.next ) );
	};


	['lDir', 'rDir', 'angle'].forEach(function(name) {
		Object.defineProperty(P.Node.prototype, name, {
			get: function() { return this['_' + name]; },
			set: function( dir ) {
				if ( typeof dir === 'string' && /deg$/.test( dir ) ) {
					this['_' + name] = parseFloat( dir ) * ( Math.PI * 2 / 360 );
				} else {
					this['_' + name] = dir;
				}
			}
		});
	});

	// Find the intersection of two rays.
	// A ray is defined by a point and an angle.
	P.Utils.rayRayIntersection = function( p1, a1, p2, a2 ) {
		// line equations
		var a = Math.tan(a1),
			b = Math.tan(a2),
			c = p1.y - a * p1.x,
			d = p2.y - b * p2.x,
			x,
			y;

		// When searching for lines intersection,
		// angles can be normalized to 0 < a < PI
		// This will be helpful in detecting special cases below.
		a1 = a1 % Math.PI;
		if ( a1 < 0 ) {
			a1 += Math.PI;
		}
		a2 = a2 % Math.PI;
		if ( a2 < 0 ) {
			a2 += Math.PI;
		}

		// no intersection
		if ( a1 === a2 ) {
			return null;
		}

		// Optimize frequent and easy special cases.
		// Without optimization, results would be incorrect when cos(a) === 0
		if ( a1 === 0 ) {
			y = p1.y;
		} else if ( a1 === Math.PI / 2 ) {
			x = p1.x;
		}
		if ( a2 === 0 ) {
			y = p2.y;
		} else if ( a2 === Math.PI / 2 ) {
			x = p2.x;
		}

		// easiest case
		if ( x !== undefined && y !== undefined ) {
			return new Float32Array([ x, y ]);
		}

		// other cases that can be optimized
		if ( a1 === 0 ) {
			return new Float32Array([ ( y - d ) / b, y ]);
		}
		if ( a1 === Math.PI / 2 ) {
			return new Float32Array([ x, b * x + d ]);
		}
		if ( a2 === 0 ) {
			return new Float32Array([ ( y - c ) / a, y ]);
		}
		if ( a2 === Math.PI / 2 ) {
			return new Float32Array([ x, a * x + c ]);
		}

		// intersection from two line equations
		// algo: http://en.wikipedia.org/wiki/Line–line_intersection#Given_the_equations_of_the_lines
		return new Float32Array([
			x = (d - c) / (a - b),
			// this should work equally well with ax+c or bx+d
			a * x + c
		]);
	};

})( prototypo );
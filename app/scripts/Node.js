'use strict';

angular.module('prototypo.Node', ['prototypo.Hobby', 'prototypo.Point'])
	.factory('Node', function(nodeType, reverseNodeType, Point) {

		function Node( data ) {
			// new is optional
			if ( !( this instanceof Node ) ) {
				return new Node( data );
			}

			Point.call(this, data.c);
			delete data.c;
			this.lc = new Point(data.lc);
			delete data.lc;
			this.rc = new Point(data.rc);
			delete data.rc;

			// default type is open
			if (  !data.lType ) {
				data.lType = 'open';
			}
			if (  !data.rType ) {
				data.rType = 'open';
			}

			// default tension is 1
			if ( !data.lTension ) {
				data.lTension = data.tension || 1;
			}
			if ( !data.rTension ) {
				data.rTension = data.tension || 1;
			}

			_.extend( this, data );
		}

		Node.prototype = Object.create(Point.prototype);

		// setter shorthand that behaves exactly like the constructor
		Node.prototype._ = function( data ) {
			Point.prototype._.call(this, data.c);
			delete data.c;
			this.lc._(data.lc);
			delete data.lc;
			this.rc._(data.rc);
			delete data.rc;

			// default type is open
			if (  !data.lType ) {
				data.lType = 'open';
			}
			if (  !data.rType ) {
				data.rType = 'open';
			}

			// default tension is 1
			if ( !data.lTension ) {
				data.lTension = data.tension || 1;
			}
			if ( !data.rTension ) {
				data.rTension = data.tension || 1;
			}

			_.extend( this, data );

			return this;
		};

		// most properties of the node need to be mirrored to be usable by Hobby algorithm
		Object.defineProperty(Node.prototype, 'x_pt', {
			get: function() { return this.coords[0]; },
			set: function( x ) { this.coords[0] = x; }
		});
		Object.defineProperty(Node.prototype, 'y_pt', {
			get: function() { return this.coords[1]; },
			set: function( y ) { this.coords[1] = y; }
		});

		Object.defineProperty(Node.prototype, 'ltype', {
			get: function() { return nodeType[this.lType]; },
			set: function( t ) { this.lType = reverseNodeType[t]; }
		});
		Object.defineProperty(Node.prototype, 'rtype', {
			get: function() { return nodeType[this.rType]; },
			set: function( t ) { this.rType = reverseNodeType[t]; }
		});

		Object.defineProperty(Node.prototype, 'lx_pt', {
			get: function() { return this.lc.coords[0]; },
			set: function( x ) { this.lc.coords[0] = x; }
		});
		Object.defineProperty(Node.prototype, 'ly_pt', {
			get: function() { return this.lc.coords[1]; },
			set: function( y ) { this.lc.coords[1] = y; }
		});

		Object.defineProperty(Node.prototype, 'rx_pt', {
			get: function() { return this.rc.coords[0]; },
			set: function( x ) { this.rc.coords[0] = x; }
		});
		Object.defineProperty(Node.prototype, 'ry_pt', {
			get: function() { return this.rc.coords[1]; },
			set: function( y ) { this.rc.coords[1] = y; }
		});

		Object.defineProperty(Node.prototype, 'left_tension', {
			get: function() { return this.lTension; },
			set: function( t ) { this.lTension = t; }
		});
		Object.defineProperty(Node.prototype, 'right_tension', {
			get: function() { return this.rTension; },
			set: function( t ) { this.rTension = t; }
		});

		return Node;
	});
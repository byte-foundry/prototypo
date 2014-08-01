'use strict';

angular.module('prototypo.Node', ['prototypo.Hobby', 'prototypo.Point'])
	.factory('Node', function(nodeType, reverseNodeType, Point) {

		function Node( data ) {
			return this instanceof Node ?
				Node.prototype._.call( this, data, true ):
				new Node.prototype._( data, true );
		}

		Node.prototype = Object.create(Point.prototype);

		// constructor
		Node.prototype._ = function( data, create ) {
			if ( data.lType === 'line' ) {
				data.lc = data.c;
			}
			if ( data.rType === 'line' ) {
				data.rc = data.c;
			}

			if ( create ) {
				Point.call( this, data.c );
				this.lc = new Point( data.lc );
				this.rc = new Point( data.rc );

			} else {
				Point.prototype._.call( this, data.c );
				this.lc._( data.lc );
				this.rc._( data.rc );
			}

			delete data.c;
			delete data.lc;
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

		// the type 'line' is equivalent to 'explicit' with null controls
		Object.defineProperty(Node.prototype, 'lType', {
			set: function( type ) {
				if ( type === 'line' ) {
					this.lc.coords[0] = this.coords[0];
					this.lc.coords[1] = this.coords[1];
				}

				this._lType = type;
			},
			get: function() {
				return this._lType;
			}
		});
		Object.defineProperty(Node.prototype, 'rType', {
			set: function( type ) {
				if ( type === 'line' ) {
					this.rc.coords[0] = this.coords[0];
					this.rc.coords[1] = this.coords[1];
				}

				this._rType = type;
			},
			get: function() {
				return this._rType;
			}
		});

		return Node;
	});
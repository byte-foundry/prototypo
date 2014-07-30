'use strict';

angular.module('prototypo.History', [])
	.factory('History', function() {
		
		function History() {
			this.readingHead = -1;
			this._history = [];
		}

		History.prototype.undo = function( fontValues ) {
			if( this.readingHead == -1 ) { return false; }
			var changes = this._history[this.readingHead];

			for ( var i in changes ) {
				fontValues[i] -= changes[i];
			}

			this.readingHead--;
			return changes;
		};

		History.prototype.redo = function( fontValues ) {
			if( this.readingHead >= this._history.length -1 ) { return false; }
			var changes = this._history[this.readingHead + 1];

			for ( var i in changes ) {
				fontValues[i] += changes[i];
			}

			this.readingHead++;
			return changes;
		};

		History.prototype.add = function( changes ) {
			this.readingHead++;
			if ( this.readingHead !== this._history.length ) {
				this._history.splice(this.readingHead);
			} 
			this._history.push(changes);
		};

		return new History();
	});
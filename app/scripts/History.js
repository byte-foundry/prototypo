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

		History.prototype.add = function( changes ) {console.log('add', changes);
			this.readingHead++;
			if ( this.readingHead !== this._history.length ) {
				this._history.splice(this.readingHead);
			} 
			this._history.push(changes);
		};

		return new History();
	});



















	/*$scope.history.undo = .redo = function( $scope ) {
					if( $scope.readingHead >= $scope._history.length -1 ) { return; }
					isRedoing = true;

					var differences = $scope._history[$scope.readingHead];
					console.log('using differences at', $scope.readingHead);

					for ( var i in differences ) {
						$scope.fontValues[i] -= differences[i];
					}

					$scope.$apply();
					isRedoing = false;
					$scope.readingHead++;
					console.log('head is now at', $scope.readingHead);
				};

				undefined
				if( $scope.readingHead < -1 ) { return; }
			isUndoing = true;
			
			var differences = $scope._history[$scope.readingHead];
			console.log('using differences at', $scope.readingHead);

			for ( var i in differences ) {
				$scope.fontValues[i] += differences[i];
			}
			

			$scope.$apply();
			isUndoing = false;
			$scope.readingHead--;
			console.log('head is now at', $scope.readingHead);*/
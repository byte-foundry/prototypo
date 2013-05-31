'use strict';

angular.module('prototyp0.filters', ['lodash'])
	.filter('contours', function( _ ) {
		return function( segments ) {
			var d = [];

			_( segments ).each(function( segment ) {
				d.push( segment.join(' ') );
			});

			return d.join(' ');
		};
	})
	.filter('points', function( _ ) {
		return function( segments ) {
			var d = [];

			_( segments ).each(function( segment ) {
				var l = segment.length,
					isRelative = /[a-z]/.test( segment[0] );

				// move to point
				d.push([
					isRelative ? 'm' : 'M',
					segment[l-2],
					segment[l-1]
				].join(' '));

				// draw debug shape and move back to point
				d.push(
					'm 0 2' +
					'h 2' +
					'v -4' +
					'h -4' +
					'v 4' +
					'z' +
					'm 0 -2'
				);
			});

			return d.join(' ');
		};
	})
	.filter('anchors', function( _ ) {
		return function( segments ) {
			var d = ['M 0,0'];

			_( segments ).each(function( segment ) {
				var l = segment.length,
					isRelative = /[a-z]/.test( segment[0] );

				if ( l > 3 ) {
					// line to 1st anchor and back to point
					d.push([
						isRelative ? 'l' : 'L',
						segment[1],
						segment[2],
						'z'
					].join(' '));
				}

				// move to next point
				d.push([
					isRelative ? 'm' : 'M',
					segment[l-2],
					segment[l-1]
				].join(' '));

				if ( l > 5 ) {
					// line to 2nd anchor and back to point
					d.push([
						isRelative ? 'l' : 'L',
						segment[3] - ( isRelative ? -segment[l-2] : 0 ),
						segment[4] - ( isRelative ? -segment[l-1] : 0 ),
						'z'
					].join(' '));
				}
			});

			return d.join(' ');
		};
	})
	.filter('extraCommands', function() {
		var rrc = /r(c([ ,]+[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+)+)/g,
			rtriplet = /[ ,]+([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/g;
		return function( d ) {
			return d.replace(rrc, function( all, allButR ) {
				return allButR.replace(rtriplet, function( all, dc1x, dc1y, rc2x, rc2y, dx, dy ) {
					return dc1x + ',' + 'dc1y' + ' ' + ( +rc2x + dx ) + ',' + ( +rc2y + dy ) + ' ' + dx + ',' + dy;
				});
			});
		};
	});

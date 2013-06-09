'use strict';

angular.module('prototyp0.glyphs', ['prototyp0.components'])
	.constant('glyphs', {} )

	.factory('processGlyph', function( glyphs, processSegments ) {
		return function( index, inputs, destination ) {
			processSegments( glyphs[index], inputs, {}, glyphs[index].reference || {}, {x:0,y:0}, destination, 0 );
		};
	})

	.factory('processSegments', function( _, prepareJSsegments, prepareContext, absolutizeSegment, components, mergeDestinations ) {
		var rseparator = /[ ,]+/g,
			risAfter = /^after/,
			rletters = /^[a-z]+/,
			processSegments = function( jsSegments, inputs, params, parent, curPosition, destination, insertIndex ) {

				var knownSegments = {},
					tmpDestination = [],
					context;

				prepareJSsegments( jsSegments );
				context = prepareContext( inputs, params, knownSegments, parent );

				_( jsSegments.interpolated ).each(function( interpolatedSegment, i ) {
					// process segments
					if ( typeof interpolatedSegment === 'function' ) {
						tmpDestination.push( knownSegments[i] = absolutizeSegment(
							interpolatedSegment( context ).replace(rseparator, ' ').split(' '),
							curPosition
						));

					// process components
					} else if ( typeof interpolatedSegment === 'object' ) {
						// merge destinations before treating first component
						if ( tmpDestination.length ) {
							mergeDestinations( destination, tmpDestination, insertIndex, jsSegments.formula.invert );
						}

						var isAfter = risAfter.test(i),
							newInsertIndex = i.replace( rletters, '' );
						processSegments(
							components[interpolatedSegment[0]],
							inputs,
							interpolatedSegment[1]( context ),
							knownSegments,
							{
								x: knownSegments[newInsertIndex].x,
								y: knownSegments[newInsertIndex].y
							},
							destination,
							destination.indexOf( knownSegments[newInsertIndex] ) + ( isAfter ? 0 : -1 )
						);
					}
				});

				// merge destinations now if the formula didn't include any components
				if ( tmpDestination.length ) {
					mergeDestinations( destination, tmpDestination, insertIndex, jsSegments.formula.invert );
				}
			};

		return processSegments;
	})

	// execute various operations on the JS representation
	// of a glyph when it is loaded or first used
	.factory('prepareJSsegments', function( _, $interpolate, $parse, structureSegment ) {
		var rcomponent = /^(\w+)/,
			rparams = /{{(.*?)}}/;

		return function( jsSegments ) {
			// interpolate the formula if necessary
			if ( !jsSegments.interpolated ) {
				jsSegments.interpolated = {};

				_( jsSegments.formula ).each(function(segmentFormula, i) {

					if ( typeof segmentFormula === 'string' ) {
						// interpolate segments
						if ( !isNaN(+i) ) {
							jsSegments.interpolated[i] = $interpolate( segmentFormula );

						// interpolate components
						} else {
							jsSegments.interpolated[i] = [
								rcomponent.exec( segmentFormula )[1],
								$parse( rparams.exec( segmentFormula )[1] )
							];
						}
					}
				});
			}

			// structure all reference segments if necessary
			if ( jsSegments.refence && jsSegments.reference[0] && jsSegments.reference[0].constructor === Array ) {
				_( jsSegments.reference ).each(function(arrSegment, i) {
					jsSegments.reference[i] = structureSegment( arrSegment );
				});
			}
		};
	})

	// give array segment a ueful structure (direct access to x, y, command)
	.factory('structureSegment', function( _ ) {
		return function( arrSegment ) {
			var l = arrSegment.length;

			// this should be implemented using harmony Proxy but only Firefox has it
			return _.extend({
				length: l,
				command: arrSegment[0],
				x: arrSegment[l-2],
				y: arrSegment[l-1],
				xy: arrSegment[l-2] + ',' + arrSegment[l-1],
				toString: function() {
					return [].join.call( this, ' ');
				}
			}, arrSegment);
		};
	})

	// create the context that will be used to process a segment formula
	.factory('prepareContext', function( _ ) {
		return function( inputs, params, self, parent ) {
			// FIXME: find a way to allow additional methods created by the users
			return _.extend({}, inputs, {
				params: params,
				self: self,
				parent: parent,
				find: function( params ) {
					var start = params.on[0],
						end = params.on[1],
						vector = {
							x: end.x - start.x,
							y: end.y - start.y
						},
						point = params.x ?
							[ params.x, ( params.x - start.x ) / vector.x * vector.y + start.y ]:
							[ ( params.y - start.y ) / vector.y * vector.x + start.x, params.y ];

					return point.join(' ');
				}
			});
		};
	})

	// make every point of the glyph absolute and translate non-standard commands
	.factory('absolutizeSegment', function( structureSegment ) {
		var rvirtual = /^v\w/;

		return function( segment, position ) {
			var j = 0,
				l = segment.length,
				isVirtual = rvirtual.test( segment[0] ) &&
					( segment[0] = segment[0].slice(1) );

			if ( l < 2 ) {
				return segment;
			}

			switch ( segment[0] ) {
			// end-point of the cubic is absolutely positioned,
			// anchors are relative to their point
			case 'rC':
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				position.x = +segment[5];
				position.y = +segment[6];
				segment[3] = +segment[3] + position.x;
				segment[4] = +segment[4] + position.y;
				break;
			// end-point of the cubic is relatively positioned,
			// anchors are relative to their point
			case 'rc':
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				position.x = segment[5] = +segment[5] + position.x;
				position.y = segment[6] = +segment[6] + position.y;
				segment[3] = +segment[3] + position.x;
				segment[4] = +segment[4] + position.y;
				break;
			// end-point of the smooth cubic is absolutely positioned,
			// anchors are relative to their point
			case 'rS':
				position.x = +segment[3];
				position.y = +segment[4];
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				break;
			// end-point of the smooth cubic is relatively positioned,
			// anchors are relative to their point
			case 'rs':
				position.x = segment[3] = +segment[3] + position.x;
				position.y = segment[4] = +segment[4] + position.y;
				segment[1] = +segment[1] + position.x;
				segment[2] = +segment[2] + position.y;
				break;
			case 'h':
				position.x = segment[1] = +segment[1] + position.x;
				break;
			case 'v':
				position.y = segment[1] = +segment[1] + position.y;
				break;
			case 'l':
			case 'm':
			case 'q':
			case 'c':
			case 's':
			case 't':
				while ( ++j < l ) {
					segment[j] = +segment[j] + ( j % 2 ? position.x : position.y );
				}
				position.x = segment[l-2];
				position.y = segment[l-1];
				break;
			default:
				position.x = +segment[l-2];
				position.y = +segment[l-1];
				break;
			}

			// transform command
			segment[0] = isVirtual ?
				'*' :
				// keep last letter and uppercase it
				segment[0].slice(-1).toUpperCase();

			// round coordinates
			while ( --l ) {
				segment[l] = parseInt( segment[l], 10 );
			}

			return structureSegment( segment );
		};
	})

	.factory('mergeDestinations', function() {
		return function( destination, source, insertIndex, invert ) {
			if ( invert ) {
				// this code will crash when trying to invert anything else than a component
				// (because it needs things before and after)
				var tmp1 = {
						x: destination[insertIndex].x,
						y: destination[insertIndex].y
					},
					tmp2,
					i = source.length;

				while ( --i ) {
					// command-specific permutations
					switch ( source[i].command ) {
					case 'C':
						tmp2 = source[i].slice(1,3);
						source[i][1] = source[i][3];
						source[i][2] = source[i][4];
						source[i][3] = tmp2[0];
						source[i][4] = tmp2[1];
						break;
					case 'S':
						// not implemented yet
						break;
					}

					// inter-segment permutations
					if ( source[i+1] ) {
						source[i+1].x = source[i].x;
						source[i+1].y = source[i].y;
					} else {
						destination[insertIndex].x = source[i].x;
						destination[insertIndex].y = source[i].y;
					}
				}

				source[0].x = tmp1.x;
				source[0].x = tmp1.x;
				source.reverse();

			}

			destination.splice.apply( destination, [insertIndex, 0].concat(source) );
			// empty the source array to make sure merge happens only once
			source.splice(0);
		};
	});
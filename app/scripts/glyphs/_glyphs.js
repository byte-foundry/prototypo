'use strict';

angular.module('prototyp0.glyphs', ['prototyp0.components'])
	.constant('glyphs', {} )

	.factory('processGlyph', function( glyphs, processSegments ) {
		return function( index, inputs, destination ) {
			processSegments( glyphs[index], inputs, {}, glyphs[index].reference || {}, {x:0,y:0}, destination, 0 );
		};
	})

	.factory('processSegments', function( _, prepareJSsegments, prepareContext, prepareVars, absolutizeSegment, components, mergeDestinations ) {
		var rseparator = /[ ,]+/g,
			risAfter = /^after/,
			rletters = /^[a-z]+/,
			processSegments = function( jsSegments, inputs, params, parent, curPosition, destination, insertIndex ) {

				var knownSegments = {},
					tmpDestination = [],
					context,
					isInverted;

				prepareJSsegments( jsSegments );
				context = prepareContext({
					inputs: inputs,
					params: params,
					self: knownSegments,
					parent: parent,
					origin: curPosition
				});
				prepareVars( jsSegments, context );

				_( jsSegments.interpolated ).each(function( interpolatedSegment, i ) {
					if ( i === 'invert' ) {
						isInverted = interpolatedSegment( context );

					// process segments
					} else if ( typeof interpolatedSegment === 'function' ) {
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
					mergeDestinations( destination, tmpDestination, insertIndex, isInverted );
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
			if ( jsSegments.interpolated ) {
				return;
			}

			jsSegments.interpolated = {};
			jsSegments.vars = {};

			_( jsSegments.formula ).each(function(segmentFormula, i) {

				// when the index is a number, we're dealing w/ a segment
				if ( !isNaN(+i) ) {
					jsSegments.interpolated[i] = $interpolate( segmentFormula );

				// when the index starts with $ it a variable
				} else if ( i.indexOf('$') === 0 ) {
					jsSegments.vars[i] = segmentFormula;

				} else if ( i === 'invert' ) {
					jsSegments.interpolated[i] = $parse( segmentFormula );

				// otherwise it's a component
				} else {
					jsSegments.interpolated[i] = [
						rcomponent.exec( segmentFormula )[1],
						$parse( rparams.exec( segmentFormula )[1] )
					];
				}
			});

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
		return function( args ) {
			// FIXME: find a way to allow additional methods created by the users
			return _.extend({}, args.inputs, {
				params: args.params,
				self: args.self,
				parent: args.parent,
				origin: args.origin,
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

	// variables in glyph formulas are a very hacky feature,
	// because logic in Angular template is very limited
	// basically we create anonymous functions on the fly that accept all context properties as params
	.factory('prepareVars', function( _ ) {
		return function( jsSegments, context ) {
			var vars,
				args = [];

			_( context ).each(function(value) {
				args.push( value );
			});

			_( jsSegments.vars ).each(function(formula, name) {
				if ( typeof formula === 'string' ) {
					if ( !vars ) {
						vars = Object.keys( context ).concat( Object.keys( jsSegments.vars ) );
					}

					// Security hole
					jsSegments.vars[ name ] = formula = Function.apply(
						null, vars.concat( 'return ' + formula )
					);
				}

				args.push( context[ name ] = formula.apply( null, args ) );
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
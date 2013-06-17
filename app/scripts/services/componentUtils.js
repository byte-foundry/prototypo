'use strict';

angular.module('prototyp0.componentUtils', [])
	.factory('processComponent', function( _, prepareComponent, prepareContext, prepareVars, absolutizeSegment, mergeDestinations ) {
		var rseparator = /[ ,]+/g,
			risAfter = /^after/,
			rletters = /^[a-z]+/,
			processComponent = function( args ) {

				var knownSegments = {},
					tmpDestination = [],
					context,
					isInverted;

				prepareComponent( args.component );
				context = prepareContext({
					controls: args.controls,
					params: args.params,
					self: knownSegments,
					parent: parent,
					origin: args.origin
				});
				prepareVars( args.component, context );

				_( args.component.interpolated ).each(function( interpolatedSegment, i ) {
					if ( i === 'invert' ) {
						isInverted = interpolatedSegment( context );

					// process segments
					} else if ( typeof interpolatedSegment === 'function' ) {
						tmpDestination.push( knownSegments[i] = absolutizeSegment(
							interpolatedSegment( context ).replace(rseparator, ' ').split(' '),
							context.curPos
						));

					// process components
					} else if ( typeof interpolatedSegment === 'object' ) {
						// merge destinations before treating first component
						if ( tmpDestination.length ) {
							mergeDestinations( args.destination, tmpDestination, args.insertIndex, args.component.formula.invert );
						}

						var isAfter = risAfter.test(i),
							newInsertIndex = i.replace( rletters, '' );
						processComponent({
							font: args.font,
							component: args.font.components[interpolatedSegment[0]],
							controls: args.controls,
							params: interpolatedSegment[1]( context ),
							parent: knownSegments,
							origin: {
								x: knownSegments[newInsertIndex].x,
								y: knownSegments[newInsertIndex].y
							},
							insertIndex: args.destination.indexOf( knownSegments[newInsertIndex] ) + ( isAfter ? 0 : -1 ),
							destination: args.destination
						});
					}
				});

				// merge destinations now if the formula didn't include any components
				if ( tmpDestination.length ) {
					mergeDestinations( args.destination, tmpDestination, args.insertIndex, isInverted );
				}

				return args.destination;
			};

		return processComponent;
	})

	// execute various operations on the JS representation
	// of a glyph when it is loaded or first used
	.factory('prepareComponent', function( _, $interpolate, $parse, structureSegment ) {
		var rcomponent = /^(\w+)/,
			rparams = /{{(.*?)}}/;

		return function( component ) {
			if ( component.interpolated ) {
				return;
			}

			component.interpolated = {};
			component.vars = {};

			// parse or interpolate segments
			_( component.formula ).each(function(segmentFormula, i) {

				// when the index is a number, we're dealing w/ a segment
				if ( !isNaN(+i) ) {
					component.interpolated[i] = $interpolate( segmentFormula );

				// when the index starts with $ it a variable
				} else if ( i.indexOf('$') === 0 ) {
					component.vars[i] = segmentFormula;

				} else if ( i === 'invert' ) {
					component.interpolated[i] = $parse( segmentFormula );

				// otherwise it's a component
				} else {
					component.interpolated[i] = [
						rcomponent.exec( segmentFormula )[1],
						$parse( rparams.exec( segmentFormula )[1] )
					];
				}
			});

			// make segments easier to work with
			if ( component.refence && component.reference[0] && component.reference[0].constructor === Array ) {
				_( component.reference ).each(function(arrSegment, i) {
					component.reference[i] = structureSegment( arrSegment );
				});
			}
		};
	})

	// give array segment a ueful structure (direct access to x, y, command)
	.factory('structureSegment', function( _ ) {
		return function( arrSegment ) {
			var l = arrSegment.length,
				// this should be implemented using harmony Proxy but only Firefox has it
				obj = _.extend({
					length: l,
					command: arrSegment[0],
					controls: [],
					x: arrSegment[l-2],
					y: arrSegment[l-1],
					xy: arrSegment[l-2] + ',' + arrSegment[l-1],
					toString: function() {
						return [].join.call( this, ' ');
					}
				}, arrSegment);

			if ( l > 3 ) {
				obj.controls[0] = {
					x: arrSegment[1],
					y: arrSegment[2]
				};
			}

			if ( l > 5 ) {
				obj.controls[1] = {
					x: arrSegment[3],
					y: arrSegment[4]
				};
			}

			return obj;
		};
	})

	// create the context that will be used to process a segment formula
	.factory('prepareContext', function( _, segmentMethods ) {
		return function( args ) {
			return _.extend({}, args.controls, segmentMethods, {
				params: args.params,
				self: args.self,
				parent: args.parent,
				origin: args.origin,
				curPos: {
					x: args.origin.x,
					y: args.origin.y
				}
			});
		};
	})

	// variables in glyph formulas are a very hacky feature,
	// because logic in Angular template is very limited
	// basically we create anonymous functions on the fly that accept all context properties as params
	.factory('prepareVars', function( _ ) {
		return function( component, context ) {
			var vars,
				args = [];

			_( context ).each(function(value) {
				args.push( value );
			});

			_( component.vars ).each(function(formula, name) {
				if ( typeof formula === 'string' ) {
					if ( !vars ) {
						vars = Object.keys( context ).concat( Object.keys( component.vars ) );
					}

					// Security hole
					component.vars[ name ] = formula = Function.apply(
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
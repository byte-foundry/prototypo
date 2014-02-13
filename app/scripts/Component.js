'use strict';

angular.module('prototypo.Component', ['prototypo.Segment', 'prototypo.Point', 'prototypo.2D'])
	.factory('Component', function( initComponent, processComponent, transformComponent ) {

		function Component( args, formulaLib, params ) {
			// new is optional
			if ( !( this instanceof Component ) ) {
				return new Component( args, formulaLib, params );
			}

			this.formula = formulaLib[ args.name ];
			this.segments = new Array( this.formula.length );

			for ( var i in args ) {
				this[i] = args[i];
			}

			this.params = params;

			this.components = this.formula.components.map(function( subcomponentArgs ) {
				return Component( subcomponentArgs, formulaLib, params );
			});
		}

		Component.prototype = {
			init: function( curPos ) {
				return initComponent( this, curPos );
			},
			process: function( curPos, full ) {
				return processComponent( this, curPos, true, full );
			},
			transform: function( transform ) { return transformComponent( this, transform ); },
			// quick and dirty toSVG, should only be used for debugging purpose
			toSVG: function() {
				return this.segments.map(function( segment ) {
					return segment.toSVG();
				}).join('\n');
			}
		};

		return Component;
	})

	.factory('initComponent', function( Point, Segment, processComponent, processSubcomponent ) {
		return function initComponent( component, curPos ) {
			var i = 0,
				hasNaN = false,
				_glyph,
				checkNaN = function( segment ) {
					return isNaN( segment.x ) || isNaN( segment.y );
				},
				filteredSegments,
				err;

			do {
				_glyph = [];
				processComponent( component, curPos, false );
				hasNaN = component.segments.some(checkNaN);
			} while ( ++i < 10 && hasNaN );

			// throw an error after 10 unsuccessful attempts
			if ( hasNaN ) {
				err = new Error();
				err.name = 'init component';
				err.message = 'Component segments cannot be initialized:\n' +
					component.segments.map(function( segment, i ) { return i + ': ' + segment.toSVG(); }).join('\n');
				throw err;
			}

			// this number will be reused when "fully" processing a component
			component.iter = i;

			// filter empty segments
			filteredSegments = component.segments.filter(function( segment ) {
				return segment instanceof Segment;
			});
			// link segments together
			filteredSegments.forEach(function( segment, i ) {
					// natural order
					if ( !component.invert ) {
						if ( this[i + 1] ) {
							segment.next = this[i + 1];
						}
						if ( this[i - 1] ) {
							segment.prev = this[i - 1];
						}
					}
					// invert order
					if ( component.invert ) {
						if ( this[i - 1] ) {
							segment.next = this[i - 1];
						}
						if ( this[i + 1] ) {
							segment.prev = this[i + 1];
						}
					}
				}, filteredSegments);

			// find the beginning and end of the component
			if ( component.invert ) {
				component.firstSegment = filteredSegments[ filteredSegments.length -1 ];
				component.lastSegment = filteredSegments[ 0 ];

			} else {
				component.firstSegment = filteredSegments[ 0 ];
				component.lastSegment = filteredSegments[ filteredSegments.length -1 ];
			}

			component.components.forEach(function( subcomponent, i ) {
				var from,
					to,
					fromSeg,
					toSeg;

				if ( subcomponent.type === 'replace' ) {
					from = subcomponent.fromFn( component.flatContext );
					// from segment[n].start <=> from segment[n-1].end
					if ( from === 'start' ) {
						// search for previous non-false segment
						// TODO: test what happens in an inverted segment.
						subcomponent.fromId = component.segments.indexOf( component.segments[ subcomponent.fromId ].prev );
						subcomponent.fromFn = function() { return 'end'; };
					}
					fromSeg = component.segments[ subcomponent.fromId ];

					to = subcomponent.toFn( component.flatContext );
					// to segment[n].end <=> to segment[n+1].start
					if ( to === 'end' ) {
						// search for following non-false segment
						// TODO: test what happens in an inverted segment.
						subcomponent.toId = component.segments.indexOf( component.segments[ subcomponent.toId ].next );
						subcomponent.toFn = function() { return 'start'; };
					}
					toSeg = component.segments[ subcomponent.toId ];

					// when a segment is going to be cut in the middle,
					// the rendered points need to be different from the actual ones
					if (
						typeof from !== 'string' ||
						// this should also be the case for an inverted subcomponent (only on from segment)
						subcomponent.inverted
					) {
						fromSeg.$render.end = Point( fromSeg.end );
						if ( fromSeg.ctrl1 ) {
							fromSeg.$render.ctrl1 = Point( fromSeg.ctrl1 );
						}
					}
					if ( typeof to !== 'string' ) {
						toSeg.$render.start = Point( toSeg.start );
						if ( toSeg.ctrl0 ) {
							toSeg.$render.ctrl0 = Point( toSeg.ctrl0 );
						}
					}

				}

				processSubcomponent( component, subcomponent, initComponent );

				/* link subcomponent */
				// TODO: test the .prev linking and use it in glyph smoothing
				if ( subcomponent.type === 'add' ) {
					component.lastSegment.next = subcomponent.firstSegment;
					//subcomponent.firstSegment.prev = component.lastSegment;
					component.lastSegment = subcomponent.lastSegment;

				} else if ( subcomponent.type === 'replace' ) {
					if ( subcomponent.fromId < 1 ) {
						subcomponent.lastSegment.next = component.firstSegment;
						//component.firstSegment.prev = subcomponent.lastSegment;
						component.firstSegment = subcomponent.firstSegment;
					} else {
						// avoid this subcomponents to be skipped because of the previous subcomponent
						if ( i > 0 && component.components[ i -1 ].lastSegment.next === component.segments[ subcomponent.fromId ].next ) {
							component.components[ i -1 ].lastSegment.next = subcomponent.firstSegment;
							//subcomponent.firstSegment.prev = component.components[ i -1 ].lastSegment;

						} else {
							component.segments[ subcomponent.fromId ].next = subcomponent.firstSegment;
							//subcomponent.firstSegment.prev = component.segments[ subcomponent.fromId ];
						}
					}

					if ( subcomponent.toId > component.segments.length ) {
						component.lastSegment.next = subcomponent.firstSegment;
						//subcomponent.firstSegment.prev = component.lastSegment;
						component.lastSegment = subcomponent.lastSegment;
					} else {
						subcomponent.lastSegment.next = component.segments[ subcomponent.toId ];
						//component.segments[ subcomponent.toId ].prev = subcomponent.lastSegment;
					}
				}
			});
		};
	})

	.factory('processComponent', function( Segment, Point, processSubcomponent, flattenContext ) {
		return function processComponent( component, _curPos, recurse, full ) {
			var curPos,
				i = component.iter || 1;

			do {
				curPos = Point( _curPos );

				// initialize the drawing with the origin as a fake segment
				if ( component.segments[0] === undefined ) {
					component.segments[0] = {
						end: Point( curPos ),
						x: curPos.x,
						y: curPos.y,
						toSVG: function() { return ''; }
					};
					// TODO: this 'to' value shouldn't be a property of curPos
					// curPos could be renamed to ends and have a .start and .end
					if ( _curPos.to ) {
						Object.defineProperty(component.segments, -1, {
							writable: true,
							enumerable: false
						});
						component.segments[-1] = _curPos.to;
					}

				} else {
					component.segments[0].end.x = component.segments[0].x = curPos.x;
					component.segments[0].end.y = component.segments[0].y = curPos.y;
				}

				flattenContext( component );

				/* process segments */
				component.formula.segments.forEach(function( segmentFn, i ) {
					// only process non-empty segments
					if ( segmentFn ) {
						if ( component.segments[i] === undefined ) {
							component.segments[i] = Segment( segmentFn( component.flatContext ), curPos, component.invert );

						// reuse existing segments
						} else {
							component.segments[i].update( segmentFn( component.flatContext ) );
							component.segments[i].absolutize( curPos );
						}
					}
				});

			/* In formulas, segment:1 can use points of segment:3.
			   Because of this, we might need to process each component more
			   than once to get it's correct shape.
			   This won't be done when the user drags a slider, but it must
			   be done when the user has finished interacting with a slider
			*/
			} while ( full === true && --i );

			/* process subcomponents (not on init) */
			if ( recurse !== false ) {
				component.components.forEach(function( subcomponent ) {
					processSubcomponent( component, subcomponent, processComponent, full );
				});
			}
		};
	})

	// TODO: rename in "determineOrigin"
	.factory('processSubcomponent', function( Point, cutSegment, moveSegmentEnd, transformComponent, transformToMatrix2d ) {
		return function( component, subcomponent, processor, full ) {
			var origin,
				from,
				to,
				fromSeg,
				toSeg;

			// the args of the subcomponents have to be recalculated according to the parent context
			if ( subcomponent.argsFn ) {
				subcomponent.args = subcomponent.argsFn( component.flatContext );
			}

			/* determine subcomponent origin and cut segments if needed */
			if ( subcomponent.type === 'add' ) {
				origin = subcomponent.atFn( component.flatContext );

			} else if ( subcomponent.type === 'replace' ) {
				from = subcomponent.fromFn( component.flatContext );
				fromSeg = component.segments[ subcomponent.fromId ];
				// neither 'start' nor 'end'
				if ( typeof from !== 'string' ) {
					cutSegment( fromSeg, from, 'end' );
				}

				to = subcomponent.toFn( component.flatContext );
				toSeg = component.segments[ subcomponent.toId ];
				// neither 'start' nor 'end'
				if ( typeof to !== 'string' ) {
					cutSegment( toSeg, to, 'start' );
				}

				origin = subcomponent.invert ?
					toSeg.$render.start:
					fromSeg.$render.end;
				// TODO: this should be a different variable
				origin.to = subcomponent.invert ?
					fromSeg.$render.end:
					toSeg.$render.start;
			}

			// init or process subcomponent (depending on the caller)
			processor( subcomponent, origin, undefined, full );

			if ( subcomponent.transformFn ) {
				transformComponent(
					subcomponent,
					transformToMatrix2d(
						subcomponent.transformFn( component.flatContext ),
						toSeg.$render.start
					),
					[
						subcomponent.firstSegment.start && subcomponent.firstSegment.start,
						subcomponent.firstSegment.ctrl0,
					]
				);
			}

			// the last point of an inverted segment would be ignored when it gets inverted
			if ( subcomponent.invert ) {
				// so move the last point of the previous segment
				moveSegmentEnd( fromSeg, 'end', subcomponent.firstSegment.end );
			}
		};
	})

	// we wouldn't need this function if we had harmony proxies
	.factory('flattenContext', function() {
		return function( component ) {
			var i;
			component.flatContext = {};

			for ( i in component.params ) {
				component.flatContext[i] = component.params[i];
			}

			for ( i in component.args ) {
				component.flatContext[i] = component.args[i];
			}

			component.flatContext.self = component.segments;
		};
	})

	.factory('transformComponent', function( transformSegment, transformToMatrix2d ) {
		return function( component, transform, except ) {
			// accept both a matrix or a transform string
			var matrix = typeof transform === 'string' ?
					transformToMatrix2d( transform ):
					transform;

			component.segments.forEach(function( segment ) {
				transformSegment( segment, matrix, except );
			});
		};
	});
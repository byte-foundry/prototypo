'use strict';

angular.module('prototypo.Component', ['prototypo.Segment', 'prototypo.Point'])
	.factory('Component', function( initComponent, processComponent ) {

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
			process: function( curPos ) {
				return processComponent( this, curPos );
			}
		};

		return Component;
	})

	.factory('initComponent', function( Segment, processComponent, processSubcomponent ) {
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

			// save numbers of iterations for later
			component.iter = i;

			// filter empty segments
			filteredSegments = component.segments.filter(function( segment ) {
				return segment instanceof Segment;
			});
			// link segments together
			filteredSegments.forEach(function( segment, i ) {
					// natural order
					if ( !component.invert && this[i + 1] ) {
						segment.next = this[i + 1];
					}
					// invert order
					if ( component.invert && this[i - 1] ) {
						segment.next = this[i - 1];
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
				if ( subcomponent.type === 'replace' ) {
					// from segment[n].start <=> from segment[n-1].end
					subcomponent.from = subcomponent.fromFn( component.flatContext );
					if ( subcomponent.from === 'start' ) {
						// search for previous non-false segment
						// TODO: what happens if we're in an inverted segment? Chaos.
						do {
							subcomponent.fromId--;
						} while (
							subcomponent.fromId > 0 &&
							!( component.segments[ subcomponent.fromId ] instanceof Segment )
						);
						subcomponent.fromFn = function() { return 'end'; };
					}

					// to segment[n].end <=> to segment[n+1].start
					subcomponent.to = subcomponent.toFn( component.flatContext );
					if ( subcomponent.to === 'end' ) {
						// search for following non-false segment
						// TODO: what happens if we're in an inverted segment? Chaos.
						do {
							subcomponent.toId++;
						} while (
							subcomponent.toId < component.segments.length &&
							!( component.segments[ subcomponent.toId ] instanceof Segment )
						);
						subcomponent.toFn = function() { return 'start'; };
					}
				}

				processSubcomponent( component, subcomponent, initComponent );

				/* link subcomponent */
				if ( subcomponent.type === 'add' ) {
					component.lastSegment.next = subcomponent.firstSegment;
					component.lastSegment = subcomponent.lastSegment;

				} else if ( subcomponent.type === 'replace' ) {
					if ( subcomponent.fromId < 1 ) {
						subcomponent.lastSegment.next = component.firstSegment;
						component.firstSegment = subcomponent.firstSegment;
					} else {
						// avoid this subcomponents to be skipped because of the previous subcomponent
						if ( i > 0 && component.components[ i -1 ].lastSegment.next === component.segments[ subcomponent.fromId ].next ) {
							component.components[ i -1 ].lastSegment.next = subcomponent.firstSegment;

						} else {
							component.segments[ subcomponent.fromId ].next = subcomponent.firstSegment;
						}
					}

					if ( subcomponent.toId > component.segments.length ) {
						component.lastSegment.next = subcomponent.firstSegment;
						component.lastSegment = subcomponent.lastSegment;
					} else {
						subcomponent.lastSegment.next = component.segments[ subcomponent.toId ];
					}
				}
			});
		};
	})

	.factory('processComponent', function( Segment, Point, processSubcomponent, flattenContext ) {
		return function processComponent( component, _curPos, recurse ) {
			var curPos = Point( _curPos );

			// initialize the drawing with the origin as a fake segment
			if ( component.segments[0] === undefined ) {
				component.segments[0] = {
					end: Point( curPos ),
					x: curPos.x,
					y: curPos.y,
					toSVG: function() { return ''; }
				};

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

			/* process subcomponents (not on init) */
			if ( recurse !== false ) {
				component.components.forEach(function( subcomponent ) {
					processSubcomponent( component, subcomponent, processComponent );
				});
			}
		};
	})

	// TODO: rename in "determineOrigin"
	.factory('processSubcomponent', function( cutSegment ) {
		return function( component, subcomponent, processor ) {
			var origin;

			// the args of the subcomponents have to be recalculated according to the parent context
			if ( subcomponent.argsFn ) {
				subcomponent.args = subcomponent.argsFn( component.flatContext );
			}

			/* determine subcomponent origin and cut segments if needed */
			if ( subcomponent.type === 'add' ) {
				origin = subcomponent.atFn( component.flatContext );

			} else if ( subcomponent.type === 'replace' ) {
				// TODO: no need to keep a ref to this from var (and to bellow)
				subcomponent.from = subcomponent.fromFn( component.flatContext );
				// neither 'start' nor 'end'
				if ( typeof subcomponent.from !== 'string' ) {
					cutSegment( component.segments[ subcomponent.fromId ], subcomponent.from, 'end' );
				}

				subcomponent.to = subcomponent.toFn( component.flatContext );
				// neither 'start' nor 'end'
				if ( typeof subcomponent.to !== 'string' ) {
					cutSegment( component.segments[ subcomponent.toId ], subcomponent.to, 'start' );
				}

				origin = subcomponent.invert ?
					component.segments[ subcomponent.toId ].start:
					component.segments[ subcomponent.fromId ].end;
				origin.to = subcomponent.invert ?
					component.segments[ subcomponent.fromId ].end:
					component.segments[ subcomponent.toId ].start;
			}

			// init or process subcomponent (depending on the caller)
			processor( subcomponent, origin );
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
	});
'use strict';

angular.module('prototypo.Component', ['prototypo.Segment', 'prototypo.Point', 'prototypo.segmentUtils'])
	.factory('Component', function( initComponent, processComponent, mergeComponent, findPoint ) {

		function Component( formula, args ) {
			// new is optional
			if ( !( this instanceof Component ) ) {
				return new Component( formula, args );
			}

			this.formula = formula;
			this.segments = new Array(formula.length);

			// before/after components
			if ( args.mergeAt !== undefined ) {
				this.mergeAt = args.mergeAt;
				//this.mergeToGlyphAt = args.mergeToGlyphAt;
				this.after = args.after;
			}
			// cut components
			if ( args.cut !== undefined ) {
				this.cut = args.cut;
				this.fromFn = args.fromFn;
				this.to = args.to;
			}
			this.invert = args.to === 'start';

			// useless
			this.args = args.args || {};

			this.context = {
				controls: args.controls,
				// useless, only argsFN is used
				args: this.args,
				argsFn: args.argsFn,
				// deprecated, use filter instead
				find: findPoint,
				self: this.segments
			};

			this.components = formula.components.map(function( component ) {
				/* override args */
				// before/after components
				if ( component.mergeAt !== undefined ) {
					args.mergeAt = component.mergeAt;
					args.after = component.after;
				}
				// cut components
				if ( component.cut !== undefined ) {
					args.cut = component.cut;
					args.fromFn = component.fromFn;
					args.to = component.to;
				}
				args.argsFn = component.argsFn;
				// useless
				args.args = component.args;

				return Component( args.formulaLib[ component.type ], args );
			}, this);
		}

		Component.prototype = {
			init: function( curPos, glyph ) { initComponent( this, curPos, glyph ); },
			process: function( curPos, glyph ) { processComponent( this, curPos, glyph ); },
			mergeTo: function( glyph ) { mergeComponent( this, glyph ); }
		};

		return Component;
	})

	.factory('initComponent', function( Segment, Point, processComponent, processSubcomponent, mergeComponent ) {
		return function initComponent( component, curPos, glyph ) {
			var i = 0,
				hasNaN = false,
				_glyph,
				checkNaN = function( segment ) {
					return isNaN( segment.x ) || isNaN( segment.y );
				},
				filteredSegments;

			do {
				_glyph = [];
				processComponent( component, curPos, _glyph, false );
				hasNaN = component.segments.some(checkNaN);
			} while ( ++i < 10 && hasNaN );

			if ( !hasNaN ) {
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

				// legacy merge for before/after components
				if ( component.mergeAt !== undefined ) {
					mergeComponent( component, glyph );
				}

				component.components.forEach(function( subcomponent ) {
					if ( subcomponent.mergeAt !== undefined ) {
						// the args of the subcomponents have to be recalculated according to the parent context
						if ( subcomponent.context.argsFn ) {
							subcomponent.context.args = subcomponent.context.argsFn( component.flatContext );
						}

						// init mergeToGlyphAt by searching the attach to the parent in the glyph
						subcomponent.mergeToGlyphAt =
							glyph.indexOf( component.segments[ subcomponent.mergeAt ] ) +
							( subcomponent.after ? 1 : 0 );

						initComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );

					} else {
						processSubcomponent( component, subcomponent, initComponent );
					}
				});

			} else {
				throw 'Component segments cannot be initialized:\n' +
					component.segments.map(function( segment, i ) { return i + ': ' + segment.toSVG(); }).join('\n');
			}
		};
	})

	.factory('processComponent', function( Segment, Point, processSubcomponent, mergeComponent, flattenContext, invertSegment ) {
		return function processComponent( component, _curPos, glyph, recurse ) {
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

			component.flatContext = flattenContext( component.context );

			component.formula.segments.forEach(function( segmentFormula, i ) {
				// only process non-empty segments
				if ( i > 0 && segmentFormula ) {
					if ( component.segments[i] === undefined ) {
						component.segments[i] = Segment( segmentFormula( component.flatContext ), curPos );
					// reuse existing segments (limit GC and allows control-points viz to be persistant)
					} else {
						component.segments[i].update( segmentFormula( component.flatContext ) );
						component.segments[i].absolutize( curPos );
					}
				}
			});

			// legacy merge for before/after components
			if ( component.mergeAt !== undefined ) {
				mergeComponent( component, glyph );
			}

			// don't recurse on initialization
			if ( recurse !== false ) {
				component.components.forEach(function( subcomponent ) {
					// legacy before/after processComponent
					if ( subcomponent.mergeAt !== undefined ) {
						// the args of the subcomponents have to be recalculated according to the parent context
						if ( subcomponent.context.argsFn ) {
							subcomponent.context.args = subcomponent.context.argsFn( component.$context );
						}
						processComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );

					} else {
						processSubcomponent( component, subcomponent, processComponent );
					}
				});
			}

			if ( component.invert ) {
				component.segments.forEach(invertSegment);
			}
		};
	})

	.factory('processSubcomponent', function( cutSegment, moveSegmentEnd ) {
		return function( component, subcomponent, processor ) {
			// the args of the subcomponents have to be recalculated according to the parent context
			if ( subcomponent.context.argsFn ) {
				subcomponent.context.args = subcomponent.context.argsFn( component.flatContext );
			}

			cutSegment( component.segments[ subcomponent.cut ], subcomponent.fromFn( component.flatContext ), subcomponent.to );

			processor( subcomponent, component.segments[ subcomponent.cut ][ subcomponent.to ] );

			// link subcomponent to its parent
			if ( !subcomponent.invert ) {
				// link from the component to the beginning of the subcomponent
				component.segments[ subcomponent.cut ].next = subcomponent.firstSegment;
				// link back from the end of the subcomponent to the component
				if ( subcomponent.cut +1 < component.segments.length ) {
					subcomponent.lastSegment.next = component.segments[ subcomponent.cut +1 ];

				// if the subcomponent was added at the end of the component, update .lastSegment
				} else {
					component.lastSegment = subcomponent.lastSegment;
				}

			} else {
				// link from the component to the beginning of the subcomponent
				if ( subcomponent.cut -1 >= 0 ) {
					component.segments[ subcomponent.cut -1 ].next = subcomponent.firstSegment;

				// if the subcomponent was added at the beginning of the component, update .firstSegment
				} else {
					component.firstSegment = subcomponent.firstSegment;
				}
				// link back from the end of the subcomponent to the component
				subcomponent.lastSegment.next = component.segments[ subcomponent.cut ];
			}

			if ( ( subcomponent.invert && subcomponent.cut +1 < component.segments.length ) ||
				( !subcomponent.invert && subcomponent.cut -1 >= 0 ) ) {

				moveSegmentEnd(
					component.segments[ subcomponent.cut + ( subcomponent.invert ? -1 : 1 ) ],
					subcomponent.invert ? 'end' : 'start',
					subcomponent[ ( subcomponent.invert ? 'first' : 'last' ) + 'Segment' ][ subcomponent.to ]
				);
			}
		};
	})

	.factory('mergeComponent', function( Segment ) {
		return function( component, glyph ) {

			[].splice.apply( glyph, [component.mergeToGlyphAt, 0].concat(
				// remove empty segments from the glyph
				component.segments.filter(function( segment ) { return segment instanceof Segment; })
			));

			if ( component.mergeAt !== 0 ) {
				component.mergeAt.virtual = true;
			}
		};
	})

	// we wouldn't need this function if we had harmony proxies
	.factory('flattenContext', function() {
		return function( context ) {
			var flatCtx = {},
				i;

			for ( i in context.controls ) {
				flatCtx[i] = context.controls[i];
			}

			for ( i in context.args ) {
				flatCtx[i] = context.args[i];
			}

			// deprecated, use filter "on" instead
			flatCtx.find = context.find;

			flatCtx.self = context.self;

			return flatCtx;
		};
	});
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
				this.from = args.from;
				this.to = args.to;
			}

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
					args.from = component.from;
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

	.factory('initComponent', function( Segment, Point, processComponent, mergeComponent, cutSegment, moveSegmentEnd, flattenContext ) {
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
						if ( !component.firstSegment ) {
							component.firstSegment = segment;
						}

						// natural order
						if ( component.to === 'end' && this[i + 1] ) {
							segment.next = this[i + 1];
						}
						// invert order
						if ( component.to === 'start' && this[i - 1] ) {
							segment.next = this[i - 1];
						}

						component.lastSegment = segment;
					}, filteredSegments);

				// legacy merge for before/after components
				if ( component.mergeAt !== undefined ) {
					mergeComponent( component, glyph );
				}

				component.components.forEach(function( subcomponent ) {
					var flatCtx = flattenContext( component.context );

					// the args of the subcomponents have to be recalculated according to the parent context
					if ( subcomponent.context.argsFn ) {
						subcomponent.context.args = subcomponent.context.argsFn( flatCtx );
					}

					if ( subcomponent.mergeAt !== undefined ) {
						// init mergeToGlyphAt by searching the attach to the parent in the glyph
						subcomponent.mergeToGlyphAt =
							glyph.indexOf( component.segments[ subcomponent.mergeAt ] ) +
							( subcomponent.after ? 1 : 0 );

						initComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );

					} else {
						cutSegment( component.segments[ subcomponent.cut ], subcomponent.fromFn( flatCtx ), subcomponent.to );

						initComponent( subcomponent, component.segments[ subcomponent.cut ][ subcomponent.to ] );

						// link subcomponent to its parent
						if ( subcomponent.to === 'end' ) {
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

						if ( ( subcomponent.to === 'end' && subcomponent.cut +1 < component.segments.length ) ||
							( subcomponent.to === 'start' && subcomponent.cut -1 >= 0 ) ) {

							moveSegmentEnd(
								component.segments[ subcomponent.cut + ( subcomponent.to === 'end' ? 1 : -1 ) ],
								subcomponent.to === 'start' ? 'end' : 'start',
								subcomponent.lastSegment[ subcomponent.to ]
							);
						}
					}
				});

			} else {
				throw 'Component segments cannot be initialized:\n' +
					component.segments.map(function( segment, i ) { return i + ': ' + segment.toSVG(); }).join('\n');
			}
		};
	})

	.factory('processComponent', function( Segment, Point, mergeComponent, flattenContext, invertSegment ) {
		function processComponent( component, _curPos, glyph, recurse ) {
			var curPos = Point( _curPos );

			// initialize the drawing with the origin as a fake segment
			//if ( component.segments[0] === undefined ) {
				component.segments[0] = {
					end: Point( curPos ),
					x: curPos.x,
					y: curPos.y,
					toSVG: function() { return ''; }
				};

			/*} else {
				component.segments[0].end.x = component.segments[0].x = curPos.x;
				component.segments[0].end.y = component.segments[0].y = curPos.y;
			}*/

			var flatCtx = flattenContext( component.context );

			component.formula.segments.forEach(function( segmentFormula, i ) {
				// only process non-empty segments
				if ( i > 0 && segmentFormula ) {
					if ( component.segments[i] === undefined ) {
						component.segments[i] = Segment( segmentFormula( flatCtx ), curPos );
					// reuse existing segments (limit GC and allows control-points viz to be persistant)
					} else {
						component.segments[i].update( segmentFormula( flatCtx ) );
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
					// the args of the subcomponents have to be recalculated according to the parent context
					if ( subcomponent.context.argsFn ) {
						subcomponent.context.args = subcomponent.context.argsFn( flatCtx );
					}

					// legacy before/after processComponent
					if ( subcomponent.mergeAt !== undefined ) {
						processComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );
					} else {
						processComponent( subcomponent, component.segments[ subcomponent.cut ][ subcomponent.to ] );
					}
				});
			}

			// invert component
			if ( component.to === 'start' ) {
				component.segments.forEach(invertSegment);
			}
		}

		return processComponent;
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
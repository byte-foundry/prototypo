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
			this.mergeAt = args.mergeAt || 0;
			this.after = args.after || false;
			this.args = args.args || {};

			this.context = {
				controls: args.controls,
				args: this.args,
				find: findPoint,
				self: this.segments
			};

			// too early to initilize, we need a glyph as a context
			//this.init();

			this.components = formula.components.map(function( component ) {
				// override current args
				args.mergeAt = this.segments[ component.mergeAt ];
				args.after = component.after;
				args.args = component.args;
				//args.curPos = Point( args.mergeAt.end );

				return Component( args.formulaLib[ component.type ], args );
			});
		}

		Component.prototype = {
			init: function( curPos ) { initComponent( this, curPos ); },
			process: function( curPos, glyph ) { processComponent( this, curPos, glyph ); },
			mergeTo: function( glyph ) { mergeComponent( this, glyph ); }
		};

		return Component;
	})

	.factory('initComponent', function( Point, processComponent ) {
		return function initComponent( component, curPos ) {
			var i = 0,
				hasNaN = false,
				glyph = [],
				checkNaN = function( segment ) {
					return isNaN( segment.x ) || isNaN( segment.y );
				};

			do {
				glyph = [];
				processComponent( component, curPos, glyph, false );
				hasNaN = glyph.some(checkNaN);
			} while ( ++i < 10 && hasNaN );

			if ( !hasNaN ) {
				// save numbers of iterations for later
				component.iter = i;

				component.components.forEach(function( subcomponent ) {
					initComponent( subcomponent, Point( typeof subcomponent.mergeAt === 'number' ?
						// allow numbers to be used for testing purpose
						glyph[ subcomponent.mergeAt ].end :
						subcomponent.mergeAt.end
					));
				});

			} else {
				throw 'Component segments cannot be initialized:\n' +
					component.segments.map(function( segment, i ) { return i + ': ' + segment.toSVG(); }).join('\n');
			}
		};
	})

	.factory('processComponent', function( Segment, Point, mergeComponent, flattenContext ) {
		function processComponent( component, curPos, glyph, recurse ) {

			// initialize the drawing with the origin as a fake segment
			component.segments[0] = {
				end: Point( curPos ),
				x: curPos.x,
				y: curPos.y,
				toSVG: function() { return ''; }
			};

			var flatCtx = flattenContext( component.context );

			component.formula.segments.forEach(function( segmentFormula, i ) {
				if ( i > 0 ) {
					// only process non-empty segments
					component.segments[i] = segmentFormula && Segment( segmentFormula( flatCtx ), curPos );
				}
			});

			mergeComponent( component, glyph );

			// don't recurse on initialization
			if ( recurse !== false ) {
				component.components.forEach(function( subcomponent ) {
					processComponent( subcomponent,  Point( typeof subcomponent.mergeAt === 'number' ?
							// allow numbers to be used for testing purpose
							glyph[ subcomponent.mergeAt ].end :
							subcomponent.mergeAt.end
						), glyph );
				});
			}
		}

		return processComponent;
	})

	.factory('mergeComponent', function( Segment ) {
		return function( component, glyph ) {
			var insertIndex = ( typeof component.mergeAt === 'number' ?
						// allow numbers to be used for testing purpose
						component.mergeAt :
						glyph.indexOf( component.mergeAt )
					) + ( component.after ? 1 : 0 );

			[].splice.apply( glyph, [insertIndex, 0].concat(
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

			flatCtx.find = context.find;

			flatCtx.self = context.self;

			return flatCtx;
		};
	});
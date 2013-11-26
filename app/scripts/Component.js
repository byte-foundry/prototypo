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
				this.mergeToGlyphAt = args.mergeToGlyphAt;
				this.after = args.after;
			}
			// cut components
			if ( args.cut !== undefined ) {
				this.cut = args.cut;
				this.from = args.from;
				this.to = args.to;
				this.invert = args.invert;
			}

			this.args = args.args || {};

			this.context = {
				controls: args.controls,
				args: this.args,
				find: findPoint,
				self: this.segments
			};

			this.components = formula.components.map(function( component ) {
				/* override args */
				// before/after components
				if ( component.mergeAt !== undefined ) {
					args.mergeAt = component.mergeAt;
					args.after = component.after;
					args.args = component.args;
				}
				// cut components
				if ( component.cut !== undefined ) {
					args.cut = component.cut;
					args.from = component.from;
					args.to = component.to;
					args.invert = component.invert;
				}

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

	.factory('initComponent', function( Point, processComponent, mergeComponent ) {
		return function initComponent( component, curPos, glyph ) {
			var i = 0,
				hasNaN = false,
				_glyph,
				checkNaN = function( segment ) {
					return isNaN( segment.x ) || isNaN( segment.y );
				};

			do {
				_glyph = [];
				processComponent( component, curPos, _glyph, false );
				hasNaN = _glyph.some(checkNaN);
			} while ( ++i < 10 && hasNaN );

			if ( !hasNaN ) {
				// save numbers of iterations for later
				component.iter = i;

				mergeComponent( component, glyph );

				component.components.forEach(function( subcomponent ) {
					// init mergeToGlyphAt by searching the attach to the parent in the glyph
					subcomponent.mergeToGlyphAt =
						glyph.indexOf( component.segments[ subcomponent.mergeAt ] ) +
						( subcomponent.after ? 1 : 0 );

					initComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );
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

			mergeComponent( component, glyph );

			// don't recurse on initialization
			if ( recurse !== false ) {
				component.components.forEach(function( subcomponent ) {
					processComponent( subcomponent, component.segments[ subcomponent.mergeAt ].end, glyph );
				});
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

			flatCtx.find = context.find;

			flatCtx.self = context.self;

			return flatCtx;
		};
	});
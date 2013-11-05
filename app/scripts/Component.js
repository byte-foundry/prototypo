'use strict';

angular.module('prototypo.Component', [])
	.factory('Component', function( formulaLib, initComponent, processComponent, mergeComponent ) {

		function Component( formula, args ) {
			this.formula = formula;
			this.segments = [];
			this.insertAt = args.insertAt || 0;
			this.after = args.after || true;
			this.params = args.params || function(){};

			this.components = formula.components.map(function( component ) {
				return Component( formulaLib[ component.type ], component );
			});
		}

		Component.prototype = {
			init: function() { initComponent( this ); },
			process: function() { processComponent( this ); },
			mergeTo: function( glyph ) { mergeComponent( this, glyph ); }
		};

		return function( formula, args ) {
			return new Component( formula, args );
		};
	})

	.factory('initComponent', function() {
		return function( component ) {
			//this.segments = [];
		};
	})

	.factory('processComponent', function( Segment ) {
		function processComponent( component, args, glyph ) {
			var context = {
					controls: args.controls,
					params: args.params,
					self: component.segments
				};

			// initialize the drawing with the origin
			component.segments[0] = Segment( args.curPos );

			component.formula.forEach(function( segmentFormula, i ) {
				// only process non-empty segments
				if ( segmentFormula ) {
					component.segments[i] = Segment( segmentFormula( context ), args.curPos );
				}
			});

			component.mergeTo( glyph );

			component.components.forEach(function( component ) {
				component.process( args, glyph );
			});
		}

		return processComponent;
	})

	.factory();
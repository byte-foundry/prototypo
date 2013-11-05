'use strict';

angular.module('prototypo.Formula', [])
	.factory('Formula', function( parseFormula, interpolateFormula ) {
		function Formula( data ) {
			this.parse( data );
			this.interpolate();
		}

		Formula.prototype = {
			parse: function( data ) { parseFormula( this, data ); },
			interpolate: function() { interpolateFormula( this ); }
		};

		return function( data ) {
			return new Formula( data );
		};
	})

	// parse the text representation of a formula
	.factory('parseFormula', function() {
		var rcomment = /\/\/.*$/gm,
			rcomponent = /^[\t ]*(after|before)[\t ]+(\d+)[\t ]*:[\t ]*([\w-]+?)\((.*?)\)[\t ]*$/gm,
			rnormalize = /[ \t]*(?:\r?\n|\r)[ \t]*/g,
			rtrim = /\n*$/g,
			rsplit = /(?:\r?\n|\r)/;

		return function( formula, data ) {
			var components = [];

			data = data
				// remove single-line comments
				.replace(rcomment, '')

				// parse components
				.replace(rcomponent, function() {
					components.push({
						insertAt: arguments[2],
						after: arguments[1] === 'after',
						type: arguments[3],
						rawParams: arguments[4]
					});
					return '';
				})

				// normalize new lines and trim lines
				.replace(rnormalize, '\n')

				// remove empty lines at the end of the file
				.replace(rtrim, '');

			// add an empty "line 0" at the beginning of the formula
			formula.raw = ( '\n' + data ).split(rsplit);
			formula.components = components;
		};
	})

	// execute various operations on the JS representation
	// of a glyph when it is loaded or first used
	.factory('interpolateFormula', function( $interpolate ) {
		var rempty = /^[ \t]*$/;

		return function( formula ) {
			if ( formula.segments ) {
				return;
			}

			// interpolate segments
			formula.segments = formula.raw.map(function( rawSegment ) {
				return rempty.test( rawSegment ) ? false : $interpolate( rawSegment );
			});
			// we don't need the raw formula anymore
			delete formula.raw;

			// interpolate sub-components params
			formula.components.forEach(function( component ) {
				component.params = $interpolate( component.rawParams );
				// we don't need the raw params anymore
				delete component.rawParams;
			});
		};
	});
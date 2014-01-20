'use strict';

angular.module('prototypo.Formula', [])
	.factory('Formula', function( parseFormula, interpolateFormula ) {
		function Formula( data ) {
			// new is optional
			if ( !( this instanceof Formula ) ) {
				return new Formula( data );
			}

			this.parse( data );
			this.interpolate();
		}

		Formula.prototype = {
			parse: function( data ) { parseFormula( this, data ); },
			interpolate: function() { interpolateFormula( this ); }
		};

		return Formula;
	})

	// parse the text representation of a formula
	.factory('parseFormula', function() {
		var rnormalizespace = /[ \t ]+/g,
			rnormalizeline = /(?:\r?\n|\r)/g,
			rtrimspace = /(?:^ | $)/gm,
			rtrimline = /\n+$/g,
			rcomment = /\/\/.*$/gm,
			rdoublequestionmark = /\?\?/g,
			rreplace = /^replace from self\[ ?(\d+) ?\] at \{\{ ?(.+?) ?\}\} to self\[ ?(\d+) ?\] at \{\{ ?(.+?) ?\}\} with( inverted)? ([^ \n]+)(?: \{\{ ?(.+?) ?\}\})?(?: transform \{\{ ?(.+?) ?\}\})?$/gm,
			radd = /^add ([^ \n]+)(?: \{\{ ?(.+?) ?\}\})? at \{\{ ?(.+?) ?\}\}$/gm,
			rsplit = /(?:\r?\n|\r)/,
			rnumbervar = /self\[\s*-?\d+\s*\]\.[xya]/g;

		return function( formula, data ) {
			var components = [];

			data = data
				// normalize white space
				.replace(rnormalizespace, ' ')

				// normalize new-lines
				.replace(rnormalizeline, '\n')

				.replace(rtrimspace, '')

				// remove single-line comments
				.replace(rcomment, '')

				// replace double question marks by NaN
				.replace(rdoublequestionmark, 'NaN')

				// add '1*' multiplier to all self[n].*
				// to force angular to convert undefined to NaN
				.replace(rnumbervar, '1*$&')

				// parse before/after components
				.replace(radd, function() {
					components.push({
						raw: arguments[0],
						type: 'add',
						name: arguments[1],
						rawArgs: arguments[2],
						rawAt: arguments[3]
					});
					return '';
				})

				// parse replace components
				.replace(rreplace, function() {
					var invertFromTo = !!arguments[5];
					// syntax independant alternative, might not work because of Component.js ~@line290
					//var invertFromTo = +arguments[1] > +arguments[3];

					components.push({
						raw: arguments[0],
						type: 'replace',
						fromId: +arguments[ !invertFromTo ? 1 : 3 ],
						rawFrom: arguments[ !invertFromTo ? 2 : 4 ],
						toId: +arguments[ !invertFromTo ? 3 : 1 ],
						rawTo: arguments[ !invertFromTo ? 4 : 2 ],
						invert: !!arguments[5],
						name: arguments[6],
						rawArgs: arguments[7],
						rawTransform: arguments[8]
					});
					return '';
				})

				// remove empty lines at the end of the file
				.replace(rtrimline, '');

			// add an empty "line 0" at the beginning of the formula
			formula.raw = ( '\n' + data ).split(rsplit);
			formula.components = components;

			return formula;
		};
	})

	// execute various operations on the JS representation
	// of a glyph when it is loaded or first used
	.factory('interpolateFormula', function( $interpolate, $parse ) {
		var rempty = /^[ \t]*$/;

		return function( formula ) {
			// interpolate segments
			formula.segments = formula.raw.map(function( rawSegment ) {
				return rempty.test( rawSegment ) ? false : $interpolate( rawSegment );
			});
			// we don't need the raw formula anymore
			delete formula.raw;

			// interpolate sub-components params
			formula.components.forEach(function( component ) {
				if ( component.rawArgs ) {
					component.argsFn = $parse( component.rawArgs );
				}
				delete component.rawArgs;

				if ( component.rawTransform ) {
					component.transformFn = $parse( component.rawTransform );
				}
				delete component.rawTransform;

				if ( component.rawFrom !== undefined ) {
					component.fromFn = $parse( component.rawFrom );
				}
				delete component.rawFrom;

				if ( component.rawTo !== undefined ) {
					component.toFn = $parse( component.rawTo );
				}
				delete component.rawTo;

				if ( component.rawAt !== undefined ) {
					component.atFn = $parse( component.rawAt );
				}
				delete component.rawAt;

				delete component.raw;
			});

			return formula;
		};
	});
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
			rreplace = /^replace from self\[ ?(\d+) ?\] at \{\{ ?(.+?) ?\}\} to self\[ ?(\d+) ?\] at \{\{ ?(.+?) ?\}\} with ([^ \n]+)(?: \{\{ ?(.+?) ?\}\})?$/gm,
			radd = /^add ([^ \n]+)(?: \{\{ ?(.+?) ?\}\})? at \{\{ ?(.+?) ?\}\}$/gm,
			rsplit = /(?:\r?\n|\r)/;

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

				// parse before/after components
				.replace(radd, function() {
					components.push({
						type: 'add',
						name: arguments[1],
						rawArgs: arguments[2],
						rawAt: arguments[3]
					});
					return '';
				})

				// parse replace components
				.replace(rreplace, function() {
					components.push({
						type: 'replace',
						fromSegment: +arguments[1],
						rawFrom: arguments[2],
						toSegment: +arguments[3],
						rawTo: arguments[4],
						name: arguments[5],
						rawArgs: arguments[6]
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
			});

			return formula;
		};
	});
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
			rbeforeafter = /^(after|before) (\d+) ?: ?([\w-]+?)\((.*?)\)$/gm,
			rcut = /^cut \{\{ ?self\[ ?(\d+) ?\] ?\}\} from \{\{ ?(.+?) ?\}\} to (start|end),? add ([^ ]+) \{\{ ?(.+?) ?\}\}/gm,
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
				.replace(rbeforeafter, function() {
					components.push({
						mergeAt: +arguments[2],
						after: arguments[1] === 'after',
						type: arguments[3],
						rawArgs: arguments[4]
					});
					return '';
				})

				// parse cut components
				.replace(rcut, function() {
					components.push({
						cut: +arguments[1],
						rawFrom: arguments[2],
						to: arguments[3],
						invert: arguments[3] === 'start',
						type: arguments[4],
						rawArgs: arguments[5]
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
				component.args = $interpolate( component.rawArgs );
				delete component.rawArgs;

				if ( component.rawFrom !== undefined ) {
					component.from = $interpolate( component.rawFrom );
					delete component.rawFrom;
				}
			});

			return formula;
		};
	});
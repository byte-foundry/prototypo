'use strict';

describe('Formula', function () {

	// load the controller's module
	beforeEach(module('prototypo.Formula'));

	describe('parseFormula', function() {
		it('replaces double question marks with NaN', inject(function( parseFormula ) {
			var formula = parseFormula({}, '??');

			expect( formula.raw[1] ).toBe('NaN');
		}));

		it('turns a flat text into formula and sub-component arrays', inject(function ( parseFormula ) {
			var formula = parseFormula({}, '');

			expect(formula.raw.constructor).toBe(Array);
			expect(formula.components.constructor).toBe(Array);
		}));

		it('adds an empty line at the beginning of the formula (line 0)', inject(function ( parseFormula ) {
			var formula = parseFormula({}, '');

			expect(formula.raw[0]).toBe('');
		}));

		it('removes trailing empty lines and sub-components from formula', inject(function ( parseFormula ) {
			var formula = parseFormula({}, [
				'// a simple triangle',
				'M 20 20',
				'l 30 50',
				'l 20 -40',
				'z',
				'',
				'add serif at {{ [2, 3] }}'
			].join('\n'));

			expect(formula.raw.length).toBe(6);
		}));
	});

	it('parses & interpolates segments', inject(function( Formula ) {
		var f = Formula([
			'// a simple triangle',
			'M 20 20',
			'l 30 50',
			'l 20 -40',
			'z',
			'// that\'s it!'
		].join('\n'));

		expect( f.segments.length ).toBe( 6 );
		expect( f.segments[0] ).toBe( false );
		expect( typeof f.segments[2] ).toBe( 'function' );
	}));

	it('guarantees that all undefined segment coordinates will be parsed as null', inject(function( Formula ) {
		var f = Formula([
			'// a simple triangle',
			'M {{ self[2].x - 2 }} {{ self[2].y * 3 }}',
			'l 30 50',
			'l 20 -40',
			'z',
			'// that\'s it!'
		].join('\n'));

		expect( f.segments.length ).toBe( 6 );
		expect( f.segments[2]() ).toBe( 'M null null' );
	}));

	it('parses & interpolates "add" components', inject(function( Formula ) {
		var f = Formula([
			'// a simple triangle',
			'M 20 20',
			'l 30 50',
			'l 20 -40',
			'z',
			'add serif at {{ [2, 3] }}'
		].join('\n'));

		expect( f.components[0].type ).toBe( 'add' );
		expect( f.components[0].name ).toBe( 'serif' );
		expect( f.components[0].argsFn ).toBe( undefined );
		expect( typeof f.components[0].atFn ).toBe( 'function' );

		var f1 = Formula([
			'// a simple triangle',
			'M 20 20',
			'l 30 50',
			'l 20 -40',
			'z',
			'add serif {{ {width: 12} }} at {{ [2, 3] }}'
		].join('\n'));

		expect( f1.components[0].type ).toBe( 'add' );
		expect( f1.components[0].name ).toBe( 'serif' );
		expect( typeof f1.components[0].argsFn ).toBe( 'function' );
		expect( typeof f1.components[0].atFn ).toBe( 'function' );
	}));

	it('parses & interpolates "replace" components', inject(function( Formula ) {
		var f = Formula([
			'// a simple triangle',
			'M 20 20',
			'l 30 50',
			'l 20 -40',
			'z',
			'replace from self[2] at {{ [1,2] }} to self[3] at {{ "end" }} with serif'
		].join('\n'));

		expect( f.components[0].type ).toBe( 'replace' );
		expect( f.components[0].fromId ).toBe( 2 );
		expect( typeof f.components[0].fromFn ).toBe( 'function' );
		expect( f.components[0].toId ).toBe( 3 );
		expect( typeof f.components[0].toFn ).toBe( 'function' );
		expect( f.components[0].invert ).toBe( false );
		expect( f.components[0].name ).toBe( 'serif' );
		expect( f.components[0].argsFn ).toBe( undefined );

		var f1 = Formula([
			'// a simple triangle',
			'M 20 20',
			'l 30 50',
			'l 20 -40',
			'z',
			'replace from self[2] at {{ [1,??] }} to self[3] at {{ "end" }} with inverted serif {{ [2, 3] }}'
		].join('\n'));

		expect( f1.components[0].type ).toBe( 'replace' );
		expect( f1.components[0].fromId ).toBe( 3 );
		expect( typeof f1.components[0].fromFn ).toBe( 'function' );
		expect( f1.components[0].toId ).toBe( 2 );
		expect( typeof f1.components[0].toFn ).toBe( 'function' );
		expect( f1.components[0].invert ).toBe( true );
		expect( f1.components[0].name ).toBe( 'serif' );
		expect( typeof f1.components[0].argsFn ).toBe( 'function' );
	}));
});
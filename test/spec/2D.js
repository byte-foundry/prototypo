'use strict';

describe('2D utils', function () {

	// load the controller's module
	beforeEach(module('prototypo.2D'));

	describe('transformToMatrix2d', function() {
		it('can convert a single rotate command to a matrix2d', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'rotate(90)' );

			expect( m[0] ).toBe(  0 );
			expect( m[1] ).toBe(  1 );
			expect( m[2] ).toBe( -1 );
			expect( m[3] ).toBe(  0 );
			expect( m[4] ).toBe(  0 );
			expect( m[5] ).toBe(  0 );
		}));

		it('can convert a single translate command to a matrix2d', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'translate(-100, -100)' );

			expect( m[0] ).toBe(  1 );
			expect( m[1] ).toBe(  0 );
			expect( m[2] ).toBe(  0 );
			expect( m[3] ).toBe(  1 );
			expect( m[4] ).toBe( -100 );
			expect( m[5] ).toBe( -100 );
		}));

		it('can convert a single skewX command to a matrix2d', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'skewX(-45)' );

			expect( m[0] ).toBe(  1 );
			expect( m[1] ).toBe(  0 );
			expect( m[2] ).toBe( -1 );
			expect( m[3] ).toBe(  1 );
			expect( m[4] ).toBe(  0 );
			expect( m[5] ).toBe(  0 );
		}));

		it('stops parsing transforms when encountering a skewX(90) command', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'skewX(90)' );

			expect( m[0] ).toBe( 1 );
			expect( m[1] ).toBe( 0 );
			expect( m[2] ).toBe( 0 );
			expect( m[3] ).toBe( 1 );
			expect( m[4] ).toBe( 0 );
			expect( m[5] ).toBe( 0 );
		}));

		it('can convert multiple transform commands to a matrix2d', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'translate(-100, -100) rotate(90) translate(100, 100) skewX(-45)' );

			expect( m[0] ).toBe(  0 );
			expect( m[1] ).toBe(  1 );
			expect( m[2] ).toBe( -1 );
			expect( m[3] ).toBe( -1 );
			expect( m[4] ).toBe( -200 );
			expect( m[5] ).toBe(  0 );
		}));

		it('accepts a tranform-origin as a second parameter', inject(function( transformToMatrix2d ) {
			var m = transformToMatrix2d( 'rotate(90)', {x: 50, y: -50} );

			expect( m[0] ).toBe(  0 );
			expect( m[1] ).toBe(  1 );
			expect( m[2] ).toBe( -1 );
			expect( m[3] ).toBe(  0 );
			expect( m[4] ).toBe(  0 );
			expect( m[5] ).toBe(  -100 );
		}));
	});
});
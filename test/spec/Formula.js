'use strict';

describe('Formula', function () {

  // load the controller's module
  beforeEach(module('prototypo.Formula'));

  var _Formula,
    formula,
    d0 = [
      '// a simple triangle',
      'M 20 20',
      'l 30 50',
      'l 20 -40',
      'z',
      '',
      'after 1: curve(40)',
      'before 24: serif({width: 12})'
    ].join('\n'),
    f0,
    f1;

  beforeEach(inject(function ( Formula, parseFormula ) {
    _Formula = Formula;
    formula = {};

    f0 = new Formula( d0 );
    f1 = Formula( d0 );

    parseFormula( formula, d0 );
  }));

  it('can be called with or without new', function() {
    expect(f0 instanceof _Formula).toBe(true);
    expect(f1 instanceof _Formula).toBe(true);
  });

  it('turns a flat text into formula and sub-component arrays', function () {
    expect(formula.raw.constructor).toBe(Array);
    expect(formula.components.constructor).toBe(Array);
  });

  it('adds an empty line at the beginning of the formula (line 0)', function () {
    expect(formula.raw[0]).toBe('');
  });

  it('removes trailing empty lines and sub-components from formula', function () {
    expect(formula.raw.length).toBe(6);
  });

  it('create an object from each parsed sub-component', function() {
    expect(formula.components.length).toBe(2);
    expect(formula.components[0].mergeAt).toBe('1');
    expect(formula.components[1].mergeAt).toBe('24');
    expect(formula.components[0].after).toBe(true);
    expect(formula.components[1].after).toBe(false);
    expect(formula.components[0].type).toBe('curve');
    expect(formula.components[0].rawParams).toBe('40');
    expect(formula.components[1].rawParams).toBe('{width: 12}');
  });
});

describe('Interpolate component', function () {

  // load the controller's module
  beforeEach(module('prototypo.Formula'));

  var formula;

  beforeEach(inject(function ( interpolateFormula ) {
    formula = {
      raw: [
        '',
        'M 20 20',
        'l 30 50',
        'l 20 -40',
        'z'
      ],
      components: [
        {
          mergeAt: 1,
          after: true,
          type: 'curve',
          rawParams: '40'
        }, {
          mergeAt: 24,
          after: false,
          type: 'serif',
          rawParams: '{width: 12}'
        }
      ]
    };

    interpolateFormula( formula );
  }));

  it('turns segment formulas into interpolation functions and empty lines into false', function () {
    expect(typeof formula.segments[0]).toBe('boolean');
    expect(typeof formula.segments[1]).toBe('function');
  });

  it('interpolates sub-components params', function() {
    expect(typeof formula.components[0].params).toBe('function');
  });
});
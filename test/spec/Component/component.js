'use strict';

describe('Component parser', function () {

  // load the controller's module
  beforeEach(module('prototyp0.componentUtils'));

  var component;

  beforeEach(inject(function ( parseComponent ) {
    component = {};

    parseComponent.call( component, [
      '// a simple triangle',
      'M 20 20',
      'l 30 50',
      'l 20 -40',
      'z',
      '',
      'after 1: curve(40)'
    ].join('\n'));
  }));

  it('turns a flat text into formula array and component object', function () {
    expect(component.formula.constructor).toBe(Array);
    expect(component.components.constructor).toBe(Array);
  });

  it('adds an empty line at the beginning of the formula (line 0)', function () {
    expect(component.formula[0]).toBe('');
  });

  it('removes trailing empty lines and components from formula', function () {
    expect(component.formula.length).toBe(6);
  });
});

describe('Component prepare', function () {

  // load the controller's module
  beforeEach(module('prototyp0.componentUtils', 'lodash'));

  var component;

  beforeEach(inject(function ( prepareComponent ) {
    component = {
      formula: [
        '',
        'M 20 20',
        'l 30 50',
        'l 20 -40',
        'z'
      ],
      components: {
        'after1': 'curve(40)'
      }
    };

    prepareComponent.call( component );
  }));

  it('turns segment formulas into interpolation functions and empty lines into false', function () {
    expect(typeof component.interpolated[0]).toBe('boolean');
    expect(typeof component.interpolated[1]).toBe('function');
  });
});
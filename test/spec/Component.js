'use strict'

describe('Component', function() {

  // load the controller's module
  beforeEach(module('prototypo.Component'));

  var _Component,
    c0,
    c1;

  beforeEach(inject(function ( Component ) {
    _Component = Component;

    //c0 = Component();
    //c1 = new Component();
  }));

  it('can be called with or without new', function() {
    //expect(c0 instanceof _Component).toBe(true);
    //expect(c1 instanceof _Component).toBe(true);
  });

});
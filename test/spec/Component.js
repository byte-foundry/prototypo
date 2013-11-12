'use strict'

describe('Component', function() {

  // load the controller's module
  beforeEach(module('prototypo.Component', 'prototypo.Point'));

  var _Component,
    g0,
    p0,
    p1,
    c0,
    c1,
    s0,
    s1,
    s2,
    s3,
    s4,
    s5;

  beforeEach(inject(function ( Component, Segment, Point, mergeComponent ) {
    _Component = Component;

    g0 = [];

    c0 = {
      mergeAt: 0,
      after: true,
      segments: [
        s0 = Segment('l 0 50', p0 = Point(0,0)),
        Segment('l 50 0', p0),
        Segment('l 0 -50', p0),
        Segment('l -50 0', p0),
        Segment('z', p0)
      ],
      components: [
        c1 = {
          mergeAt: s0,
          after: true,
          segments: [
            Segment('l 20 20', p1 = Point(0,50)),
            Segment('l 20 -20', p1)
          ]
        }
      ]
    };

    mergeComponent( c0, g0 );
    mergeComponent( c1, g0 );

    //console.log(g0.map(function( s ) { return s.toString() }).join(' '))

    //c0 = Component();
    //c1 = new Component();
  }));

  /*it('can be called with or without new', function() {
    expect(c0 instanceof _Component).toBe(true);
    expect(c1 instanceof _Component).toBe(true);
  });*/

  it('merges a subcomponent to its parent', function() {
    expect(g0.length).toBe(7);
  });

});
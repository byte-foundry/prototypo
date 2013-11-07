'use strict';

/* jshint camelcase: false */
describe('Segment', function() {

  // load the controller's module
  beforeEach(module('prototypo.Segment', 'prototypo.Point'));


  var _Segment,
    o,
    s0,
    s1,
    s_h,
    s_v,
    s_c,
    s_q,
    s_l,
    s_m,
    s_s,
    s_t,
    s_z,
    s_H,
    s_V,
    s_C,
    s_Q,
    s_L,
    s_M,
    s_S,
    s_T,
    s_Z,
    s_rq,
    s_rc,
    s_rs,
    s_rQ,
    s_rC,
    s_rS;

  beforeEach(inject(function( Segment, Point ) {
    _Segment = Segment;
    o = Point(0,0);

    s0 = new Segment('z', Point(o) );
    s1 = Segment('z', Point(o) );

    s_z = Segment( 'z', Point(o) );
    s_h = Segment( 'h -11.11', Point(o) );
    s_v = Segment( 'v -22.22', Point(o) );
    s_m = Segment( 'm -33.33 -44.44', Point(o) );
    s_l = Segment( 'l 55.55 66.66', Point(o) );
    s_q = Segment( 'q 77.77 88.88 99.99 11.11', Point(o) );
    s_c = Segment( 'c 11.11 22.22 33.33 44.44 55.55 66.66', Point(o) );
    s_t = Segment( 't 77.77 88.88', Point(o) );
    s_s = Segment( 's 99.99 11.11 22.22 33.33', Point(o) );
    s_Z = Segment( 'Z', Point(o) );
    s_H = Segment( 'H -11.11', Point(o) );
    s_V = Segment( 'V -22.22', Point(o) );
    s_M = Segment( 'M -33.33 -44.44', Point(o) );
    s_L = Segment( 'L 55.55 66.66', Point(o) );
    s_Q = Segment( 'Q 77.77 88.88 99.99 11.11', Point(o) );
    s_C = Segment( 'C 22.22 33.33', Point(o) );
    s_T = Segment( 'T 44.44 55.55', Point(o) );
    s_S = Segment( 'S 66.66 77.77 88.88 99.99', Point(o) );
    s_rq = Segment( 'rq 11.11 22.22 33.33 44.44', Point(o) );
    s_rc = Segment( 'rc 55.55 66.66 77.77 88.88 99.99 11.11', Point(o) );
    s_rs = Segment( 'rs 22.22 33.33 44.44 55.55', Point(o) );
    s_rQ = Segment( 'rQ 11.11 22.22 33.33 44.44', Point(o) );
    s_rC = Segment( 'rC 55.55 66.66 77.77 88.88 99.99 11.11', Point(o) );
    s_rS = Segment( 'rS 22.22 33.33 44.44 55.55', Point(o) );
  }));

  it('can be called with or without new', function() {
    expect(s0 instanceof _Segment).toBe(true);
    expect(s1 instanceof _Segment).toBe(true);
  });

  it('parses all possible kind of processed segment', function() {
    // z
    expect(s_z.command).toBe('Z');
    expect(s_z.controls.length).toBe(0);
    expect(s_z.end).toBe(undefined);
  });

  it('ignores spaces, tabs and commas completly', function() {

  });

  it('converts all coordinates to absolute', function() {

  });

});
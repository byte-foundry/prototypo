'use strict';

describe('Point structure', function () {

  // load the controller's module
  beforeEach(module('prototypo.Point'));

  var _Point, p0, p1, p2, p3, p4, p5;

  beforeEach(inject(function ( Point ) {
    _Point = Point;
    p0 = new Point(3,6);
    p1 = Point(2,5);
    p2 = Point([2,5]);
    p3 = Point('2','5');
    p4 = Point(['2','5']);
    p5 = Point(p1);
  }));

  it('can be called with or without new', function() {
    expect(p0 instanceof _Point).toBe(true);
    expect(p1 instanceof _Point).toBe(true);
  });

  it('accepts two args (x and y) or one array arg ([x,y])', function() {
    expect(p0.x).toBe(3);
    expect(p0.y).toBe(6);

    expect(p1.x).toBe(2);
    expect(p1.y).toBe(5);

    expect(p2.x).toBe(2);
    expect(p2.y).toBe(5);
  });

  it('accepts number and string args and turns them into numbers', function() {
    expect(typeof p3.x).toBe('number');
    expect(typeof p4.x).toBe('number');
  });

  it('can be serialized', function() {
    expect(p1 + '').toBe('2 5');
  });

  it('accepts a Point as an argument, and this results in an independent clone', function() {
    p1.x = 4;
    p1.y = 7;

    expect(p5.x).toBe(2);
    expect(p5.y).toBe(5);
  });

  it('can translate a Point on x axis', function() {
    /*p1.x = 4;
    p1.y = 7;

    expect(p5.x).toBe(2);
    expect(p5.y).toBe(5);*/
  });
});
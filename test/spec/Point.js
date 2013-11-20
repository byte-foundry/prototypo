'use strict';

describe('Point structure', function () {

  // load the controller's module
  beforeEach(module('prototypo.Point'));

  var _Point, p0, p1, p2, p3, p4, p5, p6;

  beforeEach(inject(function ( Point ) {
    _Point = Point;
    p0 = new Point(3,6);
    p1 = Point(2,5);
    p2 = Point([2,5]);
    p3 = Point('2','5');
    p4 = Point(['2','5']);
    p5 = Point(p1),
    p6 = Point({x: 2, y: 5});
  }));

  it('can be called with or without new', function() {
    expect(p0 instanceof _Point).toBe(true);
    expect(p1 instanceof _Point).toBe(true);
  });

  it('accepts two args: x and y', function() {
    expect(p0.x).toBe(3);
    expect(p0.y).toBe(6);

    expect(p1.x).toBe(2);
    expect(p1.y).toBe(5);
  });

  it('accepts an array arg: [x,y]', function() {
    expect(p2.x).toBe(2);
    expect(p2.y).toBe(5);
  });

  it('accepts an object arg: {x:x,y:y}',function() {
    expect(p6.x).toBe(2);
    expect(p6.y).toBe(5);
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

  it('accepts undefined parameters', inject(function(Point) {
    var p1 = Point( undefined, 5 );
    expect(p1.x).toBeNaN();
    expect(p1.y).toBe(5);

    var p2 = Point( 2, undefined );
    expect(p2.y).toBeNaN();
    expect(p2.x).toBe(2);

    var p3 = Point([undefined, 5]);
    expect(p3.x).toBeNaN();
    expect(p3.y).toBe(5);

    var p4 = Point([2, undefined]);
    expect(p4.y).toBeNaN();
    expect(p4.x).toBe(2);

    var p5 = Point({y: 5});
    expect(p5.x).toBeNaN();
    expect(p5.y).toBe(5);

    var p6 = Point({x: 2});
    expect(p6.y).toBeNaN();
    expect(p6.x).toBe(2);
  }));

  it('can translate a Point on x axis', inject(function( Point ) {
    var p1 = Point(2,5);
    p1.translateX(4)

    expect(p1.x).toBe(6);
  }));

  it('can translate a Point on y axis', inject(function( Point ) {
    var p1 = Point(2,5);
    p1.translateY(-2)

    expect(p1.y).toBe(3);
  }));

  it('can translate a Point on x and y axis', inject(function( Point ) {
    var p1 = Point(2,5);
    p1.translate(4,-2)

    expect(p1.x).toBe(6);
    expect(p1.y).toBe(3);
  }));

  it('can translate a Point with NaN coords', inject(function( Point ) {
    var p1 = Point(2,undefined);
    p1.translate(4,-2)

    expect(p1.x).toBe(6);
    expect(p1.y).toBeNaN();

    var p2 = Point(undefined,5);
    p2.translate(4,-2)

    expect(p2.y).toBe(3);
    expect(p2.x).toBeNaN();
  }));
});
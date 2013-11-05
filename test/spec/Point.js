describe('Point structure', function () {

  // load the controller's module
  beforeEach(module('prototypo.Point'));

  var p1, p2, p3, p4;

  beforeEach(inject(function ( Point ) {
  	p1 = Point(2,5);
  	p2 = Point([2,5]);
  	p3 = Point('2','5');
  	p4 = Point(['2','5']);
  }));

  it('accepts two args (x and y) or one array arg ([x,y])', function() {
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
});
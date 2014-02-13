'use strict';

beforeEach(module('prototypo.Component', 'prototypo.Formula'));

describe('Component', function() {
	describe('processComponent', function() {
		var c;

		it('interpolates all the points with an empty .segments array', inject(function( Point, processComponent, $interpolate ) {
			c = {
				formula: {segments: [
					false,
					$interpolate('m 0 0'),
					$interpolate('l 20 20'),
					false,
					$interpolate('c 10 20 30 40 50 60'),
					$interpolate('z')
				]},
				params: {},
				args: {},
				segments: [],
				components: []
			};

			processComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 6 );

			expect( c.segments[1].start.x ).toBe( -10 );
			expect( c.segments[1].start.y ).toBe( -10 );
			expect( c.segments[1].end.x ).toBe( -10 );
			expect( c.segments[1].end.y ).toBe( -10 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 10 );
			expect( c.segments[2].end.y ).toBe( 10 );

			expect( c.segments[4].start.x ).toBe( 10 );
			expect( c.segments[4].start.y ).toBe( 10 );
			expect( c.segments[4].ctrl0.x ).toBe( 10 + 10 );
			expect( c.segments[4].ctrl0.y ).toBe( 10 + 20 );
			expect( c.segments[4].ctrl1.x ).toBe( 10 + 30 );
			expect( c.segments[4].ctrl1.y ).toBe( 10 + 40 );
			expect( c.segments[4].end.x ).toBe( 10 + 50 );
			expect( c.segments[4].end.y ).toBe( 10 + 60 );
		}));

		it('interpolates all the points with an existing .segments array', inject(function( Point, processComponent ) {
			processComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 6 );

			expect( c.segments[1].start.x ).toBe( -10 );
			expect( c.segments[1].start.y ).toBe( -10 );
			expect( c.segments[1].end.x ).toBe( -10 );
			expect( c.segments[1].end.y ).toBe( -10 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 10 );
			expect( c.segments[2].end.y ).toBe( 10 );

			expect( c.segments[4].start.x ).toBe( 10 );
			expect( c.segments[4].start.y ).toBe( 10 );
			expect( c.segments[4].ctrl0.x ).toBe( 10 + 10 );
			expect( c.segments[4].ctrl0.y ).toBe( 10 + 20 );
			expect( c.segments[4].ctrl1.x ).toBe( 10 + 30 );
			expect( c.segments[4].ctrl1.y ).toBe( 10 + 40 );
			expect( c.segments[4].end.x ).toBe( 10 + 50 );
			expect( c.segments[4].end.y ).toBe( 10 + 60 );
		}));

		it('interpolates all the points of an inverted component', inject(function( Point, $interpolate, processComponent ) {
			var c = {
				invert: true,
				formula: {segments: [
					false,
					$interpolate('m 0 0'),
					$interpolate('l 20 20'),
					false,
					$interpolate('c 10 20 30 40 50 60'),
					$interpolate('z')
				]},
				params: {},
				args: {},
				segments: [],
				components: []
			};

			processComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 6 );

			expect( c.segments[1].start.x ).toBe( -10 );
			expect( c.segments[1].start.y ).toBe( -10 );
			expect( c.segments[1].end.x ).toBe( -10 );
			expect( c.segments[1].end.y ).toBe( -10 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 10 );
			expect( c.segments[2].end.y ).toBe( 10 );

			expect( c.segments[4].start.x ).toBe( 10 );
			expect( c.segments[4].start.y ).toBe( 10 );
			expect( c.segments[4].ctrl0.x ).toBe( 10 + 10 );
			expect( c.segments[4].ctrl0.y ).toBe( 10 + 20 );
			expect( c.segments[4].ctrl1.x ).toBe( 10 + 30 );
			expect( c.segments[4].ctrl1.y ).toBe( 10 + 40 );
			expect( c.segments[4].end.x ).toBe( 10 + 50 );
			expect( c.segments[4].end.y ).toBe( 10 + 60 );
		}));

		it('interpolates params in segment Formulas', inject(function( Point, $interpolate, processComponent ) {
			var c = {
				formula: {segments: [
					false,
					$interpolate('m 0              0'),
					$interpolate('l {{ width /2 }} {{ width }}'),
					false,
					$interpolate('l {{ width /2 }} {{ -width }}'),
					$interpolate('l {{ -width   }} 0'),
					$interpolate('z')
				]},
				params: { width: 50 },
				args: {},
				segments: [],
				components: []
			};

			processComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 7 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 15 );
			expect( c.segments[2].end.y ).toBe( 40 );

			expect( c.segments[4].start.x ).toBe( 15 );
			expect( c.segments[4].start.y ).toBe( 40 );
			expect( c.segments[4].end.x ).toBe( 40 );
			expect( c.segments[4].end.y ).toBe( -10 );

			expect( c.segments[5].start.x ).toBe( 40 );
			expect( c.segments[5].start.y ).toBe( -10 );
			expect( c.segments[5].end.x ).toBe( -10 );
			expect( c.segments[5].end.y ).toBe( -10 );
		}));

		it('interpolates arguments in segment Formulas, and they have priority over params', inject(function( Point, $interpolate, processComponent ) {
			var c = {
				formula: {segments: [
					false,
					$interpolate('m 0              0'),
					$interpolate('l {{ width /2 }} {{ width }}'),
					false,
					$interpolate('l {{ width /2 }} {{ -width }}'),
					$interpolate('l {{ -width   }} 0'),
					$interpolate('z')
				]},
				params: { width: 40 },
				args: { width: 50 },
				segments: [],
				components: []
			};

			processComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 7 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 15 );
			expect( c.segments[2].end.y ).toBe( 40 );

			expect( c.segments[4].start.x ).toBe( 15 );
			expect( c.segments[4].start.y ).toBe( 40 );
			expect( c.segments[4].end.x ).toBe( 40 );
			expect( c.segments[4].end.y ).toBe( -10 );

			expect( c.segments[5].start.x ).toBe( 40 );
			expect( c.segments[5].start.y ).toBe( -10 );
			expect( c.segments[5].end.x ).toBe( -10 );
			expect( c.segments[5].end.y ).toBe( -10 );
		}));
	});

	describe('initComponent', function() {
		it('links the segment of a simple component', inject(function( Point, $interpolate, initComponent ) {
			var c = {
					formula: {segments: [
						false,
						$interpolate('m  0    0'),
						$interpolate('l  25  50'),
						false,
						$interpolate('l  25 -50'),
						$interpolate('l -50   0'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: [],
					components: []
				};

			initComponent( c, Point( -10, -10 ) );

			expect( c.firstSegment ).toBe( c.segments[1] );
			expect( c.lastSegment ).toBe( c.segments[6] );

			expect( c.segments[1].next ).toBe( c.segments[2] );
			expect( c.segments[2].next ).toBe( c.segments[4] );
			expect( c.segments[4].next ).toBe( c.segments[5] );
			expect( c.segments[5].next ).toBe( c.segments[6] );
			expect( c.segments[6].next ).toBe( undefined );
		}));

		it('can init a segment with references to points that don\'t exist yet', inject(function( Point, $interpolate, initComponent ) {

			var s = [],
				c = {
					formula: {segments: [
						false,
						$interpolate('M {{ self[2].x - 25 }} {{ self[2].y - 50 }}'),
						$interpolate('L {{ self[4].x - 25 }} {{ self[4].y + 50 }}'),
						false,
						$interpolate('L {{ self[5].x + 50 }} {{ self[5].y }}'),
						$interpolate('L {{ self[0].x }} {{ self[0].y }}'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: s,
					components: []
				};

			initComponent( c, Point(-10, -10) );

			expect( c.segments.length ).toBe( 7 );

			expect( c.segments[2].start.x ).toBe( -10 );
			expect( c.segments[2].start.y ).toBe( -10 );
			expect( c.segments[2].end.x ).toBe( 15 );
			expect( c.segments[2].end.y ).toBe( 40 );

			expect( c.segments[4].start.x ).toBe( 15 );
			expect( c.segments[4].start.y ).toBe( 40 );
			expect( c.segments[4].end.x ).toBe( 40 );
			expect( c.segments[4].end.y ).toBe( -10 );

			expect( c.segments[5].start.x ).toBe( 40 );
			expect( c.segments[5].start.y ).toBe( -10 );
			expect( c.segments[5].end.x ).toBe( -10 );
			expect( c.segments[5].end.y ).toBe( -10 );
		}));

		it('throws after ten attempts of initializing the component', inject(function( Point, $interpolate, initComponent ) {
			var c = {
					formula: {segments: [
						false,
						$interpolate('m  0    0'),
						$interpolate('l  25  NaN'),
						false,
						$interpolate('l  25 -50'),
						$interpolate('l -50   0'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: [],
					components: []
				};

			expect(function() { initComponent( c, Point( -10, -10 ) ); }).toThrow();
		}));

		it('links the segment of an inverted component', inject(function( Point, $interpolate, initComponent ) {
			var c = {
					invert: true,
					formula: {segments: [
						false,
						$interpolate('m  0    0'),
						$interpolate('l  25  50'),
						false,
						$interpolate('l  25 -50'),
						$interpolate('l -50   0'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: [],
					components: []
				};

			initComponent( c, Point( -10, -10 ) );

			expect( c.firstSegment ).toBe( c.segments[6] );
			expect( c.lastSegment ).toBe( c.segments[1] );

			expect( c.segments[6].next ).toBe( c.segments[5] );
			expect( c.segments[5].next ).toBe( c.segments[4] );
			expect( c.segments[4].next ).toBe( c.segments[2] );
			expect( c.segments[2].next ).toBe( c.segments[1] );
			expect( c.segments[1].next ).toBe( undefined );
		}));

		// TODO: finish this test
		/*it('links a subcomponent to its parent', inject(function( $interpolate, initComponent) {
			var c2 = {
					formula: {segments: [
						false,
						$interpolate('m 0 0'),
						$interpolate('l 0 50'),
						$interpolate('l 50 0'),
						$interpolate('l 0 -50'),
						$interpolate('l -50 0'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: [],
					components: []
				},
				c1 = {
					formula: {segments: [
						false,
						$interpolate('m 0 0'),
						$interpolate('l 0 50'),
						$interpolate('l 50 0'),
						$interpolate('l 0 -50'),
						$interpolate('l -50 0'),
						$interpolate('z')
					]},
					params: {},
					args: {},
					segments: [],
					components: []
				};
		}));*/
	});

	describe('processSubcomponent', function() {
		it('determines the origin and args of an "add" subcomponent', inject(function( $interpolate, processSubcomponent ) {
			var origin,
				c = {
					type: 'add',
					argsFn: function( flatCtx ) { return {width: flatCtx.width}; },
					atFn: function() { return [2,3]; }
				};

			processSubcomponent( {flatContext:{ width: 50 }}, c, function( sc, o ) {
				origin = o;
			});

			expect( c.args.width ).toBe( 50 );
			expect( origin[0] ).toBe( 2 );
			expect( origin[1] ).toBe( 3 );
		}));

		it('determines the origin, args, "to" and "from" of a "replace" subcomponent', inject(function( Point, Segment, $interpolate, processSubcomponent ) {
			var origin,
				sFrom = Segment('L 50 50', Point(0,0)),
				sTo = Segment('L 50 50', Point(0,0)),
				c = {
					flatContext:{ width: 50 },
					segments: [
						sFrom,
						sTo
					]
				},
				sc = {
					type: 'replace',
					argsFn: function( flatCtx ) { return {width: flatCtx.width}; },
					fromId: 0,
					fromFn: function() { return {x: NaN, y: 40}; },
					toId: 1,
					toFn: function() { return {x: 10, y: NaN}; }
				};

			sFrom.$render.end = Point(sFrom.end);
			sTo.$render.start = Point(sFrom.start);

			processSubcomponent( c, sc, function( sc, o ) {
				origin = o;
			});

			expect( sc.args.width ).toBe( 50 );

			/* cut the segments it is attached to */
			// dont modify the actual points
			expect( sFrom.end.x ).toBe( 50 );
			expect( sFrom.end.y ).toBe( 50 );
			expect( sTo.start.x ).toBe( 0 );
			expect( sTo.start.y ).toBe( 0 );
			// only modify the rendered ones
			expect( sFrom.$render.end.x ).toBe( 40 );
			expect( sFrom.$render.end.y ).toBe( 40 );
			expect( sTo.$render.start.x ).toBe( 10 );
			expect( sTo.$render.start.y ).toBe( 10 );

			expect( origin.x ).toBe( 40 );
			expect( origin.y ).toBe( 40 );
			expect( origin.to.x ).toBe( 10 );
			expect( origin.to.y ).toBe( 10 );
		}));

		it('determines the origin, args, "to" and "from" of an inverted "replace" subcomponent', inject(function( Point, Segment, $interpolate, processSubcomponent ) {
			var origin,
				sFrom = Segment('L 50 50', Point(0,0)),
				sTo = Segment('L 50 50', Point(0,0)),
				c = {
					flatContext:{ width: 50 },
					segments: [
						sFrom,
						sTo
					]
				},
				sc = {
					invert: true,
					type: 'replace',
					argsFn: function( flatCtx ) { return {width: flatCtx.width}; },
					fromId: 0,
					fromFn: function() { return {x: NaN, y: 40}; },
					toId: 1,
					toFn: function() { return {x: 10, y: NaN}; }
				};

			expect(function() {
				processSubcomponent( c, sc, function( sc, o ) {
					origin = o;
					// throw here because we dont want to test gap closing yet
					throw 'Error';
				});
			}).toThrow();

			expect( sc.args.width ).toBe( 50 );

			// cut the segments it is attached to
			expect( sFrom.end.x ).toBe( 40 );
			expect( sFrom.end.y ).toBe( 40 );
			expect( sTo.start.x ).toBe( 10 );
			expect( sTo.start.y ).toBe( 10 );

			expect( origin.x ).toBe( 10 );
			expect( origin.y ).toBe( 10 );
			expect( origin.to.x ).toBe( 40 );
			expect( origin.to.y ).toBe( 40 );
		}));

		describe('gap closing', function() {

			var c;

			beforeEach(inject(function( Point, Segment ) {
				var p = Point(0,0);

				c = {
					segments: [
						false,
						Segment('m 0 0', p),
						Segment('l 0 50', p),
						Segment('l 50 0', p),
						Segment('l 0 -50', p),
						Segment('l -50 0', p),
						Segment('z', p)
					],
					flatContext: {}
				};
			}));

			/*it('closes the gap after a "replace from <cut> to <start>"', inject(function( Point, Segment, processSubcomponent ) {
				var sc = {
					type: 'replace',
					fromId: 3,
					fromFn: function() { return {x: 40}; },
					toId: 4,
					toFn: function() { return 'start'; },
					firstSegment: Segment('L 40 80', Point(0,0)),
					lastSegment: Segment('L 50 80', Point(0,0))
				};

				processSubcomponent( c, sc, function(){} );

				expect( c.segments[3].end.x ).toBe( 40 );
				expect( c.segments[3].end.y ).toBe( 50 );

				expect( c.segments[4].start.x ).toBe( 50 );
				expect( c.segments[4].start.y ).toBe( 80 );
			}));

			it('closes the gap before a "replace from <cut> to <end> inverted"', inject(function( Point, Segment, processSubcomponent ) {
				var sc = {
					invert: true,
					type: 'replace',
					fromId: 2,
					fromFn: function() { return 'end'; },
					toId: 3,
					toFn: function() { return {x: 10}; },
					firstSegment: Segment('L 10 80', Point(0,80)),
					lastSegment: Segment('L 10 50', Point(10,80))
				};

				processSubcomponent( c, sc, function(){} );

				expect( c.segments[3].start.x ).toBe( 10 );
				expect( c.segments[3].start.y ).toBe( 50 );

				expect( c.segments[2].end.x ).toBe( 0 );
				expect( c.segments[2].end.y ).toBe( 80 );
			}));*/

			it('can cut the same segment twice', inject(function( Point, Segment, processSubcomponent ) {
				var sc1 = {
						type: 'replace',
						fromId: 3,
						fromFn: function() { return {x: 40}; },
						toId: 4,
						toFn: function() { return 'start'; },
						firstSegment: Segment('L 40 80', Point(0,0)),
						lastSegment: Segment('L 50 50', Point(0,0))
					},
					sc2 = {
						invert: true,
						type: 'replace',
						fromId: 2,
						fromFn: function() { return 'end'; },
						toId: 3,
						toFn: function() { return {x: 10}; },
						firstSegment: Segment('L 10 50', Point(0,0)),
						lastSegment: Segment('L 10 50', Point(0,0))
					};

				processSubcomponent( c, sc1, function(){} );
				processSubcomponent( c, sc2, function(){} );

				expect( c.segments[3].start.x ).toBe( 10 );
				expect( c.segments[3].start.y ).toBe( 50 );

				expect( c.segments[2].end.x ).toBe( 10 );
				expect( c.segments[2].end.y ).toBe( 50 );

				expect( c.segments[3].end.x ).toBe( 40 );
				expect( c.segments[3].end.y ).toBe( 50 );

				expect( c.segments[4].start.x ).toBe( 50 );
				expect( c.segments[4].start.y ).toBe( 50 );
			}));

			it('allows two subcomponents to meet at the same point', inject(function( Point, Segment, initComponent ) {
				var p = Point(0,0),
					sc1 = {
						type: 'replace',
						fromId: 2,
						fromFn: function() { return {y: 30}; },
						toId: 4,
						toFn: function() { return 'start'; },
						segments: [
							undefined,
							Segment('L 25 50', Point(0,0))
						],
						components: [],
						formula: {segments:[]}
					},
					sc2 = {
						type: 'replace',
						fromId: 3,
						fromFn: function() { return 'end'; },
						toId: 5,
						toFn: function() { return {y: 30}; },
						segments: [
							undefined,
							Segment('L 50 30', Point(0,0))
						],
						components: [],
						formula: {segments:[]}
					},
					c = {
						segments: [
							undefined,
							Segment('m 0 0', p),
							Segment('l 0 50', p),
							Segment('l 25 0', p),
							Segment('l 25 0', p),
							Segment('l 0 -50', p),
							Segment('l -50 0', p),
							Segment('z', p)
						],
						formula: {segments:[]},
						flatContext: {},
						components: [
							sc1,
							sc2
						]
					};

				initComponent(c, Point(0,0));

				expect( sc1.lastSegment.next ).toBe( sc2.firstSegment );
			}));

			it('preserves the coordinates of the end point of an inverted segment', inject(function( Point, Segment, initComponent ) {
				var p = Point(0,0),
					sc1 = {
						invert: true,
						type: 'replace',
						fromId: 3,
						fromFn: function() { return {x: 25}; },
						toId: 4,
						toFn: function() { return {y: 30}; },
						segments: [
							undefined,
							Segment('L 25 40', Point(50,30))
						],
						components: [],
						formula: {segments:[]}
					},
					c = {
						segments: [
							undefined,
							Segment('m 0 0', p),
							Segment('l 0 50', p),
							Segment('l 50 0', p),
							Segment('l 0 -50', p),
							Segment('l -50 0', p),
							Segment('z', p)
						],
						formula: {segments:[]},
						flatContext: {},
						components: [
							sc1
						]
					};

				initComponent(c, Point(0,0));

				expect( c.segments[3].end.x ).toBe( 50 );
				expect( c.segments[3].end.y ).toBe( 50 );
				expect( c.segments[3].$render.end.x ).toBe( 25 );
				expect( c.segments[3].$render.end.y ).toBe( 40 );
			}));
		});
	});
});

/*describe('Component', function() {

	it('can create a component from a formula', inject(function( Component, Formula, Point, initComponent, processComponent ) {
		var glyph = [],
			comp1 = Component(Formula([
				'',
				'M 0 0',
				'L {{ self[4].x - 50 }} {{ self[4].y }}',
				'L {{ self[5].x }} {{ self[5].y + 50 }}',
				'L {{ self[6].x + 50 }} {{ self[6].y }}',
				'L {{ self[2].x }} {{ self[2].y }}',
				'z',
				'',
				'after 3: angle()'
			].join('\n')), {
				mergeAt: 0,
				mergeToGlyphAt: 0,
				after: false,
				formulaLib: {
					angle: Formula([
						'L {{ self[2].x - 20 }} {{ self[2].y + 20 }}',
						'L {{ self[0].x + 40 }} {{ self[0].y }}'
					].join('\n'))
				}
			});

		expect(comp1.components[0].mergeAt).toBe(3);

		initComponent( comp1, Point(0,0), [] );

		// .mergeAt shouldn't be modified
		expect(comp1.components[0].mergeAt).toBe(3);
		expect(comp1.components[0].mergeToGlyphAt).toBe(2);

		processComponent( comp1, Point(0,0), glyph );

		expect(glyph.length).toBe(8);
		expect(glyph[2].toSVG()).toBe('L 20 70');
		expect(glyph[3].toSVG()).toBe('L 40 50');
	}));

	//before(function() {
	//	//c0 = Component();
	//	//c1 = new Component();
	//});

	//it('can be called with or without new', function() {
	//	expect(c0 instanceof _Component).toBe(true);
	//	expect(c1 instanceof _Component).toBe(true);
	//});
});

describe('initComponent', function() {
	//it('can add two components that end on the same segment', function() {
	//})
});*/
























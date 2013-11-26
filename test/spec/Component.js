'use strict';

describe('Component', function() {

  // load the controller's module
  beforeEach(module('prototypo.Component', 'prototypo.Formula'));

  var _Component,
    glyph,
    comp1,
    comp2,
    p1,
    p2;

  beforeEach(inject(function ( Component ) {
    _Component = Component;
  }));

  it('merges a subcomponent to its parent and removes empty segments', inject(function( Segment, Point, mergeComponent ) {
    glyph = [];

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      segments: [
        false,
        Segment('m 0 0', p1 = Point(0,0)),
        Segment('l 0 50', p2 = Point( p1 ) ),
        Segment('l 50 0', p1),
        false,
        Segment('l 0 -50', p1),
        Segment('l -50 0', p1),
        Segment('z', p1)
      ],
      components: [
        comp2 = {
          mergeAt: 2,
          mergeToGlyphAt: 2,
          after: true,
          segments: [
            false,
            Segment('l 20 20', p2),
            Segment('l 20 -20', p2)
          ]
        }
      ]
    };

    mergeComponent( comp1, glyph );
    mergeComponent( comp2, glyph );

    expect(glyph.length).toBe(8);
    expect(glyph[2].toSVG()).toBe('L 20 70');
    expect(glyph[3].toSVG()).toBe('L 40 50');
  }));

  it('can process components devoid of references, params, controls or logic', inject(function( Point, $interpolate, processComponent ) {
    glyph = [];

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      context: {},
      formula: { segments: [
        false,
        $interpolate( 'm 0 0' ),
        $interpolate( 'l 0 50' ),
        $interpolate( 'l 50 0' ),
        $interpolate( 'l 0 -50' ),
        $interpolate( 'l -50 0' ),
        $interpolate( 'z' )
      ]},
      segments: [],
      components: [
        comp2 = {
          mergeAt: 2,
          mergeToGlyphAt: 2,
          after: true,
          context: {},
          formula: { segments: [
            false,
            $interpolate( 'l 20 20' ),
            $interpolate( 'l 20 -20' )
          ]},
          segments: [],
          components: []
        }
      ]
    };

    processComponent( comp1, Point(0,0), glyph );

    expect(glyph.length).toBe(8);
    expect(glyph[2].toSVG()).toBe('L 20 70');
    expect(glyph[3].toSVG()).toBe('L 40 50');
  }));

  it('can process components with params and controls', inject(function( Point, $interpolate, processComponent ) {
    glyph = [];

    var args = {
        arbitrary: 20
      },
      controls = {
        width: 50
      };

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      context: {
        args: args,
        controls: controls
      },
      formula: { segments: [
        false,
        $interpolate( 'm 0 0' ),
        $interpolate( 'l 0 {{ width }}' ),
        $interpolate( 'l {{ width }} 0' ),
        $interpolate( 'l 0 {{ -width }}' ),
        $interpolate( 'l {{ -width }} 0' ),
        $interpolate( 'z' )
      ]},
      segments: [],
      components: [
        comp2 = {
          mergeAt: 2,
          mergeToGlyphAt: 2,
          after: true,
          context: {
            args: args,
            controls: controls
          },
          formula: { segments: [
            false,
            $interpolate( 'l {{ arbitrary }} {{ arbitrary }}' ),
            $interpolate( 'l {{ arbitrary }} {{ -arbitrary }}' )
          ]},
          segments: [],
          components: []
        }
      ]
    };

    processComponent( comp1, Point(0,0), glyph );

    expect(glyph.length).toBe(8);
    expect(glyph[2].toSVG()).toBe('L 20 70');
    expect(glyph[3].toSVG()).toBe('L 40 50');
  }));

  it('can process components with references to previously processed coordinates', inject(function( Point, $interpolate, processComponent ) {
    glyph = [];

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      context: {},
      formula: { segments: [
        false,
        $interpolate( 'M 0 0' ),
        $interpolate( 'L {{ self[1].x }} {{ self[1].y + 50 }}' ),
        $interpolate( 'L {{ self[2].x + 50 }} {{ self[2].y }}' ),
        $interpolate( 'L {{ self[3].x }} {{ self[3].y - 50 }}' ),
        $interpolate( 'L {{ self[4].x - 50 }} {{ self[4].y }}' ),
        $interpolate( 'z' )
      ]},
      segments: [],
      components: [
        comp2 = {
          mergeAt: 2,
          mergeToGlyphAt: 2,
          after: true,
          context: {},
          formula: { segments: [
            false,
            $interpolate( 'L {{ self[0].x + 20 }} {{ self[0].y + 20 }}' ),
            $interpolate( 'L {{ self[1].x + 20 }} {{ self[1].y - 20 }}' )
          ]},
          segments: [],
          components: []
        }
      ]
    };

    comp1.context.self = comp1.segments;
    comp2.context.self = comp2.segments;

    processComponent( comp1, Point(0,0), glyph );

    expect(glyph.length).toBe(8);
    expect(glyph[2].toSVG()).toBe('L 20 70');
    expect(glyph[3].toSVG()).toBe('L 40 50');
  }));

  it('can process components with references to previously processed points', inject(function( Point, $interpolate, processComponent ) {
    glyph = [];

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      context: {},
      formula: { segments: [
        false,
        $interpolate( 'M 0 0' ),
        $interpolate( 'L 25 50' ),
        $interpolate( 'L 50 0' ),
        $interpolate( 'L {{ self[1].end }}' ),
        $interpolate( 'z' )
      ]},
      segments: [],
      components: []
    };

    comp1.context.self = comp1.segments;

    processComponent( comp1, Point(0,0), glyph );

    expect(glyph[3].toSVG()).toBe('L 0 0');
  }));

  it('can initialize a component', inject(function( Point, $interpolate, initComponent, processComponent ) {
    glyph = [];

    comp1 = {
      mergeAt: 0,
      mergeToGlyphAt: 0,
      after: false,
      context: {},
      formula: { segments: [
        false,
        $interpolate( 'M 0 0' ),
        $interpolate( 'L {{ self[3].x - 50 }} {{ self[3].y }}' ),
        $interpolate( 'L {{ self[4].x }} {{ self[4].y + 50 }}' ),
        $interpolate( 'L {{ self[5].x + 50 }} {{ self[5].y }}' ),
        $interpolate( 'L {{ self[1].x }} {{ self[1].y }}' ),
        $interpolate( 'z' )
      ]},
      segments: [],
      components: [
        comp2 = {
          mergeAt: 2,
          mergeToGlyphAt: 2,
          after: true,
          context: {},
          formula: { segments: [
            false,
            $interpolate( 'L {{ self[2].x - 20 }} {{ self[2].y + 20 }}' ),
            $interpolate( 'L {{ self[0].x + 40 }} {{ self[0].y }}' )
          ]},
          segments: [],
          components: []
        }
      ]
    };

    comp1.context.self = comp1.segments;
    comp2.context.self = comp2.segments;

    initComponent( comp1, Point(0,0), [] );
    processComponent( comp1, Point(0,0), glyph );

    expect(glyph.length).toBe(8);
    expect(glyph[2].toSVG()).toBe('L 20 70');
    expect(glyph[3].toSVG()).toBe('L 40 50');
  }));

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

  /*before(function() {
    //c0 = Component();
    //c1 = new Component();
  });

  /*it('can be called with or without new', function() {
    expect(c0 instanceof _Component).toBe(true);
    expect(c1 instanceof _Component).toBe(true);
  });*/
});
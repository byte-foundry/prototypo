'use strict';

// load the controller's module
beforeEach(module('prototypo.Segment'));

/* jshint camelcase: false */
describe('Segment', function() {
	var _Segment,
		o,
		d,
		s0,
		s1,
		s2,
		s3,
		s4,
		s5,
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
		s_rS,
		s_l0,
		s_l1,
		s_l2,
		sa_h,
		sa_v,
		sa_c,
		sa_q,
		sa_l,
		sa_m,
		sa_s,
		sa_t,
		sa_z,
		sa_H,
		sa_V,
		sa_C,
		sa_Q,
		sa_L,
		sa_M,
		sa_S,
		sa_T,
		sa_Z,
		sa_rq,
		sa_rc,
		sa_rs,
		sa_rQ,
		sa_rC,
		sa_rS;

	function f32( number ) {
		return new Float32Array( new Array( number, 0 ) )[0];
	}

	function roundH( number ) {
		return Math.round( number * 100 ) / 100;
	}

	beforeEach(inject(function( Segment, Point ) {
		_Segment = Segment;
		o = Point(0,0);
		d = Point(10,-10);

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
		s_C = Segment( 'C 11.11 22.22 33.33 44.44 55.55 66.66', Point(o) );
		s_T = Segment( 'T 77.77 88.88', Point(o) );
		s_S = Segment( 'S 99.99 11.11 22.22 33.33', Point(o) );
		s_rq = Segment( 'rq 11.11 22.22 33.33 44.44', Point(o) );
		s_rc = Segment( 'rc 55.55 66.66 77.77 88.88 99.99 11.11', Point(o) );
		s_rs = Segment( 'rs 22.22 33.33 44.44 55.55', Point(o) );
		s_rQ = Segment( 'rQ 11.11 22.22 33.33 44.44', Point(o) );
		s_rC = Segment( 'rC 55.55 66.66 77.77 88.88 99.99 11.11', Point(o) );
		s_rS = Segment( 'rS 22.22 33.33 44.44 55.55', Point(o) );

		s_l0 = Segment( '  l  "-11.11   22.22" ', Point(o) );
		s_l1 = Segment( '\t\tl\t "\t-33.33 \t 44.44  \t"', Point(o) );
		s_l2 = Segment( ',",l" , -55.55, ,66.66  ,', Point(o) );

		sa_z = Segment( 'z', Point(d) );
		sa_h = Segment( 'h -11.11', Point(d) );
		sa_v = Segment( 'v -22.22', Point(d) );
		sa_m = Segment( 'm -33.33 -44.44', Point(d) );
		sa_l = Segment( 'l 55.55 66.66', Point(d) );
		sa_q = Segment( 'q 77.77 88.88 99.99 11.11', Point(d) );
		sa_c = Segment( 'c 11.11 22.22 33.33 44.44 55.55 66.66', Point(d) );
		sa_t = Segment( 't 77.77 88.88', Point(d) );
		sa_s = Segment( 's 99.99 11.11 22.22 33.33', Point(d) );
		sa_Z = Segment( 'Z', Point(d) );
		sa_H = Segment( 'H -11.11', Point(d) );
		sa_V = Segment( 'V -22.22', Point(d) );
		sa_M = Segment( 'M -33.33 -44.44', Point(d) );
		sa_L = Segment( 'L 55.55 66.66', Point(d) );
		sa_Q = Segment( 'Q 77.77 88.88 99.99 11.11', Point(d) );
		sa_C = Segment( 'C 11.11 22.22 33.33 44.44 55.55 66.66', Point(d) );
		sa_T = Segment( 'T 77.77 88.88', Point(d) );
		sa_S = Segment( 'S 99.99 11.11 22.22 33.33', Point(d) );
		sa_rq = Segment( 'rq 11.11 22.22 33.33 44.44', Point(d) );
		sa_rc = Segment( 'rc 55.55 66.66 77.77 88.88 99.99 11.11', Point(d) );
		sa_rs = Segment( 'rs 22.22 33.33 44.44 55.55', Point(d) );
		sa_rQ = Segment( 'rQ 11.11 22.22 33.33 44.44', Point(d) );
		sa_rC = Segment( 'rC 55.55 66.66 77.77 88.88 99.99 11.11', Point(d) );
		sa_rS = Segment( 'rS 22.22 33.33 44.44 55.55', Point(d) );

		s2 = Segment( 'l 10 -10', o );
		s3 = Segment( 'l 10 -10', o );
		s4 = Segment( 'l 10 -10', o );
		s5 = Segment( 'l 10 -10', o );
	}));

	it('can be called with or without new', function() {
		expect(s0 instanceof _Segment).toBe(true);
		expect(s1 instanceof _Segment).toBe(true);
	});

	it('keeps this.x and this.y synchronized to this.end.x and this.end.y', inject(function( Segment, Point ) {
		var seg1 = Segment('M 10 20', Point(0, 0));

		expect(roundH(seg1.x)).toBe(roundH(10));
		expect(roundH(seg1.x)).toBe(roundH(seg1.end.x));
		expect(roundH(seg1.y)).toBe(roundH(20));
		expect(roundH(seg1.y)).toBe(roundH(seg1.end.y));

		seg1.end = Point(30,40);

		expect(roundH(seg1.x)).toBe(roundH(30));
		expect(roundH(seg1.x)).toBe(roundH(seg1.end.x));
		expect(roundH(seg1.y)).toBe(roundH(40));
		expect(roundH(seg1.y)).toBe(roundH(seg1.end.y));
	}));

	it('parses all possible kind of processed segment', function() {
		// z
		expect(s_z.command).toBe('Z');
		expect(s_z.ctrl0).toBe( undefined );
		expect(s_z.ctrl1).toBe( undefined );
		expect(roundH(s_z.end.x)).toBe(roundH(0));
		expect(roundH(s_z.end.y)).toBe(roundH(0));

		// h
		expect(s_h.command).toBe('H');
		expect(s_h.ctrl0).toBe( undefined );
		expect(s_h.ctrl1).toBe( undefined );
		expect(roundH(s_h.end.x)).toBe(roundH(-11.11));
		expect(roundH(s_h.end.y)).toBe(roundH(0));

		// v
		expect(s_v.command).toBe('V');
		expect(s_v.ctrl0).toBe( undefined );
		expect(s_v.ctrl1).toBe( undefined );
		expect(roundH(s_v.end.y)).toBe(roundH(-22.22));
		expect(roundH(s_v.end.x)).toBe(roundH(0));

		// m
		expect(s_m.command).toBe('M');
		expect(s_m.ctrl0).toBe( undefined );
		expect(s_m.ctrl1).toBe( undefined );
		expect(roundH(s_m.end.x)).toBe(roundH(-33.33));
		expect(roundH(s_m.end.y)).toBe(roundH(-44.44));

		// l
		expect(s_l.command).toBe('L');
		expect(s_l.ctrl0).toBe( undefined );
		expect(s_l.ctrl1).toBe( undefined );
		expect(roundH(s_l.end.x)).toBe(roundH(55.55));
		expect(roundH(s_l.end.y)).toBe(roundH(66.66));

		// q
		expect(s_q.command).toBe('Q');
		expect(roundH(s_q.end.x)).toBe(roundH(99.99));
		expect(roundH(s_q.end.y)).toBe(roundH(11.11));
		expect(s_q.ctrl0).not.toBe( undefined );
		expect(s_q.ctrl1).toBe( undefined );
		expect(roundH(s_q.ctrl0.x)).toBe(roundH(77.77));
		expect(roundH(s_q.ctrl0.y)).toBe(roundH(88.88));

		// c
		expect(s_c.command).toBe('C');
		expect(roundH(s_c.end.x)).toBe(roundH(55.55));
		expect(roundH(s_c.end.y)).toBe(roundH(66.66));
		expect(s_c.ctrl0).not.toBe( undefined );
		expect(s_c.ctrl1).not.toBe( undefined );
		expect(roundH(s_c.ctrl0.x)).toBe(roundH(11.11));
		expect(roundH(s_c.ctrl0.y)).toBe(roundH(22.22));
		expect(roundH(s_c.ctrl1.x)).toBe(roundH(33.33));
		expect(roundH(s_c.ctrl1.y)).toBe(roundH(44.44));

		// t
		expect(s_t.command).toBe('T');
		expect(s_t.ctrl0).toBe( undefined );
		expect(s_t.ctrl1).toBe( undefined );
		expect(roundH(s_t.end.x)).toBe(roundH(77.77));
		expect(roundH(s_t.end.y)).toBe(roundH(88.88));

		// s
		expect(s_s.command).toBe('S');
		expect(s_s.ctrl0).not.toBe( undefined );
		expect(s_s.ctrl1).toBe( undefined );
		expect(roundH(s_s.end.x)).toBe(roundH(22.22));
		expect(roundH(s_s.end.y)).toBe(roundH(33.33));
		expect(roundH(s_s.ctrl0.x)).toBe(roundH(99.99));
		expect(roundH(s_s.ctrl0.y)).toBe(roundH(11.11));

		// rq
		expect(s_rq.command).toBe('Q');
		expect(roundH(s_rq.end.x)).toBe(roundH(33.33));
		expect(roundH(s_rq.end.y)).toBe(roundH(44.44));
		expect(s_rq.relativeControls).toBe(true);
		expect(s_rq.ctrl0).toBe(undefined);
		expect(s_rq.ctrl1).not.toBe(undefined);
		expect(roundH(s_rq.ctrl1.x)).toBe(roundH(11.11 + 33.33));
		expect(roundH(s_rq.ctrl1.y)).toBe(roundH(22.22 + 44.44));

		// rc
		expect(s_rc.command).toBe('C');
		expect(roundH(s_rc.end.x)).toBe(roundH(99.99));
		expect(roundH(s_rc.end.y)).toBe(roundH(11.11));
		expect(s_rc.relativeControls).toBe(true);
		expect(s_rc.ctrl0).not.toBe(undefined);
		expect(s_rc.ctrl1).not.toBe(undefined);
		expect(roundH(s_rc.ctrl0.x)).toBe(roundH(55.55));
		expect(roundH(s_rc.ctrl0.y)).toBe(roundH(66.66));
		expect(roundH(s_rc.ctrl1.x)).toBe(roundH(77.77 + 99.99));
		expect(roundH(s_rc.ctrl1.y)).toBe(roundH(88.88 + 11.11));

		// rs
		expect(s_rs.command).toBe('S');
		expect(roundH(s_rs.end.x)).toBe(roundH(44.44));
		expect(roundH(s_rs.end.y)).toBe(roundH(55.55));
		expect(s_rs.relativeControls).toBe(true);
		expect(s_rs.ctrl0).toBe(undefined);
		expect(s_rs.ctrl1).not.toBe(undefined);
		expect(roundH(s_rs.ctrl1.x)).toBe(roundH(22.22 + 44.44));
		expect(roundH(s_rs.ctrl1.y)).toBe(roundH(33.33 + 55.55));

		// Z
		expect(s_Z.command).toBe('Z');
		expect(s_Z.ctrl0).toBe(undefined);
		expect(s_Z.ctrl1).toBe(undefined);
		expect(roundH(s_Z.end.x)).toBe(roundH(0));
		expect(roundH(s_Z.end.y)).toBe(roundH(0));

		// H
		expect(s_H.command).toBe('H');
		expect(s_H.ctrl0).toBe(undefined);
		expect(s_H.ctrl1).toBe(undefined);
		expect(roundH(s_H.end.x)).toBe(roundH(-11.11));
		expect(roundH(s_H.end.y)).toBe(roundH(0));

		// V
		expect(s_V.command).toBe('V');
		expect(s_V.ctrl0).toBe(undefined);
		expect(s_V.ctrl1).toBe(undefined);
		expect(roundH(s_V.end.y)).toBe(roundH(-22.22));
		expect(roundH(s_V.end.x)).toBe(roundH(0));

		// M
		expect(s_M.command).toBe('M');
		expect(s_M.ctrl0).toBe(undefined);
		expect(s_M.ctrl1).toBe(undefined);
		expect(roundH(s_M.end.x)).toBe(roundH(-33.33));
		expect(roundH(s_M.end.y)).toBe(roundH(-44.44));

		// L
		expect(s_L.command).toBe('L');
		expect(s_L.ctrl0).toBe(undefined);
		expect(s_L.ctrl1).toBe(undefined);
		expect(roundH(s_L.end.x)).toBe(roundH(55.55));
		expect(roundH(s_L.end.y)).toBe(roundH(66.66));

		// Q
		expect(s_Q.command).toBe('Q');
		expect(roundH(s_Q.end.x)).toBe(roundH(99.99));
		expect(roundH(s_Q.end.y)).toBe(roundH(11.11));
		expect(s_Q.ctrl0).not.toBe(undefined);
		expect(s_Q.ctrl1).toBe(undefined);
		expect(roundH(s_Q.ctrl0.x)).toBe(roundH(77.77));
		expect(roundH(s_Q.ctrl0.y)).toBe(roundH(88.88));

		// C
		expect(s_C.command).toBe('C');
		expect(roundH(s_C.end.x)).toBe(roundH(55.55));
		expect(roundH(s_C.end.y)).toBe(roundH(66.66));
		expect(s_C.ctrl0).not.toBe(undefined);
		expect(s_C.ctrl1).not.toBe(undefined);
		expect(roundH(s_C.ctrl0.x)).toBe(roundH(11.11));
		expect(roundH(s_C.ctrl0.y)).toBe(roundH(22.22));
		expect(roundH(s_C.ctrl1.x)).toBe(roundH(33.33));
		expect(roundH(s_C.ctrl1.y)).toBe(roundH(44.44));

		// T
		expect(s_T.command).toBe('T');
		expect(s_T.ctrl0).toBe(undefined);
		expect(s_T.ctrl1).toBe(undefined);
		expect(roundH(s_T.end.x)).toBe(roundH(77.77));
		expect(roundH(s_T.end.y)).toBe(roundH(88.88));

		// S
		expect(s_S.command).toBe('S');
		expect(s_S.ctrl0).not.toBe(undefined);
		expect(s_S.ctrl1).toBe(undefined);
		expect(roundH(s_S.end.x)).toBe(roundH(22.22));
		expect(roundH(s_S.end.y)).toBe(roundH(33.33));
		expect(roundH(s_S.ctrl0.x)).toBe(roundH(99.99));
		expect(roundH(s_S.ctrl0.y)).toBe(roundH(11.11));

		// rQ
		expect(s_rQ.command).toBe('Q');
		expect(roundH(s_rQ.end.x)).toBe(roundH(33.33));
		expect(roundH(s_rQ.end.y)).toBe(roundH(44.44));
		expect(s_rQ.relativeControls).toBe(true);
		expect(s_rQ.ctrl0).toBe(undefined);
		expect(s_rQ.ctrl1).not.toBe(undefined);
		expect(roundH(s_rQ.ctrl1.x)).toBe(roundH(11.11 + 33.33));
		expect(roundH(s_rQ.ctrl1.y)).toBe(roundH(22.22 + 44.44));

		// rC
		expect(s_rC.command).toBe('C');
		expect(roundH(s_rC.end.x)).toBe(roundH(99.99));
		expect(roundH(s_rC.end.y)).toBe(roundH(11.11));
		expect(s_rC.relativeControls).toBe(true);
		expect(s_rC.ctrl0).not.toBe(undefined);
		expect(s_rC.ctrl1).not.toBe(undefined);
		expect(roundH(s_rC.ctrl0.x)).toBe(roundH(55.55));
		expect(roundH(s_rC.ctrl0.y)).toBe(roundH(66.66));
		expect(roundH(s_rC.ctrl1.x)).toBe(roundH(77.77 + 99.99));
		expect(roundH(s_rC.ctrl1.y)).toBe(roundH(88.88 + 11.11));

		// rS
		expect(s_rS.command).toBe('S');
		expect(roundH(s_rS.end.x)).toBe(roundH(44.44));
		expect(roundH(s_rS.end.y)).toBe(roundH(55.55));
		expect(s_rS.relativeControls).toBe(true);
		expect(s_rS.ctrl0).toBe(undefined);
		expect(s_rS.ctrl1).not.toBe(undefined);
		expect(roundH(s_rS.ctrl1.x)).toBe(roundH(22.22 + 44.44));
		expect(roundH(s_rS.ctrl1.y)).toBe(roundH(33.33 + 55.55));
	});

	it('ignores spaces, tabs, commas and double-quotes completly', function() {
		expect(s_l0.command).toBe('L');
		expect(roundH(s_l0.end.x)).toBe(roundH(-11.11));
		expect(roundH(s_l0.end.y)).toBe(roundH(22.22));

		expect(s_l1.command).toBe('L');
		expect(roundH(s_l1.end.x)).toBe(roundH(-33.33));
		expect(roundH(s_l1.end.y)).toBe(roundH(44.44));

		expect(s_l2.command).toBe('L');
		expect(roundH(s_l2.end.x)).toBe(roundH(-55.55));
		expect(roundH(s_l2.end.y)).toBe(roundH(66.66));
	});

	it('converts all coordinates to absolute', function() {
		// z
		expect(sa_z.command).toBe('Z');
		expect(roundH(sa_z.end.x)).toBe(roundH(10));
		expect(roundH(sa_z.end.y)).toBe(roundH(-10));

		// h
		expect(sa_h.command).toBe('H');
		expect(roundH(sa_h.end.x)).toBe(roundH(-11.11 + 10));
		expect(roundH(sa_h.end.y)).toBe(roundH(0 - 10));

		// v
		expect(sa_v.command).toBe('V');
		expect(roundH(sa_v.end.y)).toBe(roundH(-22.22 - 10));
		expect(roundH(sa_v.end.x)).toBe(roundH(0 + 10));

		// m
		expect(sa_m.command).toBe('M');
		expect(roundH(sa_m.end.x)).toBe(roundH(-33.33 + 10));
		expect(roundH(sa_m.end.y)).toBe(roundH(-44.44 - 10));

		// l
		expect(sa_l.command).toBe('L');
		expect(roundH(sa_l.end.x)).toBe(roundH(55.55 + 10));
		expect(roundH(sa_l.end.y)).toBe(roundH(66.66 - 10));

		// q
		expect(sa_q.command).toBe('Q');
		expect(roundH(sa_q.end.x)).toBe(roundH(99.99 + 10));
		expect(roundH(sa_q.end.y)).toBe(roundH(11.11 - 10));
		expect(roundH(sa_q.ctrl0.x)).toBe(roundH(77.77 + 10));
		expect(roundH(sa_q.ctrl0.y)).toBe(roundH(88.88 - 10));

		// c
		expect(sa_c.command).toBe('C');
		expect(roundH(sa_c.end.x)).toBe(roundH(55.55 + 10));
		expect(roundH(sa_c.end.y)).toBe(roundH(66.66 - 10));
		expect(roundH(sa_c.ctrl0.x)).toBe(roundH(11.11 + 10));
		expect(roundH(sa_c.ctrl0.y)).toBe(roundH(22.22 - 10));
		expect(roundH(sa_c.ctrl1.x)).toBe(roundH(33.33 + 10));
		expect(roundH(sa_c.ctrl1.y)).toBe(roundH(44.44 - 10));

		// t
		expect(sa_t.command).toBe('T');
		expect(roundH(sa_t.end.x)).toBe(roundH(77.77 + 10));
		expect(roundH(sa_t.end.y)).toBe(roundH(88.88 - 10));

		// s
		expect(sa_s.command).toBe('S');
		expect(roundH(sa_s.end.x)).toBe(roundH(22.22 + 10));
		expect(roundH(sa_s.end.y)).toBe(roundH(33.33 - 10));
		expect(roundH(sa_s.ctrl0.x)).toBe(roundH(99.99 + 10));
		expect(roundH(sa_s.ctrl0.y)).toBe(roundH(11.11 - 10));

		// rq
		expect(sa_rq.command).toBe('Q');
		expect(roundH(sa_rq.end.x)).toBe(roundH(33.33 + 10));
		expect(roundH(sa_rq.end.y)).toBe(roundH(44.44 - 10));
		expect(sa_rq.ctrl0).toBe(undefined);
		expect(roundH(sa_rq.ctrl1.x)).toBe(roundH(11.11 + 33.33 + 10));
		expect(roundH(sa_rq.ctrl1.y)).toBe(roundH(22.22 + 44.44 - 10));

		// rc
		expect(sa_rc.command).toBe('C');
		expect(roundH(sa_rc.end.x)).toBe(roundH(99.99 + 10));
		expect(roundH(sa_rc.end.y)).toBe(roundH(11.11 - 10));
		expect(roundH(sa_rc.ctrl0.x)).toBe(roundH(55.55 + 10));
		expect(roundH(sa_rc.ctrl0.y)).toBe(roundH(66.66 - 10));
		expect(roundH(sa_rc.ctrl1.x)).toBe(roundH(77.77 + 99.99 + 10));
		expect(roundH(sa_rc.ctrl1.y)).toBe(roundH(88.88 + 11.11 - 10));

		// rs
		expect(sa_rs.command).toBe('S');
		expect(roundH(sa_rs.end.x)).toBe(roundH(44.44 + 10));
		expect(roundH(sa_rs.end.y)).toBe(roundH(55.55 - 10));
		expect(sa_rs.ctrl0).toBe(undefined);
		expect(roundH(sa_rs.ctrl1.x)).toBe(roundH(22.22 + 44.44 + 10));
		expect(roundH(sa_rs.ctrl1.y)).toBe(roundH(33.33 + 55.55 - 10));

		// Z
		expect(sa_Z.command).toBe('Z');
		expect(roundH(sa_Z.end.x)).toBe(roundH(10));
		expect(roundH(sa_Z.end.y)).toBe(roundH(-10));

		// H
		expect(sa_H.command).toBe('H');
		expect(roundH(sa_H.end.x)).toBe(roundH(-11.11));
		expect(roundH(sa_H.end.y)).toBe(roundH(-10));

		// V
		expect(sa_V.command).toBe('V');
		expect(roundH(sa_V.end.y)).toBe(roundH(-22.22));
		expect(roundH(sa_V.end.x)).toBe(roundH(10));

		// M
		expect(sa_M.command).toBe('M');
		expect(roundH(sa_M.end.x)).toBe(roundH(-33.33));
		expect(roundH(sa_M.end.y)).toBe(roundH(-44.44));

		// L
		expect(sa_L.command).toBe('L');
		expect(roundH(sa_L.end.x)).toBe(roundH(55.55));
		expect(roundH(sa_L.end.y)).toBe(roundH(66.66));

		// Q
		expect(sa_Q.command).toBe('Q');
		expect(roundH(sa_Q.end.x)).toBe(roundH(99.99));
		expect(roundH(sa_Q.end.y)).toBe(roundH(11.11));
		expect(roundH(sa_Q.ctrl0.x)).toBe(roundH(77.77));
		expect(roundH(sa_Q.ctrl0.y)).toBe(roundH(88.88));

		// C
		expect(sa_C.command).toBe('C');
		expect(roundH(sa_C.end.x)).toBe(roundH(55.55));
		expect(roundH(sa_C.end.y)).toBe(roundH(66.66));
		expect(roundH(sa_C.ctrl0.x)).toBe(roundH(11.11));
		expect(roundH(sa_C.ctrl0.y)).toBe(roundH(22.22));
		expect(roundH(sa_C.ctrl1.x)).toBe(roundH(33.33));
		expect(roundH(sa_C.ctrl1.y)).toBe(roundH(44.44));

		// T
		expect(sa_T.command).toBe('T');
		expect(roundH(sa_T.end.x)).toBe(roundH(77.77));
		expect(roundH(sa_T.end.y)).toBe(roundH(88.88));

		// S
		expect(sa_S.command).toBe('S');
		expect(roundH(sa_S.end.x)).toBe(roundH(22.22));
		expect(roundH(sa_S.end.y)).toBe(roundH(33.33));
		expect(roundH(sa_S.ctrl0.x)).toBe(roundH(99.99));
		expect(roundH(sa_S.ctrl0.y)).toBe(roundH(11.11));

		// rQ
		expect(sa_rQ.command).toBe('Q');
		expect(roundH(sa_rQ.end.x)).toBe(roundH(33.33));
		expect(roundH(sa_rQ.end.y)).toBe(roundH(44.44));
		expect(sa_rQ.ctrl0).toBe(undefined);
		expect(roundH(sa_rQ.ctrl1.x)).toBe(roundH(11.11 + 33.33));
		expect(roundH(sa_rQ.ctrl1.y)).toBe(roundH(22.22 + 44.44));

		// rC
		expect(sa_rC.command).toBe('C');
		expect(roundH(sa_rC.end.x)).toBe(roundH(99.99));
		expect(roundH(sa_rC.end.y)).toBe(roundH(11.11));
		expect(roundH(sa_rC.ctrl0.x)).toBe(roundH(55.55 + 10));
		expect(roundH(sa_rC.ctrl0.y)).toBe(roundH(66.66 - 10));
		expect(roundH(sa_rC.ctrl1.x)).toBe(roundH(77.77 + 99.99));
		expect(roundH(sa_rC.ctrl1.y)).toBe(roundH(88.88 + 11.11));

		// rS
		expect(sa_rS.command).toBe('S');
		expect(roundH(sa_rS.end.x)).toBe(roundH(44.44));
		expect(roundH(sa_rS.end.y)).toBe(roundH(55.55));
		expect(sa_rS.ctrl0).toBe(undefined);
		expect(roundH(sa_rS.ctrl1.x)).toBe(roundH(22.22 + 44.44));
		expect(roundH(sa_rS.ctrl1.y)).toBe(roundH(33.33 + 55.55));
	});

	it('should make a sequence of relative segments with a common origin... relative.', function() {
		expect(roundH(s5.end.x)).toBe(roundH(40));
		expect(roundH(s5.end.y)).toBe(roundH(-40));

		expect(roundH(o.x)).toBe(roundH(40));
		expect(roundH(o.y)).toBe(roundH(-40));
	});

	it('can serialize a segment to SVG without decimals', function() {
		// z
		expect(sa_z.toSVG()).toBe('Z');

		// h
		expect(sa_h.toSVG()).toBe('H -1');

		// v
		expect(sa_v.toSVG()).toBe('V -32');

		// m
		expect(sa_m.toSVG()).toBe('M -23 -54');

		// l
		expect(sa_l.toSVG()).toBe('L 66 57');

		// q
		expect(sa_q.toSVG()).toBe('Q 88 79 110 1');

		// c
		expect(sa_c.toSVG()).toBe('C 21 12 43 34 66 57');

		// t
		expect(sa_t.toSVG()).toBe('T 88 79');

		// s
		expect(sa_s.toSVG()).toBe('S 110 1 32 23');

		// rq
		expect(sa_rq.toSVG()).toBe('Q 54 57 43 34');

		// rc
		expect(sa_rc.toSVG()).toBe('C 66 57 188 90 110 1');

		// rs
		expect(sa_rs.toSVG()).toBe('S 77 79 54 46');

		// Z
		expect(sa_Z.toSVG()).toBe('Z');

		// H
		expect(sa_H.toSVG()).toBe('H -11');

		// V
		expect(sa_V.toSVG()).toBe('V -22');

		// M
		expect(sa_M.toSVG()).toBe('M -33 -44');

		// L
		expect(sa_L.toSVG()).toBe('L 56 67');

		// Q
		expect(sa_Q.toSVG()).toBe('Q 78 89 100 11');

		// C
		expect(sa_C.toSVG()).toBe('C 11 22 33 44 56 67');

		// T
		expect(sa_T.toSVG()).toBe('T 78 89');

		// S
		expect(sa_S.toSVG()).toBe('S 100 11 22 33');

		// rQ
		expect(sa_rQ.toSVG()).toBe('Q 44 67 33 44');

		// rC
		expect(sa_rC.toSVG()).toBe('C 66 57 178 100 100 11');

		// rS
		expect(sa_rS.toSVG()).toBe('S 67 89 44 56');
	});

	it('can reuse an existing segment', inject(function( Segment, Point, parseUpdateSegment, absolutizeSegment ) {
		var seg1 = Segment( 'rc 10 -10 10 -10 50 50', Point(0,0) );

		parseUpdateSegment( seg1, 'rc 10 -10 10 -10 60 60' );
		absolutizeSegment( seg1, Point(-20,20) );

		expect(seg1.command).toBe('C');
		expect(seg1.end.x).toBe(40);
		expect(seg1.end.y).toBe(80);
		expect(seg1.start.x).toBe(-20);
		expect(seg1.start.y).toBe(20);
		expect(seg1.ctrl0.x).toBe(-10);
		expect(seg1.ctrl0.y).toBe(10);
		expect(seg1.ctrl1.x).toBe(50);
		expect(seg1.ctrl1.y).toBe(70);
	}));

});

describe('moveSegmentEnd', function() {
	it('moves the end of a straight line to the desired point', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg = Segment('L 30 50', Point(10,10));
		moveSegmentEnd( seg, 'end', Point(40,40) );

		expect( seg.start.x ).toBe(10);
		expect( seg.start.y ).toBe(10);
		expect( seg.end.x ).toBe(40);
		expect( seg.end.y ).toBe(40);
	}));

	it('moves the start of a straight line to the desired point', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg = Segment('L 30 50', Point(10,10));
		moveSegmentEnd( seg, 'start', Point(-10,-10) );

		expect( seg.start.x ).toBe(-10);
		expect( seg.start.y ).toBe(-10);
		expect( seg.end.x ).toBe(30);
		expect( seg.end.y ).toBe(50);
	}));

	it('can move all ends and control-points of an "rC" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rC 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(0);
		expect( seg1.ctrl0.y ).toBe(10);
		expect( seg1.ctrl1.x ).toBe(80);
		expect( seg1.ctrl1.y ).toBe(100);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rC 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1.x ).toBe(100);
		expect( seg2.ctrl1.y ).toBe(120);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and second control-point of an "rQ" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rQ 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0 ).toBe(undefined);
		expect( seg1.ctrl1.x ).toBe(80);
		expect( seg1.ctrl1.y ).toBe(100);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rS 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0 ).toBe(undefined);
		expect( seg2.ctrl1.x ).toBe(100);
		expect( seg2.ctrl1.y ).toBe(120);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and second control-point of an "rS" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rS 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0 ).toBe(undefined);
		expect( seg1.ctrl1.x ).toBe(80);
		expect( seg1.ctrl1.y ).toBe(100);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rS 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0 ).toBe(undefined);
		expect( seg2.ctrl1.x ).toBe(100);
		expect( seg2.ctrl1.y ).toBe(120);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and control-points of a "c" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('c 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(0);
		expect( seg1.ctrl0.y ).toBe(10);
		expect( seg1.ctrl1.x ).toBe(30);
		expect( seg1.ctrl1.y ).toBe(40);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('c 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1.x ).toBe(50);
		expect( seg2.ctrl1.y ).toBe(60);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and 1st control-point of a "q" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('q 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(0);
		expect( seg1.ctrl0.y ).toBe(10);
		expect( seg1.ctrl1 ).toBe(undefined);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('q 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1 ).toBe(undefined);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and 1st control-point of a "s" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('s 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(0);
		expect( seg1.ctrl0.y ).toBe(10);
		expect( seg1.ctrl1 ).toBe(undefined);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('s 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1 ).toBe(undefined);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and control-points of a "rc" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rc 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(0);
		expect( seg1.ctrl0.y ).toBe(10);
		expect( seg1.ctrl1.x ).toBe(80);
		expect( seg1.ctrl1.y ).toBe(100);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rc 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1.x ).toBe(100);
		expect( seg2.ctrl1.y ).toBe(120);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and 1st control-point of a "rq" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rq 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl1.x ).toBe(60);
		expect( seg1.ctrl1.y ).toBe(80);
		expect( seg1.ctrl0 ).toBe(undefined);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rq 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl1.x ).toBe(80);
		expect( seg2.ctrl1.y ).toBe(100);
		expect( seg2.ctrl0 ).toBe(undefined);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('can move all ends and 1st control-point of a "rs" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('rs 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl1.x ).toBe(60);
		expect( seg1.ctrl1.y ).toBe(80);
		expect( seg1.ctrl0 ).toBe(undefined);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('rs 10 20 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl1.x ).toBe(80);
		expect( seg2.ctrl1.y ).toBe(100);
		expect( seg2.ctrl0 ).toBe(undefined);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));

	it('never moves the control-points of a "C" segment', inject(function( Segment, Point, moveSegmentEnd ) {
		var seg1 = Segment('C 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg1, 'start', Point(-10,-10) );

		expect( seg1.start.x ).toBe(-10);
		expect( seg1.start.y ).toBe(-10);
		expect( seg1.ctrl0.x ).toBe(10);
		expect( seg1.ctrl0.y ).toBe(20);
		expect( seg1.ctrl1.x ).toBe(30);
		expect( seg1.ctrl1.y ).toBe(40);
		expect( seg1.end.x ).toBe(50);
		expect( seg1.end.y ).toBe(60);

		var seg2 = Segment('C 10 20 30 40 50 60', Point(0,0));
		moveSegmentEnd( seg2, 'end', Point(70,80) );

		expect( seg2.start.x ).toBe(0);
		expect( seg2.start.y ).toBe(0);
		expect( seg2.ctrl0.x ).toBe(10);
		expect( seg2.ctrl0.y ).toBe(20);
		expect( seg2.ctrl1.x ).toBe(30);
		expect( seg2.ctrl1.y ).toBe(40);
		expect( seg2.end.x ).toBe(70);
		expect( seg2.end.y ).toBe(80);
	}));
});

describe('cutSegment', function() {

	it('cuts a straight line by moving its end to the desired coord (x or y) on this segment', inject(function( Segment, Point, cutSegment ) {
		var seg1 = Segment('L 30 50', Point(10,10));
		cutSegment( seg1, {x: 20}, 'end' );

		expect( seg1.start.x ).toBe(10);
		expect( seg1.start.y ).toBe(10);
		expect( seg1.end.x ).toBe(20);
		expect( seg1.end.y ).toBe(30);

		var seg2 = Segment('L 30 50', Point(10,10));
		cutSegment( seg2, {x: 20}, 'start' );

		expect( seg2.start.x ).toBe(20);
		expect( seg2.start.y ).toBe(30);
		expect( seg2.end.x ).toBe(30);
		expect( seg2.end.y ).toBe(50);
	}));

});

describe('invertSegment', function() {

	it('can invert start and end of a segment as well as related control points', inject(function( Segment, Point, invertSegment ) {
		var seg1 = Segment('L 30 50', Point(0,0));
		invertSegment( seg1 );

		expect( seg1.start.x ).toBe(30);
		expect( seg1.start.y ).toBe(50);
		expect( seg1.end.x ).toBe(0);
		expect( seg1.end.y ).toBe(0);

		var seg2 = Segment('C 10 20 30 40 50', Point(0,0));
		invertSegment( seg2 );

		expect( seg2.start.x ).toBe(40);
		expect( seg2.start.y ).toBe(50);
		expect( seg2.ctrl0.x ).toBe(30);
		expect( seg2.ctrl0.y ).toBe(40);
		expect( seg2.ctrl1.x ).toBe(10);
		expect( seg2.ctrl1.y ).toBe(20);
		expect( seg2.end.x ).toBe(0);
		expect( seg2.end.y ).toBe(0);
	}));

});
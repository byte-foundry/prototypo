'use strict';

describe('NodeList structure', function () {

	// load the controller's module
	beforeEach(module('prototypo.NodeList'));

	it('should create a linked node list from node data', inject(function(NodeList) {
		var nl = new NodeList(
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		);

		expect(nl.length).toBe(4);
		expect(nl.cycle).toBe(false);
		expect(nl.lastNode).toBe(nl.nodes[3]);
		expect(nl.nodes[0].next).toBe(nl.nodes[1]);
		expect(nl.nodes[1].next).toBe(nl.nodes[2]);
		expect(nl.nodes[2].next).toBe(nl.nodes[3]);
		expect(nl.nodes[3].next).toBe(undefined);
	}));

	it('should create a linked node list from an array of node data', inject(function(NodeList) {
		var nl = new NodeList([
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		]);

		expect(nl.length).toBe(4);
		expect(nl.lastNode).toBe(nl.nodes[3]);
		expect(nl.nodes[0].next).toBe(nl.nodes[1]);
		expect(nl.nodes[1].next).toBe(nl.nodes[2]);
		expect(nl.nodes[2].next).toBe(nl.nodes[3]);
		expect(nl.nodes[3].next).toBe(undefined);
	}));

	it('should create a cycling linked node list from node data', inject(function(NodeList) {
		var nl = new NodeList([
			{c: [0, 0]},
			{c: [0, 100]},
			{c: [100, 100]},
			{c: [100, 0]}
		], 'cycle');

		expect(nl.nodes.length).toBe(4);
		expect(nl.nodes[0].prev).toBe(nl.nodes[3]);
		expect(nl.nodes[3].next).toBe(nl.nodes[0]);
	}));

	it('should be possible to add a NodeList to a NodeList', inject(function(NodeList) {
		var nl1 = new NodeList([
			{c: [0, 0]},
			{c: [0, 100]}
		], 'cycle');

		var nl2 = new NodeList([
			{c: [100, 100]},
			{c: [100, 0]}
		], 'cycle');

		nl1.add( nl2 );

		expect(nl1.length).toBe(4);
		expect(nl1.lastNode).toBe(nl1.nodes[3]);
		expect(nl1.nodes[1].next).toBe(nl2.nodes[0]);
		expect(nl2.nodes[0].prev).toBe(nl1.nodes[1]);
		expect(nl1.nodes[0].prev).toBe(nl1.nodes[3]);
		expect(nl1.nodes[3].next).toBe(nl1.nodes[0]);
	}));
});
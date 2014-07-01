'use strict';

// load the controller's module
beforeEach(module('prototypo.History'));

/* jshint camelcase: false */
describe('History', function() {

	var dummy = { 'thickness' : 0 };

	it('starts with the reading head at -1 and an empty history', inject(function(History) {
		expect(History.readingHead).toBe(-1);
		expect(History._history.length).toBe(0);
	}));

	it('should increment our reading head when we add changes to the history', inject(function(History) {
		History.add( { 'thickness' : +100 } );
		expect(History.readingHead).toBe(0);
		expect(History._history.length).toBe(1);
	}));

	it('should decrement our reading head when we undo changes to the history', inject(function(History) {
		History.add( { 'thickness' : +100 } );
		History.undo(dummy);
		expect(History.readingHead).toBe(-1);
		expect(History._history.length).toBe(1);
	}));

	it('should increment our reading head when we redo changes to the history', inject(function(History) {
		History.add( { 'thickness' : +100 } );
		History.undo(dummy);
		History.redo(dummy);
		expect(History.readingHead).toBe(0);
		expect(History._history.length).toBe(1);
	}));

	it('shouldn\'t decrement our reading head when we have nothing to undo', inject(function(History) {
		History.add( { 'thickness' : +100 } );
		History.undo(dummy);
		expect(History.undo(dummy)).toBe(false);
		expect(History.readingHead).toBe(-1);
		expect(History._history.length).toBe(1);
	}));

	it('shouldn\'t increment our reading head when we have nothing to redo', inject(function(History) {
		History.redo(dummy);
		expect(History.redo(dummy)).toBe(false);
		expect(History.readingHead).toBe(-1);
		expect(History._history.length).toBe(0);
	}));

	it('should undo last changes', inject(function(History) {
		var changes =  { 'thickness' : +50 };
		History.add(changes);
		expect(History.undo(dummy)).toBe(changes);
	}));

	it('should redo previous changes', inject(function(History) {
		var changes1 =  { 'thickness' : +50 };
		var changes2 =  { 'thickness' : +100 };
		History.add( changes1 );
		History.add( changes2 );
		History.undo(dummy);
		expect(History.redo(dummy)).toBe(changes2);
	}));

	it('should modify fontValues when we undo', inject(function(History) {
		var changes1 =  { 'thickness' : +50 };
		var changes2 =  { 'thickness' : +100 };
		var fontValues = { 'thickness' : 300 };
		History.add( changes1 );
		History.add( changes2 );
		History.undo(fontValues);
		expect(fontValues.thickness).toBe(200);
	}));

	it('should modify fontValues when we redo', inject(function(History) {
		var fontValues = { 'thickness' : 300 };
		var changes =  { 'thickness' : +50 };
		History.add( changes );
		History.undo(fontValues);
		History.redo(fontValues);
		expect(fontValues.thickness).toBe(300);
	}));

	it('it should add changes after the reading head', inject(function(History) {
		expect(History.readingHead).toBe(-1);
		expect(History._history.length).toBe(0);
		History.add( { 'thickness' : +100 } );
		History.add( { 'thickness' : +150 } );
		History.add( { 'thickness' : +200 } );
		var fontValues = { 'thickness' : 500 };

		expect(fontValues.thickness).toBe(500);
		expect(History.readingHead).toBe(2);
		expect(History._history.length).toBe(3);

		History.undo(fontValues);

		expect(fontValues.thickness).toBe(300);
		expect(History.readingHead).toBe(1);
		expect(History._history.length).toBe(3);

		History.add( { 'thickness' : +10 } );

		expect(History.readingHead).toBe(2);
		expect(History._history.length).toBe(3);
	}));

});
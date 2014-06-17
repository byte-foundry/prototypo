'use strict';

window.CodeMirror.defineMode('pgf', function() {
	return {
		// provides the initial state of the parser
		startState: function() {
			return {};
		},
		token: function(stream, state) {
			if ( stream.sol() ) {
				state.value = stream.next();
				stream.eatSpace();
				state.type = 'command';

				return 'keyword';
			}

			if ( state.type === 'command' && state.value !== 'Z' ) {
				stream.eat('[');
				stream.eatSpace();

			}
		}
	};
});
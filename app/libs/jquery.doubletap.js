'use strict';

(function($) {

	$.event.special.doubletap = {
		setup: function() {
			$(this).bind( 'pointerdown', downHandler );
		},
		teardown: function() {
			$(this).bind( 'pointerdown', downHandler );
		},
		add: function( handleObj ) {
			var oldHandler = handleObj.handler,
				downs = 0,
				last = 0;

			handleObj.handler = function( event, timestamp ) {
				if ( timestamp - last > 500 ) {
					downs = 0;
				}

				last = timestamp;

				if ( ++downs === 2 ) {
					downs = 0;
					return oldHandler.apply( this, arguments );
				}
			};
		}
	};

	function downHandler( event ) {
		// change type
		event.type = 'doubletap';
		// re-trigger event
		$(event.currentTarget).triggerHandler(event);
	}

})(jQuery);
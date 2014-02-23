'use strict';
(function($) {

	// fixHook that passes event data to handler
	'down move up cancel enter leave out over'.split(' ').forEach(function( suffix ) {
		$.event.fixHooks['pointer' + suffix] = {
			props: $.event.mouseHooks.props,
			filter: $.event.mouseHooks.filter
		};
	});

	$.each({
		pointerenter: 'pointerover',
		pointerleave: 'pointerout'

	}, function( orig, fix ) {
		$.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	});

})(jQuery);
'use strict';

// resize listener by @csuwildcat
// see http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
(function( window ) {

	var style = document.createElement('style');
	style.innerHTML = '.resize-sensor, .resize-sensor > div {' +
			'position: absolute;' +
			'top: 0;' +
			'left: 0;' +
			'width: 100%;' +
			'height: 100%;' +
			'overflow: hidden;' +
			'z-index: -1;' +
		'}';
	document.head.appendChild( style );

	var _sensor = document.createElement('div');
	_sensor.className = 'resize-sensor';
	_sensor.innerHTML = '<div class="resize-overflow"><div></div></div><div class="resize-underflow"><div></div></div>';

	function addFlowListener(element, type, fn){
		var flow = type == 'over';
		element.addEventListener('OverflowEvent' in window ? 'overflowchanged' : type + 'flow', function(e){
			if (e.type == (type + 'flow') ||
			((e.orient == 0 && e.horizontalOverflow == flow) ||
			(e.orient == 1 && e.verticalOverflow == flow) ||
			(e.orient == 2 && e.horizontalOverflow == flow && e.verticalOverflow == flow))) {
				e.flow = type;
				return fn.call(this, e);
			}
		}, false);
	};
	
	function fireEvent(element, type, data, options){
		var options = options || {},
			event = document.createEvent('Event');
		event.initEvent(type, 'bubbles' in options ? options.bubbles : true, 'cancelable' in options ? options.cancelable : true);
		for (var z in data) event[z] = data[z];
		element.dispatchEvent(event);
    };
	
	function addResizeListener(element, fn){
		var resize = 'onresize' in element;
		if (!resize && !element._resizeSensor) {
			var sensor = element._resizeSensor = _sensor.cloneNode(true);
				
			var x = 0, y = 0,
				first = sensor.firstElementChild.firstChild,
				last = sensor.lastElementChild.firstChild,
				matchFlow = function(event){
					var change = false,
						width = element.offsetWidth;
					if (x != width) {
						first.style.width = width - 1 + 'px';	
						last.style.width = width + 1 + 'px';
						change = true;
						x = width;
					}
					var height = element.offsetHeight;
					if (y != height) {
						first.style.height = height - 1 + 'px';
						last.style.height = height + 1 + 'px';	
						change = true;
						y = height;
					}
					if (change && event.currentTarget != element) fireEvent(element, 'resize');
				};
			
			if (getComputedStyle(element).position == 'static'){
				element.style.position = 'relative';
				element._resizeSensor._resetPosition = true;
			}
			addFlowListener(sensor, 'over', matchFlow);
			addFlowListener(sensor, 'under', matchFlow);
			addFlowListener(sensor.firstElementChild, 'over', matchFlow);
			addFlowListener(sensor.lastElementChild, 'under', matchFlow);	
			element.appendChild(sensor);
			matchFlow({});
		}
		var events = element._flowEvents || (element._flowEvents = []);
		if (events.indexOf(fn) == -1) events.push(fn);
		if (!resize) element.addEventListener('resize', fn, false);
		element.onresize = function(e){
			events.forEach(function(fn){
				fn.call(element, e);
			});
		};
	};
	
	function removeResizeListener(element, fn){
		var index = element._flowEvents.indexOf(fn);
		if (index > -1) element._flowEvents.splice(index, 1);
		if (!element._flowEvents.length) {
			var sensor = element._resizeSensor;
			if (sensor) {
				element.removeChild(sensor);
				if (sensor._resetPosition) element.style.position = 'static';
				delete element._resizeSensor;
			}
			if ('onresize' in element) element.onresize = null;
			delete element._flowEvents;
		}
		element.removeEventListener('resize', fn);
	};

	window.addResizeListener = addResizeListener;

})( window );
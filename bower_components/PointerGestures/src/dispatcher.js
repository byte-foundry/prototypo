/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var CLONE_PROPS = [
    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    // DOM Level 3
    'buttons',
    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',
    // event instance
    'type',
    'target',
    'currentTarget',
    'screenX',
    'screenY',
    'pageX',
    'pageY',
    'tapPrevented'
  ];

  var CLONE_DEFAULTS = [
    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    // DOM Level 3
    0,
    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,
    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var dispatcher = {
    handledEvents: new WeakMap(),
    targets: new WeakMap(),
    handlers: {},
    recognizers: {},
    events: {},
    // Add a new gesture recognizer to the event listeners.
    // Recognizer needs an `events` property.
    registerRecognizer: function(inName, inRecognizer) {
      var r = inRecognizer;
      this.recognizers[inName] = r;
      r.events.forEach(function(e) {
        if (r[e]) {
          this.events[e] = true;
          var f = r[e].bind(r);
          this.addHandler(e, f);
        }
      }, this);
    },
    addHandler: function(inEvent, inFn) {
      var e = inEvent;
      if (!this.handlers[e]) {
        this.handlers[e] = [];
      }
      this.handlers[e].push(inFn);
    },
    // add event listeners for inTarget
    registerTarget: function(inTarget) {
      this.listen(Object.keys(this.events), inTarget);
    },
    // remove event listeners for inTarget
    unregisterTarget: function(inTarget) {
      this.unlisten(Object.keys(this.events), inTarget);
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      if (this.handledEvents.get(inEvent)) {
        return;
      }
      var type = inEvent.type, fns = this.handlers[type];
      if (fns) {
        this.makeQueue(fns, inEvent);
      }
      this.handledEvents.set(inEvent, true);
    },
    // queue event for async dispatch
    makeQueue: function(inHandlerFns, inEvent) {
      // must clone events to keep the (possibly shadowed) target correct for
      // async dispatching
      var e = this.cloneEvent(inEvent);
      requestAnimationFrame(this.runQueue.bind(this, inHandlerFns, e));
    },
    // Dispatch the queued events
    runQueue: function(inHandlers, inEvent) {
      this.currentPointerId = inEvent.pointerId;
      for (var i = 0, f, l = inHandlers.length; (i < l) && (f = inHandlers[i]); i++) {
        f(inEvent);
      }
      this.currentPointerId = 0;
    },
    // set up event listeners
    listen: function(inEvents, inTarget) {
      inEvents.forEach(function(e) {
        this.addEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    // remove event listeners
    unlisten: function(inEvents) {
      inEvents.forEach(function(e) {
        this.removeEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    addEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.addEventListener(inEventName, inEventHandler, inCapture);
    },
    removeEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.removeEventListener(inEventName, inEventHandler, inCapture);
    },
    // EVENT CREATION AND TRACKING
    // Creates a new Event of type `inType`, based on the information in
    // `inEvent`.
    makeEvent: function(inType, inDict) {
      return new PointerGestureEvent(inType, inDict);
    },
    /*
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @method cloneEvent
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = {}, p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];
      }
      return eventCopy;
    },
    // Dispatches the event to its target.
    dispatchEvent: function(inEvent, inTarget) {
      var t = inTarget || this.targets.get(inEvent);
      if (t) {
        t.dispatchEvent(inEvent);
        if (inEvent.tapPrevented) {
          this.preventTap(this.currentPointerId);
        }
      }
    },
    asyncDispatchEvent: function(inEvent, inTarget) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent, inTarget));
    },
    preventTap: function(inPointerId) {
      var t = this.recognizers.tap;
      if (t){
        t.preventTap(inPointerId);
      }
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  // recognizers call into the dispatcher and load later
  // solve the chicken and egg problem by having registerScopes module run last
  dispatcher.registerQueue = [];
  dispatcher.immediateRegister = false;
  scope.dispatcher = dispatcher;
  /**
   * Enable gesture events for a given scope, typically
   * [ShadowRoots](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#shadow-root-object).
   *
   * @for PointerGestures
   * @method register
   * @param {ShadowRoot} scope A top level scope to enable gesture
   * support on.
   */
  scope.register = function(inScope) {
    if (dispatcher.immediateRegister) {
      var pe = window.PointerEventsPolyfill;
      if (pe) {
        pe.register(inScope);
      }
      scope.dispatcher.registerTarget(inScope);
    } else {
      dispatcher.registerQueue.push(inScope);
    }
  };
  scope.register(document);
})(window.PointerGestures);

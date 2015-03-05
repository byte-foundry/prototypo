/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event is fired when a pointer quickly goes down and up, and is used to
 * denote activation.
 *
 * Any gesture event can prevent the tap event from being created by calling
 * `event.preventTap`.
 *
 * Any pointer event can prevent the tap by setting the `tapPrevented` property
 * on itself.
 *
 * @module PointerGestures
 * @submodule Events
 * @class tap
 */
/**
 * X axis position of the tap.
 * @property x
 * @type Number
 */
/**
 * Y axis position of the tap.
 * @property y
 * @type Number
 */
/**
 * Type of the pointer that made the tap.
 * @property pointerType
 * @type String
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = new scope.PointerMap();
  var tap = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'keyup'
    ],
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary && !inEvent.tapPrevented) {
        pointermap.set(inEvent.pointerId, {
          target: inEvent.target,
          buttons: inEvent.buttons,
          x: inEvent.clientX,
          y: inEvent.clientY
        });
      }
    },
    pointermove: function(inEvent) {
      if (inEvent.isPrimary) {
        var start = pointermap.get(inEvent.pointerId);
        if (start) {
          if (inEvent.tapPrevented) {
            pointermap.delete(inEvent.pointerId);
          }
        }
      }
    },
    shouldTap: function(e, downState) {
      if (!e.tapPrevented) {
        if (e.pointerType === 'mouse') {
          // only allow left click to tap for mouse
          return downState.buttons === 1;
        } else {
          return true;
        }
      }
    },
    pointerup: function(inEvent) {
      var start = pointermap.get(inEvent.pointerId);
      if (start && this.shouldTap(inEvent, start)) {
        var t = scope.findLCA(start.target, inEvent.target);
        if (t) {
          var e = dispatcher.makeEvent('tap', {
            x: inEvent.clientX,
            y: inEvent.clientY,
            detail: inEvent.detail,
            pointerType: inEvent.pointerType
          });
          dispatcher.dispatchEvent(e, t);
        }
      }
      pointermap.delete(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      pointermap.delete(inEvent.pointerId);
    },
    keyup: function(inEvent) {
      var code = inEvent.keyCode;
      // 32 == spacebar
      if (code === 32) {
        var t = inEvent.target;
        if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) {
          dispatcher.dispatchEvent(dispatcher.makeEvent('tap', {
            x: 0,
            y: 0,
            detail: 0,
            pointerType: 'unavailable'
          }), t);
        }
      }
    },
    preventTap: function(inPointerId) {
      pointermap.delete(inPointerId);
    }
  };
  dispatcher.registerRecognizer('tap', tap);
})(window.PointerGestures);

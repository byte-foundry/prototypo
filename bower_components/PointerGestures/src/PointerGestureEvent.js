/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * PointerGestureEvent is the constructor for all PointerGesture events.
 *
 * @module PointerGestures
 * @class PointerGestureEvent
 * @extends UIEvent
 * @constructor
 * @param {String} inType Event type
 * @param {Object} [inDict] Dictionary of properties to initialize on the event
 */

function PointerGestureEvent(inType, inDict) {
  var dict = inDict || {};
  var e = document.createEvent('Event');
  var props = {
    bubbles: Boolean(dict.bubbles) === dict.bubbles || true,
    cancelable: Boolean(dict.cancelable) === dict.cancelable || true
  };

  e.initEvent(inType, props.bubbles, props.cancelable);

  var keys = Object.keys(dict), k;
  for (var i = 0; i < keys.length; i++) {
    k = keys[i];
    e[k] = dict[k];
  }

  e.preventTap = this.preventTap;

  return e;
}

/**
 * Allows for any gesture to prevent the tap gesture.
 *
 * @method preventTap
 */
PointerGestureEvent.prototype.preventTap = function() {
  this.tapPrevented = true;
};


/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/*
 * Basic strategy: find the farthest apart points, use as diameter of circle
 * react to size change and rotation of the chord
 */

/**
 * @module PointerGestures
 * @submodule Events
 * @class pinch
 */
/**
 * Scale of the pinch zoom gesture
 * @property scale
 * @type Number
 */
/**
 * Center X position of pointers causing pinch
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing pinch
 * @property centerY
 * @type Number
 */

/**
 * @module PointerGestures
 * @submodule Events
 * @class rotate
 */
/**
 * Angle (in degrees) of rotation. Measured from starting positions of pointers.
 * @property angle
 * @type Number
 */
/**
 * Center X position of pointers causing rotation
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing rotation
 * @property centerY
 * @type Number
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = new scope.PointerMap();
  var RAD_TO_DEG = 180 / Math.PI;
  var pinch = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    reference: {},
    pointerdown: function(ev) {
      pointermap.set(ev.pointerId, ev);
      if (pointermap.pointers() == 2) {
        var points = this.calcChord();
        var angle = this.calcAngle(points);
        this.reference = {
          angle: angle,
          diameter: points.diameter,
          target: scope.findLCA(points.a.target, points.b.target)
        };
      }
    },
    pointerup: function(ev) {
      pointermap.delete(ev.pointerId);
    },
    pointermove: function(ev) {
      if (pointermap.has(ev.pointerId)) {
        pointermap.set(ev.pointerId, ev);
        if (pointermap.pointers() > 1) {
          this.calcPinchRotate();
        }
      }
    },
    pointercancel: function(ev) {
      this.pointerup(ev);
    },
    dispatchPinch: function(diameter, points) {
      var zoom = diameter / this.reference.diameter;
      var ev = dispatcher.makeEvent('pinch', {
        scale: zoom,
        centerX: points.center.x,
        centerY: points.center.y
      });
      dispatcher.dispatchEvent(ev, this.reference.target);
    },
    dispatchRotate: function(angle, points) {
      var diff = Math.round((angle - this.reference.angle) % 360);
      var ev = dispatcher.makeEvent('rotate', {
        angle: diff,
        centerX: points.center.x,
        centerY: points.center.y
      });
      dispatcher.dispatchEvent(ev, this.reference.target);
    },
    calcPinchRotate: function() {
      var points = this.calcChord();
      var diameter = points.diameter;
      var angle = this.calcAngle(points);
      if (diameter != this.reference.diameter) {
        this.dispatchPinch(diameter, points);
      }
      if (angle != this.reference.angle) {
        this.dispatchRotate(angle, points);
      }
    },
    calcChord: function() {
      var pointers = [];
      pointermap.forEach(function(p) {
        pointers.push(p);
      });
      var dist = 0;
      // start with at least two pointers
      var points = {a: pointers[0], b: pointers[1]};
      var x, y, d;
      for (var i = 0; i < pointers.length; i++) {
        var a = pointers[i];
        for (var j = i + 1; j < pointers.length; j++) {
          var b = pointers[j];
          x = Math.abs(a.clientX - b.clientX);
          y = Math.abs(a.clientY - b.clientY);
          d = x + y;
          if (d > dist) {
            dist = d;
            points = {a: a, b: b};
          }
        }
      }
      x = Math.abs(points.a.clientX + points.b.clientX) / 2;
      y = Math.abs(points.a.clientY + points.b.clientY) / 2;
      points.center = { x: x, y: y };
      points.diameter = dist;
      return points;
    },
    calcAngle: function(points) {
      var x = points.a.clientX - points.b.clientX;
      var y = points.a.clientY - points.b.clientY;
      return (360 + Math.atan2(y, x) * RAD_TO_DEG) % 360;
    },
  };
  dispatcher.registerRecognizer('pinch', pinch);
})(window.PointerGestures);

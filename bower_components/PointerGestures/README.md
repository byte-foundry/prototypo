# Pointer Gestures
> Rich gestures that work on both desktop and mobile

PointerGestures uses PointerEvents to make useful gestures for application
development.

[![Build status](http://www.polymer-project.org/build/PointerGestures/status.png "Build status")](http://build.chromium.org/p/client.polymer/waterfall)

## Events

Included events are:
- `tap` - a pointer moves down and up quickly, preventable with
  `<pointerevent>.preventTap`
- `hold` - a pointer is held down
- `holdpulse` - fires on an interval while the pointer is held down
- `release` - a held pointer is released
- `flick` - a primary pointer moved quickly across the screen, and was released
- `trackstart` - a primary pointer has started moving away from it's inital
  start point
- `track` - a primary pointer continues to move, targets the element that
  received `trackstart`
- `trackend` - a primary pointer has been released, targets the element that
  received `trackstart`
- `pinch` - Two pointers are pinching in and out
- `rotate` - Two pointers are rotating around a center point

## Installation

1. Install the [PointerEvents polyfill](http://github.com/Polymer/PointerEvents) as a sibling to PointerGestures

2. Include `PointerGestures/pointergestures.js` in your page.

3. Set the `touch-action` of a few elements and see the events fire!

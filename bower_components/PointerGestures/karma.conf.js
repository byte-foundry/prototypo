module.exports = function(karma) {
  var common = require('../tools/test/karma-common.conf.js');
  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // list of files / patterns to load in the browser
    files: [
      'PointerGestures/node_modules/chai/chai.js',
      'PointerGestures/node_modules/chai-spies/chai-spies.js',
      'WeakMap/weakmap.js',
      'PointerEvents/src/boot.js',
      'PointerEvents/src/PointerEvent.js',
      'PointerEvents/src/pointermap.js',
      'PointerEvents/src/dispatcher.js',
      'PointerEvents/src/installer.js',
      'PointerEvents/src/mouse.js',
      'PointerEvents/src/touch.js',
      'PointerEvents/src/ms.js',
      'PointerEvents/src/platform-events.js',
      'PointerEvents/src/capture.js',
      'PointerGestures/src/PointerGestureEvent.js',
      'PointerGestures/src/initialize.js',
      'PointerGestures/src/pointermap.js',
      'PointerGestures/src/dispatcher.js',
      'PointerGestures/src/hold.js',
      'PointerGestures/src/track.js',
      'PointerGestures/src/flick.js',
      'PointerGestures/src/tap.js',
      'PointerGestures/src/registerScopes.js',
      'PointerGestures/tests/setup.js',
      'PointerGestures/tests/!(setup).js'
    ]
  }));
};

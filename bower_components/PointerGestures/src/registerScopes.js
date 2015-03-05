/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * Because recognizers are loaded after dispatcher, we have to wait to register
 * scopes until after all the recognizers.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  function registerScopes() {
    dispatcher.immediateRegister = true;
    var rq = dispatcher.registerQueue;
    rq.forEach(scope.register);
    rq.length = 0;
  }
  if (document.readyState === 'complete') {
    registerScopes();
  } else {
    // register scopes after a steadystate is reached
    // less MutationObserver churn
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') {
        registerScopes();
      }
    });
  }
})(window.PointerGestures);

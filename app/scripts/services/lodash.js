'use strict';

// This puts underscore in a service,
// which prevents a lot of errors in JSLint
angular.module('lodash', [])
	.factory('_', function() {
		return window._;
	});
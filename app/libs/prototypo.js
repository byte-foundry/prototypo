(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		//Allow using this built library as an AMD module
		//in another project. That other project will only
		//see this AMD call, not the internal modules in
		//the closure below.
		define([], factory);
	} else {
		//Browser globals case. Just assign the
		//result to a property on the global.
		root.prototypo = factory();
	}
}(this, function () {

// Object.mixin polyfill for IE9+
if ( !Object.mixin ) {
	Object.mixin = function( target, source ) {
		var props = Object.getOwnPropertyNames(source),
			p,
			descriptor,
			length = props.length;

		for (p = 0; p < length; p++) {
			descriptor = Object.getOwnPropertyDescriptor(source, props[p]);
			Object.defineProperty(target, props[p], descriptor);
		}

		return target;
	};
}
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("bower_components/almond/almond", function(){});

define('classes/Classify.js',[], function() {
  
  function Classify() {
    var args = arguments[0] !== (void 0) ? arguments[0] : {};
    if (!args.tags) {
      args.tags = [];
    }
    var self = this;
    this._tags = typeof args.tags === 'string' ? args.tags.split(' ') : args.tags;
    this.type = args.type;
    Object.defineProperty(this, 'tags', {
      get: function() {
        return {
          toString: function() {
            return self._tags.join(' ');
          },
          add: function() {
            Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
              if (self._tags.indexOf(tag) === -1) {
                self._tags.push(tag);
              }
            }));
          },
          remove: function() {
            Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
              var i = self._tags.indexOf(tag);
              if (i !== -1) {
                self._tags.splice(i, 1);
              }
            }));
          },
          has: function() {
            var _has = true;
            Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
              if (self._tags.indexOf(tag) === -1) {
                _has = false;
              }
            }));
            return _has;
          }
        };
      },
      set: function(tags) {
        return (self._tags = typeof tags === 'string' ? tags.split(' ') : tags);
      }
    });
  }
  var $__default = Classify;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJjbGFzc2VzL0NsYXNzaWZ5LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsS0FBSyxBQUFDLElDQU4sVUFBUyxBQUFnQjs7QUNBekIsU0FBUyxTQUFPLENBQUcsQUFBUTtNQUFSLEtBQUcsNkNBQUksR0FBQztBQUMxQixPQUFLLENBQUMsSUFBRyxLQUFLLENBQUk7QUFDakIsU0FBRyxLQUFLLEVBQUksR0FBQyxDQUFDO0lBQ2Y7QUFBQSxBQUNJLE1BQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBRWYsT0FBRyxNQUFNLEVBQUksQ0FBQSxNQUFPLEtBQUcsS0FBSyxDQUFBLEdBQU0sU0FBTyxDQUFBLENBQ3hDLENBQUEsSUFBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFBLENBQ25CLENBQUEsSUFBRyxLQUFLLENBQUM7QUFFVixPQUFHLEtBQUssRUFBSSxDQUFBLElBQUcsS0FBSyxDQUFDO0FBRXJCLFNBQUssZUFBZSxBQUFDLENBQUUsSUFBRyxDQUFHLE9BQUssQ0FBRztBQUNwQyxRQUFFLENBQUcsVUFBUSxBQUFDO0FBQ2IsYUFBTztBQUNOLGlCQUFPLENBQVAsVUFBUSxBQUFDLENBQUU7QUFDVixpQkFBTyxDQUFBLElBQUcsTUFBTSxLQUFLLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztVQUM1QjtBQUNBLFlBQUUsQ0FBRixVQUFHLEFBQUM7QUFDSCxnQkFBSSxVQUFVLE1BQU0sS0FBSyxBQUFDLENBQUMsU0FBUSxDQUFHLEVBQUEsQ0FBQyxRQUFRLEFBQUMsRUFBQyxTQUFBLEdBQUUsQ0FBSztBQUN2RCxpQkFBSyxJQUFHLE1BQU0sUUFBUSxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBSTtBQUN2QyxtQkFBRyxNQUFNLEtBQUssQUFBQyxDQUFFLEdBQUUsQ0FBRSxDQUFDO2NBQ3ZCO0FBQUEsWUFDRCxFQUFDLENBQUM7VUFDSDtBQUNBLGVBQUssQ0FBTCxVQUFNLEFBQUM7QUFDTixnQkFBSSxVQUFVLE1BQU0sS0FBSyxBQUFDLENBQUMsU0FBUSxDQUFHLEVBQUEsQ0FBQyxRQUFRLEFBQUMsRUFBQyxTQUFBLEdBQUUsQ0FBSztBQUN2RCxBQUFJLGdCQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsSUFBRyxNQUFNLFFBQVEsQUFBQyxDQUFFLEdBQUUsQ0FBRSxDQUFDO0FBQ2pDLGlCQUFLLENBQUEsSUFBTSxFQUFDLENBQUEsQ0FBSTtBQUNmLG1CQUFHLE1BQU0sT0FBTyxBQUFDLENBQUUsQ0FBQSxDQUFHLEVBQUEsQ0FBRSxDQUFDO2NBQzFCO0FBQUEsWUFDRCxFQUFDLENBQUM7VUFDSDtBQUNBLFlBQUUsQ0FBRixVQUFHLEFBQUM7QUFDSCxBQUFJLGNBQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBRWYsZ0JBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsaUJBQUssSUFBRyxNQUFNLFFBQVEsQUFBQyxDQUFFLEdBQUUsQ0FBRSxDQUFBLEdBQU0sRUFBQyxDQUFBLENBQUk7QUFDdkMsbUJBQUcsRUFBSSxNQUFJLENBQUM7Y0FDYjtBQUFBLFlBQ0QsRUFBQyxDQUFDO0FBRUYsaUJBQU8sS0FBRyxDQUFDO1VBQ1o7UUFDRCxDQUFDO01BQ0Y7QUFDQSxRQUFFLENBQUcsVUFBVSxJQUFHLENBQUk7QUFDckIsYUFBTyxFQUFFLElBQUcsTUFBTSxFQUFJLENBQUEsTUFBTyxLQUFHLENBQUEsR0FBTSxTQUFPLENBQUEsQ0FDNUMsQ0FBQSxJQUFHLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFBLENBQ2QsS0FBRyxDQUNKLENBQUM7TUFDRjtBQUFBLElBQ0QsQ0FBQyxDQUFDO0VBQ0g7QUNyREEsQUFBSSxJQUFBLENBQUEsVUFBUyxFRHVERSxTQ3ZEa0IsQUR1RFgsQ0N2RFc7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0RGdUMsQ0FBQztBRXVEckIiLCJmaWxlIjoiY2xhc3Nlcy9DbGFzc2lmeS5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJmdW5jdGlvbiBDbGFzc2lmeSggYXJncyA9IHt9ICkge1xuXHRpZiAoICFhcmdzLnRhZ3MgKSB7XG5cdFx0YXJncy50YWdzID0gW107XG5cdH1cblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHRoaXMuX3RhZ3MgPSB0eXBlb2YgYXJncy50YWdzID09PSAnc3RyaW5nJyA/XG5cdFx0YXJncy50YWdzLnNwbGl0KCcgJyk6XG5cdFx0YXJncy50YWdzO1xuXG5cdHRoaXMudHlwZSA9IGFyZ3MudHlwZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICd0YWdzJywge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0b1N0cmluZygpIHtcblx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fdGFncy5qb2luKCcgJyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFkZCgpIHtcblx0XHRcdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0XHRcdGlmICggc2VsZi5fdGFncy5pbmRleE9mKCB0YWcgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdFx0XHRcdHNlbGYuX3RhZ3MucHVzaCggdGFnICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlbW92ZSgpIHtcblx0XHRcdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0XHRcdHZhciBpID0gc2VsZi5fdGFncy5pbmRleE9mKCB0YWcgKTtcblx0XHRcdFx0XHRcdGlmICggaSAhPT0gLTEgKSB7XG5cdFx0XHRcdFx0XHRcdHNlbGYuX3RhZ3Muc3BsaWNlKCBpLCAxICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhhcygpIHtcblx0XHRcdFx0XHR2YXIgX2hhcyA9IHRydWU7XG5cblx0XHRcdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0XHRcdGlmICggc2VsZi5fdGFncy5pbmRleE9mKCB0YWcgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdFx0XHRcdF9oYXMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiBfaGFzO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbiggdGFncyApIHtcblx0XHRcdHJldHVybiAoIHNlbGYuX3RhZ3MgPSB0eXBlb2YgdGFncyA9PT0gJ3N0cmluZycgP1xuXHRcdFx0XHR0YWdzLnNwbGl0KCcgJyk6XG5cdFx0XHRcdHRhZ3Ncblx0XHRcdCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2xhc3NpZnk7IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Point.js',['./Classify.js'], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Classify = $__0.default;
  function Point(x, y) {
    Classify.prototype.constructor.call(this);
    if (!x && x !== 0) {
      this.coords = new Float32Array([x, y]);
    } else if (x.constructor === Array || x.constructor === Float32Array) {
      this.coords = new Float32Array(x);
    } else if (typeof x === 'object' && ('x' in x || 'y' in x)) {
      this.coords = new Float32Array([x.x, x.y]);
    } else {
      this.coords = new Float32Array([x, y]);
    }
  }
  Point.prototype = Object.create(Classify.prototype);
  Point.prototype.constructor = Point;
  Object.defineProperties(Point.prototype, {
    x: {
      get: function() {
        return this.coords[0];
      },
      set: function(x) {
        this.coords[0] = x;
      }
    },
    y: {
      get: function() {
        return this.coords[1];
      },
      set: function(y) {
        this.coords[1] = y;
      }
    }
  });
  Object.mixin(Point.prototype, {
    set: function(x, y) {
      this.coords[0] = x;
      this.coords[1] = y;
    },
    transform: function(m) {
      var coords0 = this.coords[0];
      this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
      this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];
      return this;
    },
    toString: function() {
      return (isNaN(this.coords[0]) ? 'NaN' : Math.round(this.coords[0])) + ' ' + (isNaN(this.coords[1]) ? 'NaN' : Math.round(this.coords[1]));
    },
    toJSON: function() {
      return this.toString();
    },
    _: function(x, y) {
      if (x === undefined || x === null) {
        this.coords[0] = x;
        this.coords[1] = y;
      } else if (x.constructor === Array || x.constructor === Float32Array) {
        this.coords[0] = x[0];
        this.coords[1] = x[1];
      } else if (typeof x === 'object' && ('x' in x || 'y' in x)) {
        this.coords[0] = x.x;
        this.coords[1] = x.y;
      } else {
        this.coords[0] = x;
        this.coords[1] = y;
      }
      return this;
    },
    translate: function(x, y) {
      var p = x instanceof Point ? x : new Point(x, y);
      if (!isNaN(p.coords[0])) {
        this.coords[0] += p.coords[0];
      }
      if (!isNaN(p.coords[1])) {
        this.coords[1] += p.coords[1];
      }
      return this;
    },
    translateX: function(x) {
      this.coords[0] += x;
      return this;
    },
    translateY: function(y) {
      this.coords[1] += y;
      return this;
    }
  });
  Point.prototype.onLine = function(knownCoord, p1, p2) {
    var origin = p1,
        vector = [p2.x - p1.x, p2.y - p1.y];
    if (knownCoord === 'x') {
      this.coords[1] = (this.coords[0] - origin.x) / vector[0] * vector[1] + origin.y;
    } else {
      this.coords[0] = (this.coords[1] - origin.y) / vector[1] * vector[0] + origin.x;
    }
  };
  var $__default = Point;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Qb2ludC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBZSxlQUFjLEVDQW5DLFVBQVMsSUFBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFBQSxJRkRwRCxTQUFPO0FBRWQsU0FBUyxNQUFJLENBQUcsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFJO0FBQ3RCLFdBQU8sVUFBVSxZQUFZLEtBQUssQUFBQyxDQUFFLElBQUcsQ0FBRSxDQUFDO0FBRTNDLE9BQUssQ0FBQyxDQUFBLENBQUEsRUFBSyxDQUFBLENBQUEsSUFBTSxFQUFBLENBQUk7QUFDcEIsU0FBRyxPQUFPLEVBQUksSUFBSSxhQUFXLEFBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRyxFQUFBLENBQUMsQ0FBQyxDQUFDO0lBRXZDLEtBQU8sS0FBSyxDQUFBLFlBQVksSUFBTSxNQUFJLENBQUEsRUFBSyxDQUFBLENBQUEsWUFBWSxJQUFNLGFBQVcsQ0FBSTtBQUN2RSxTQUFHLE9BQU8sRUFBSSxJQUFJLGFBQVcsQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRWxDLEtBQU8sS0FBSyxNQUFPLEVBQUEsQ0FBQSxHQUFNLFNBQU8sQ0FBQSxFQUFLLEVBQUUsR0FBRSxHQUFLLEVBQUEsQ0FBQSxF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RSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxDQUFFLEVBQUksQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsTUFBSyxFQUFFLENBQUM7SUFDbEYsS0FBTztBQUNOLFNBQUcsT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsQ0FBRSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxDQUFFLEVBQUksQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsTUFBSyxFQUFFLENBQUM7SUFDbEY7QUFBQSxFQUNELENBQUM7QUczSEQsQUFBSSxJQUFBLENBQUEsVUFBUyxFSDZIRSxNRzdIa0IsQUg2SGQsQ0c3SGM7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQzZIeEIiLCJmaWxlIjoiY2xhc3Nlcy9Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImltcG9ydCBDbGFzc2lmeSBmcm9tICcuL0NsYXNzaWZ5LmpzJztcblxuZnVuY3Rpb24gUG9pbnQoIHgsIHkgKSB7XG5cdENsYXNzaWZ5LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKCB0aGlzICk7XG5cblx0aWYgKCAheCAmJiB4ICE9PSAwICkge1xuXHRcdHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheShbeCwgeV0pO1xuXG5cdH0gZWxzZSBpZiAoIHguY29uc3RydWN0b3IgPT09IEFycmF5IHx8IHguY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheSApIHtcblx0XHR0aGlzLmNvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkoeCk7XG5cblx0fSBlbHNlIGlmICggdHlwZW9mIHggPT09ICdvYmplY3QnICYmICggJ3gnIGluIHggfHwgJ3knIGluIHggKSApIHtcblx0XHR0aGlzLmNvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkoW3gueCwgeC55XSk7XG5cblx0fSBlbHNlIHtcblx0XHR0aGlzLmNvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkoW3gsIHldKTtcblxuXHR9XG59XG5cblBvaW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3NpZnkucHJvdG90eXBlKTtcblBvaW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50O1xuXG4vLyAueCBhbmQgLnkgYXJlIG1vcmUgY29udmVuaWVudCB0aGFuIC5jb29yZHNbMF0gYW5kIC5jb29yZHNbMV1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBvaW50LnByb3RvdHlwZSwge1xuXHR4OiB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29vcmRzWzBdOyB9LFxuXHRcdHNldDogZnVuY3Rpb24oIHggKSB7IHRoaXMuY29vcmRzWzBdID0geDsgfVxuXHR9LFxuXHR5OiB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29vcmRzWzFdOyB9LFxuXHRcdHNldDogZnVuY3Rpb24oIHkgKSB7IHRoaXMuY29vcmRzWzFdID0geTsgfVxuXHR9XG59KTtcblxuT2JqZWN0Lm1peGluKFBvaW50LnByb3RvdHlwZSwge1xuXG5cdHNldCh4LCB5KSB7XG5cdFx0dGhpcy5jb29yZHNbMF0gPSB4O1xuXHRcdHRoaXMuY29vcmRzWzFdID0geTtcblx0fSxcblxuXHR0cmFuc2Zvcm0oIG0gKSB7XG5cdFx0dmFyIGNvb3JkczAgPSB0aGlzLmNvb3Jkc1swXTtcblx0XHR0aGlzLmNvb3Jkc1swXSA9IG1bMF0gKiBjb29yZHMwICsgbVsyXSAqIHRoaXMuY29vcmRzWzFdICsgbVs0XTtcblx0XHR0aGlzLmNvb3Jkc1sxXSA9IG1bMV0gKiBjb29yZHMwICsgbVszXSAqIHRoaXMuY29vcmRzWzFdICsgbVs1XTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAoIGlzTmFOKCB0aGlzLmNvb3Jkc1swXSApID8gJ05hTicgOiBNYXRoLnJvdW5kKCB0aGlzLmNvb3Jkc1swXSApICkgK1xuXHRcdFx0JyAnICtcblx0XHRcdCggaXNOYU4oIHRoaXMuY29vcmRzWzFdICkgPyAnTmFOJyA6IE1hdGgucm91bmQoIHRoaXMuY29vcmRzWzFdICkgKTtcblx0fSxcblxuXHR0b0pTT04oKSB7XG5cdFx0cmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcblx0fSxcblxuXHQvLyBUaGUgZm9sbG93aW5nIG1ldGhvZHMgYXJlIGRlcHJlY2F0ZWRcblxuXHQvLyBhIHNldHRlciBmb3IgeC95IGNvb3JkaW5hdGVzIHRoYXQgYmVoYXZlcyBleGFjdGx5IGxpa2UgdGhlIGNvbnN0cnVjdG9yXG5cdF8oeCwgeSkge1xuXHRcdGlmICggeCA9PT0gdW5kZWZpbmVkIHx8wqB4ID09PSBudWxsICkge1xuXHRcdFx0dGhpcy5jb29yZHNbMF0gPSB4O1xuXHRcdFx0dGhpcy5jb29yZHNbMV0gPSB5O1xuXG5cdFx0fSBlbHNlIGlmICggeC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgfHwgeC5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5ICkge1xuXHRcdFx0dGhpcy5jb29yZHNbMF0gPSB4WzBdO1xuXHRcdFx0dGhpcy5jb29yZHNbMV0gPSB4WzFdO1xuXG5cdFx0fSBlbHNlIGlmICggdHlwZW9mIHggPT09ICdvYmplY3QnICYmICggJ3gnIGluIHggfHwgJ3knIGluIHggKSApIHtcblx0XHRcdHRoaXMuY29vcmRzWzBdID0geC54O1xuXHRcdFx0dGhpcy5jb29yZHNbMV0gPSB4Lnk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb29yZHNbMF0gPSB4O1xuXHRcdFx0dGhpcy5jb29yZHNbMV0gPSB5O1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dHJhbnNsYXRlKCB4LCB5ICkge1xuXHRcdHZhciBwID0geCBpbnN0YW5jZW9mIFBvaW50ID9cblx0XHRcdFx0eDpcblx0XHRcdFx0bmV3IFBvaW50KCB4LCB5ICk7XG5cblx0XHRpZiAoICFpc05hTiggcC5jb29yZHNbMF0gKSApIHtcblx0XHRcdHRoaXMuY29vcmRzWzBdICs9IHAuY29vcmRzWzBdO1xuXHRcdH1cblx0XHRpZiAoICFpc05hTiggcC5jb29yZHNbMV0gKSApIHtcblx0XHRcdHRoaXMuY29vcmRzWzFdICs9IHAuY29vcmRzWzFdO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRyYW5zbGF0ZVgoIHggKSB7XG5cdFx0dGhpcy5jb29yZHNbMF0gKz0geDtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR0cmFuc2xhdGVZKCB5ICkge1xuXHRcdHRoaXMuY29vcmRzWzFdICs9IHk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5Qb2ludC5wcm90b3R5cGUub25MaW5lID0gZnVuY3Rpb24oIGtub3duQ29vcmQsIHAxLCBwMiApIHtcblx0dmFyIG9yaWdpbiA9IHAxLFxuXHRcdHZlY3RvciA9IFtcblx0XHRcdHAyLnggLSBwMS54LFxuXHRcdFx0cDIueSAtIHAxLnlcblx0XHRdO1xuXG5cdGlmICgga25vd25Db29yZCA9PT0gJ3gnICkge1xuXHRcdHRoaXMuY29vcmRzWzFdID0gKCB0aGlzLmNvb3Jkc1swXSAtIG9yaWdpbi54ICkgLyB2ZWN0b3JbMF0gKiB2ZWN0b3JbMV0gKyBvcmlnaW4ueTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmNvb3Jkc1swXSA9ICggdGhpcy5jb29yZHNbMV0gLSBvcmlnaW4ueSApIC8gdmVjdG9yWzFdICogdmVjdG9yWzBdICsgb3JpZ2luLng7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBvaW50OyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Utils.js',[], function() {
  
  var Utils = {};
  Utils.propFromPath = function(_path, glyph, contour) {
    var context,
        path = _path.split('.');
    path.forEach((function(name) {
      if (!context) {
        context = name === 'nodes' ? contour : glyph;
      }
      context = context[name];
    }));
    return context;
  };
  Utils.lineAngle = function(p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  };
  Utils.createUpdaters = function(branch) {
    if (branch.constructor === Object && typeof branch.operation === 'string') {
      var args = ['contours', 'anchors', 'parentAnchors', 'nodes', 'Utils'].concat(branch.parameters).concat('return ' + branch.operation);
      return (branch.updater = Function.apply(null, args));
    }
    if (branch.constructor === Object) {
      for (var i in branch) {
        Utils.createUpdaters(branch[i]);
      }
    }
    if (branch.constructor === Array) {
      branch.forEach((function(subBranch) {
        return Utils.createUpdaters(subBranch);
      }));
    }
  };
  Utils.mergeStatic = function(obj, src) {
    for (var i in src) {
      if (typeof src[i] !== 'object') {
        obj[i] = src[i];
      }
    }
  };
  Utils.matrixProduct = function(m1, m2, tmp) {
    if (!tmp) {
      tmp = new Float32Array(6);
    }
    tmp[0] = m1[0] * m2[0] + m1[2] * m2[1];
    tmp[1] = m1[1] * m2[0] + m1[3] * m2[1];
    tmp[2] = m1[0] * m2[2] + m1[2] * m2[3];
    tmp[3] = m1[1] * m2[2] + m1[3] * m2[3];
    tmp[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    tmp[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
    return tmp;
  };
  Utils.lineLineIntersection = function(p1, p2, p3, p4) {
    var x1 = p1.x,
        y1 = p1.y,
        x2 = p2.x,
        y2 = p2.y,
        x3 = p3.x,
        y3 = p3.y,
        x4 = p4.x,
        y4 = p4.y,
        d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d === 0) {
      return null;
    }
    return new Float32Array([((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d, ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d]);
  };
  var $__default = Utils;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJjbGFzc2VzL1V0aWxzLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsS0FBSyxBQUFDLElDQU4sVUFBUyxBQUFnQjs7QUNDekIsQUFBSSxJQUFBLENBQUEsS0FBSSxFQUFJLEdBQUMsQ0FBQztBQUVkLE1BQUksYUFBYSxFQUFJLFVBQVUsS0FBSSxDQUFHLENBQUEsS0FBSSxDQUFHLENBQUEsT0FBTTtBQUNsRCxBQUFJLE1BQUEsQ0FBQSxPQUFNO0FBQ1QsV0FBRyxFQUFJLENBQUEsS0FBSSxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUV4QixPQUFHLFFBQVEsQUFBQyxFQUFDLFNBQUEsSUFBRyxDQUFLO0FBRXBCLFNBQUssQ0FBQyxPQUFNLENBQUk7QUFDZixjQUFNLEVBQUksQ0FBQSxJQUFHLElBQU0sUUFBTSxDQUFBLENBQUksUUFBTSxFQUFJLE1BQUksQ0FBQztNQUM3QztBQUFBLEFBRUEsWUFBTSxFQUFJLENBQUEsT0FBTSxDQUFHLElBQUcsQ0FBRSxDQUFDO0lBQzFCLEVBQUMsQ0FBQztBQUVGLFNBQU8sUUFBTSxDQUFDO0VBQ2YsQ0FBQztBQUVELE1BQUksVUFBVSxFQUFJLFVBQVUsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFJO0FBQ3BDLFNBQU8sQ0FBQSxJQUFHLE1BQU0sQUFBQyxDQUFFLEVBQUMsRUFBRSxFQUFJLENBQUEsRUFBQyxFQUFFLENBQUcsQ0FBQSxFQUFDLEVBQUUsRUFBSSxDQUFBLEVBQUMsRUFBRSxDQUFFLENBQUM7RUFDOUMsQ0FBQztBQUVELE1BQUksZUFBZSxFQUFJLFVBQVUsTUFBSztBQUNyQyxPQUFLLE1BQUssWUFBWSxJQUFNLE9BQUssQ0FBQSxFQUFLLENBQUEsTUFBTyxPQUFLLFVBQVUsQ0FBQSxHQUFNLFNBQU8sQ0FBSTtBQUM1RSxBQUFJLFFBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxDQUFDLFVBQVMsQ0FBRyxVQUFRLENBQUcsZ0JBQWMsQ0FBRyxRQUFNLENBQUcsUUFBTSxDQUFDLE9BQzVELEFBQUMsQ0FBRSxNQUFLLFdBQVcsQ0FBRSxPQUNyQixBQUFDLENBQUUsU0FBUSxFQUFJLENBQUEsTUFBSyxVQUFVLENBQUUsQ0FBQztBQUV6QyxXQUFPLEVBQUUsTUFBSyxRQUFRLEVBQUksQ0FBQSxRQUFPLE1BQU0sQUFBQyxDQUFFLElBQUcsQ0FBRyxLQUFHLENBQUUsQ0FBRSxDQUFDO0lBQ3pEO0FBQUEsQUFFQSxPQUFLLE1BQUssWUFBWSxJQUFNLE9BQUssQ0FBSTtBQUNwQyxVQUFVLEdBQUEsQ0FBQSxDQUFBLENBQUEsRUFBSyxPQUFLLENBQUk7QUFDdkIsWUFBSSxlQUFlLEFBQUMsQ0FBRSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQztNQUNsQztBQUFBLElBQ0Q7QUFBQSxBQUVBLE9BQUssTUFBSyxZQUFZLElBQU0sTUFBSSxDQUFJO0FBQ25DLFdBQUssUUFBUSxBQUFDLEVBQUMsU0FBQSxTQUFRO2FBQUssQ0FBQSxLQUFJLGVBQWUsQUFBQyxDQUFFLFNBQVEsQ0FBRTtNQUFBLEVBQUMsQ0FBQztJQUMvRDtBQUFBLEVBQ0QsQ0FBQztBQUVELE1BQUksWUFBWSxFQUFJLFVBQVUsR0FBRSxDQUFHLENBQUEsR0FBRSxDQUFJO0FBQ3hDLFFBQVUsR0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFLLElBQUUsQ0FBSTtBQUNwQixTQUFLLE1BQU8sSUFBRSxDQUFFLENBQUEsQ0FBQyxDQUFBLEdBQU0sU0FBTyxDQUFJO0FBQ2pDLFVBQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEdBQUUsQ0FBRSxDQUFBLENBQUMsQ0FBQztNQUNoQjtBQUFBLElBQ0Q7QUFBQSxFQUNELENBQUM7QUFFRCxNQUFJLGNBQWMsRUFBSSxVQUFVLEVBQUMsQ0FBRyxDQUFBLEVBQUMsQ0FBRyxDQUFBLEdBQUUsQ0FBSTtBQUM3QyxPQUFLLENBQUMsR0FBRSxDQUFJO0FBQ1gsUUFBRSxFQUFJLElBQUksYUFBVyxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDMUI7QUFBQSxBQUdBLE1BQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RDLE1BQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RDLE1BQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RDLE1BQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RDLE1BQUUsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUMsTUFBRSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUU5QyxTQUFPLElBQUUsQ0FBQztFQUNYLENBQUM7QUFFRCxNQUFJLHFCQUFxQixFQUFJLFVBQVUsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFJO0FBQ3ZELEFBQUksTUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNYLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFNBQUMsRUFBSSxDQUFBLEVBQUMsRUFBRTtBQUNSLFFBQUEsRUFBSSxDQUFBLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQztBQUUxQyxPQUFLLENBQUEsSUFBTSxFQUFBLENBQUk7QUFDZCxXQUFPLEtBQUcsQ0FBQztJQUNaO0FBQUEsQUFFQSxTQUFPLElBQUksYUFBVyxBQUFDLENBQUMsQ0FDdkIsQ0FBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUEsQ0FBSSxDQUFBLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLEVBQUUsR0FBQyxDQUFBLENBQUksQ0FBQSxFQUFDLEVBQUUsR0FBQyxDQUFDLENBQUUsRUFBSSxFQUFBLENBQzVELENBQUEsQ0FBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUEsQ0FBSSxDQUFBLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLEVBQUUsR0FBQyxDQUFBLENBQUksQ0FBQSxFQUFDLEVBQUUsR0FBQyxDQUFDLENBQUUsRUFBSSxFQUFBLENBQzdELENBQUMsQ0FBQztFQUNILENBQUM7QUN0RkQsQUFBSSxJQUFBLENBQUEsVUFBUyxFRDBGRSxNQzFGa0IsQUQwRmQsQ0MxRmM7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0RGdUMsQ0FBQztBRTBGeEIiLCJmaWxlIjoiY2xhc3Nlcy9VdGlscy5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCIvL2ltcG9ydCBCZXppZXJVdGlscyBmcm9tICcuL2JlemllcnV0aWxzLmpzJztcbnZhciBVdGlscyA9IHt9O1xuXG5VdGlscy5wcm9wRnJvbVBhdGggPSBmdW5jdGlvbiggX3BhdGgsIGdseXBoLCBjb250b3VyICkge1xuXHR2YXIgY29udGV4dCxcblx0XHRwYXRoID0gX3BhdGguc3BsaXQoJy4nKTtcblxuXHRwYXRoLmZvckVhY2gobmFtZSA9PiB7XG5cdFx0Ly8gaW5pdCBjb250ZXh0IG9uIGZpcnN0IGl0ZXJhdGlvblxuXHRcdGlmICggIWNvbnRleHQgKSB7XG5cdFx0XHRjb250ZXh0ID0gbmFtZSA9PT0gJ25vZGVzJyA/IGNvbnRvdXIgOiBnbHlwaDtcblx0XHR9XG5cblx0XHRjb250ZXh0ID0gY29udGV4dFsgbmFtZSBdO1xuXHR9KTtcblxuXHRyZXR1cm4gY29udGV4dDtcbn07XG5cblV0aWxzLmxpbmVBbmdsZSA9IGZ1bmN0aW9uKCBwMCwgcDEgKSB7XG5cdHJldHVybiBNYXRoLmF0YW4yKCBwMS55IC0gcDAueSwgcDEueCAtIHAwLnggKTtcbn07XG5cblV0aWxzLmNyZWF0ZVVwZGF0ZXJzID0gZnVuY3Rpb24oIGJyYW5jaCApIHtcblx0aWYgKCBicmFuY2guY29uc3RydWN0b3IgPT09IE9iamVjdCAmJiB0eXBlb2YgYnJhbmNoLm9wZXJhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG5cdFx0dmFyIGFyZ3MgPSBbJ2NvbnRvdXJzJywgJ2FuY2hvcnMnLCAncGFyZW50QW5jaG9ycycsICdub2RlcycsICdVdGlscyddXG5cdFx0XHRcdC5jb25jYXQoIGJyYW5jaC5wYXJhbWV0ZXJzIClcblx0XHRcdFx0LmNvbmNhdCggJ3JldHVybiAnICsgYnJhbmNoLm9wZXJhdGlvbiApO1xuXG5cdFx0cmV0dXJuICggYnJhbmNoLnVwZGF0ZXIgPSBGdW5jdGlvbi5hcHBseSggbnVsbCwgYXJncyApICk7XG5cdH1cblxuXHRpZiAoIGJyYW5jaC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICkge1xuXHRcdGZvciAoIHZhciBpIGluIGJyYW5jaCApIHtcblx0XHRcdFV0aWxzLmNyZWF0ZVVwZGF0ZXJzKCBicmFuY2hbaV0gKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIGJyYW5jaC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgKSB7XG5cdFx0YnJhbmNoLmZvckVhY2goc3ViQnJhbmNoID0+IFV0aWxzLmNyZWF0ZVVwZGF0ZXJzKCBzdWJCcmFuY2ggKSk7XG5cdH1cbn07XG5cblV0aWxzLm1lcmdlU3RhdGljID0gZnVuY3Rpb24oIG9iaiwgc3JjICkge1xuXHRmb3IgKCB2YXIgaSBpbiBzcmMgKSB7XG5cdFx0aWYgKCB0eXBlb2Ygc3JjW2ldICE9PSAnb2JqZWN0JyApIHtcblx0XHRcdG9ialtpXSA9IHNyY1tpXTtcblx0XHR9XG5cdH1cbn07XG5cblV0aWxzLm1hdHJpeFByb2R1Y3QgPSBmdW5jdGlvbiggbTEsIG0yLCB0bXAgKSB7XG5cdGlmICggIXRtcCApIHtcblx0XHR0bXAgPSBuZXcgRmxvYXQzMkFycmF5KDYpO1xuXHR9XG5cblx0Ly8gTWF0cml4IHByb2R1Y3QgKGFycmF5IGluIGNvbHVtbi1tYWpvciBvcmRlcilcblx0dG1wWzBdID0gbTFbMF0gKiBtMlswXSArIG0xWzJdICogbTJbMV07XG5cdHRtcFsxXSA9IG0xWzFdICogbTJbMF0gKyBtMVszXSAqIG0yWzFdO1xuXHR0bXBbMl0gPSBtMVswXSAqIG0yWzJdICsgbTFbMl0gKiBtMlszXTtcblx0dG1wWzNdID0gbTFbMV0gKiBtMlsyXSArIG0xWzNdICogbTJbM107XG5cdHRtcFs0XSA9IG0xWzBdICogbTJbNF0gKyBtMVsyXSAqIG0yWzVdICsgbTFbNF07XG5cdHRtcFs1XSA9IG0xWzFdICogbTJbNF0gKyBtMVszXSAqIG0yWzVdICsgbTFbNV07XG5cblx0cmV0dXJuIHRtcDtcbn07XG5cblV0aWxzLmxpbmVMaW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oIHAxLCBwMiwgcDMsIHA0ICkge1xuXHR2YXIgeDEgPSBwMS54LFxuXHRcdHkxID0gcDEueSxcblx0XHR4MiA9IHAyLngsXG5cdFx0eTIgPSBwMi55LFxuXHRcdHgzID0gcDMueCxcblx0XHR5MyA9IHAzLnksXG5cdFx0eDQgPSBwNC54LFxuXHRcdHk0ID0gcDQueSxcblx0XHRkID0gKHgxLXgyKSAqICh5My15NCkgLSAoeTEteTIpICogKHgzLXg0KTtcblxuXHRpZiAoIGQgPT09IDAgKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXG5cdFx0KCAoeDEqeTIgLSB5MSp4MikgKiAoeDMteDQpIC0gKHgxLXgyKSAqICh4Myp5NCAtIHkzKng0KSApIC8gZCxcblx0XHQoICh4MSp5MiAtIHkxKngyKSAqICh5My15NCkgLSAoeTEteTIpICogKHgzKnk0IC0geTMqeDQpICkgLyBkXG5cdF0pO1xufTtcblxuLy9PYmplY3QubWl4aW4oIFV0aWxzLCBCZXppZXJVdGlscyApO1xuXG5leHBvcnQgZGVmYXVsdCBVdGlsczsiLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLCJfX2VzTW9kdWxlOiB0cnVlIl19;
define('classes/Node.js',['./Point.js', './Utils.js'], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Point = $__0.default;
  var Utils = $__2.default;
  function Node(args) {
    var coords;
    if (args && (args.x !== undefined || args.y !== undefined)) {
      coords = {
        x: args.x,
        y: args.y
      };
    }
    Point.prototype.constructor.apply(this, [coords]);
    this.lCtrl = new Point(args && args.lCtrl);
    this.lCtrl.tags.add('control');
    this.rCtrl = new Point(args && args.rCtrl);
    this.rCtrl.tags.add('control');
    if (args && args.src) {
      this.src = args && args.src;
      Utils.mergeStatic(this, args.src);
    }
  }
  Node.prototype = Object.create(Point.prototype);
  Node.prototype.constructor = Node;
  Node.prototype.transform = function(m, withCtrls) {
    var coords0 = this.coords[0];
    this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
    this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];
    if (withCtrls) {
      coords0 = this.lCtrl.coords[0];
      this.lCtrl.coords[0] = m[0] * coords0 + m[2] * this.lCtrl.coords[1] + m[4];
      this.lCtrl.coords[1] = m[1] * coords0 + m[3] * this.lCtrl.coords[1] + m[5];
      coords0 = this.rCtrl.coords[0];
      this.rCtrl.coords[0] = m[0] * coords0 + m[2] * this.rCtrl.coords[1] + m[4];
      this.rCtrl.coords[1] = m[1] * coords0 + m[3] * this.rCtrl.coords[1] + m[5];
    }
    return this;
  };
  Node.prototype.update = function(params, glyph, contour) {
    for (var i in this.src) {
      var attr = this.src[i];
      if (typeof attr === 'object' && attr.updater) {
        var args = [glyph.contours, glyph.anchors, glyph.parentAnchors, contour && contour.nodes, Utils];
        attr.parameters.forEach((function(name) {
          return args.push(params[name]);
        }));
        this[i] = attr.updater.apply({}, args);
      }
      if (i === 'onLine') {
        var knownCoord = this.src.x === undefined ? 'y' : 'x',
            p0 = Utils.propFromPath(this.src.onLine[0].dependencies[0], glyph, contour),
            p1 = Utils.propFromPath(this.src.onLine[1].dependencies[0], glyph, contour);
        this.onLine(knownCoord, p0, p1);
      }
      if (i === 'transform') {
        this.transform(attr, true);
      }
    }
  };
  var $__default = Node;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Ob2RlLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FZLFlBQVcsQ0FDWCxhQUFXLEVDRDdCLFVBQVMsU0FBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFBQSxJRkRwRCxNQUFJO0lBQ0osTUFBSTtBQUVYLFNBQVMsS0FBRyxDQUFHLElBQUcsQ0FBSTtBQUNyQixBQUFJLE1BQUEsQ0FBQSxNQUFLLENBQUM7QUFDVixPQUFLLElBQUcsR0FBSyxFQUFFLElBQUcsRUFBRSxJQUFNLFVBQVEsQ0FBQSxFQUFLLENBQUEsSUFBRyxFQUFFLElBQU0sVUFBUSxDQUFFLENBQUk7QUFDL0QsV0FBSyxFQUFJO0FBQ1IsUUFBQSxDQUFHLENBQUEsSUFBRyxFQUFFO0FBQ1IsUUFBQSxDQUFHLENBQUEsSUFBRyxFQUFFO0FBQUEsTUFDVCxDQUFDO0lBQ0Y7QUFBQSxBQUVBLFFBQUksVUFBVSxZQUFZLE1BQU0sQUFBQyxDQUFFLElBQUcsQ0FBRyxFQUFFLE1BQUssQ0FBRSxDQUFFLENBQUM7QUFFckQsT0FBRyxNQUFNLEVBQUksSUFBSSxNQUFJLEFBQUMsQ0FBRSxJQUFHLEdBQUssQ0FBQSxJQUFHLE1BQU0sQ0FBRSxDQUFDO0FBQzVDLE9BQUcsTUFBTSxLQUFLLElBQUksQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO0FBRTlCLE9BQUcsTUFBTSxFQUFJLElBQUksTUFBSSxBQUFDLENBQUUsSUFBRyxHQUFLLENBQUEsSUFBRyxNQUFNLENBQUUsQ0FBQztBQUM1QyxPQUFHLE1BQU0sS0FBSyxJQUFJLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztBQUU5QixPQUFLLElBQUcsR0FBSyxDQUFBLElBQUcsSUFBSSxDQUFJO0FBQ3ZCLFNBQUcsSUFBSSxFQUFJLENBQUEsSUFBRyxHQUFLLENBQUEsSUFBRyxJQUFJLENBQUM7QUFDM0IsVUFBSSxZQUFZLEFBQUMsQ0FBRSxJQUFHLENBQUcsQ0FBQSxJQUFHLElBQUksQ0FBRSxDQUFDO0lBQ3BDO0FBQUEsRUFDRDtBQUFBLEFBRUEsS0FBRyxVQUFVLEVBQUksQ0FBQSxNQUFLLE9BQU8sQUFBQyxDQUFDLEtBQUksVUFBVSxDQUFDLENBQUM7QUFDL0MsS0FBRyxVQUFVLFlBQVksRUFBSSxLQUFHLENBQUM7QUFFakMsS0FBRyxVQUFVLFVBQVUsRUFBSSxVQUFVLENBQUEsQ0FBRyxDQUFBLFNBQVEsQ0FBSTtBQUNuRCxBQUFJLE1BQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUM1QixPQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsT0FBTyxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUQsT0FBRyxPQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksUUFBTSxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRTlELE9BQUssU0FBUSxDQUFJO0FBQ2hCLFlBQU0sRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUIsU0FBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUMxRSxTQUFHLE1BQU0sT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLFFBQU0sQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsSUFBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRTFFLFlBQU0sRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUIsU0FBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUMxRSxTQUFHLE1BQU0sT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLFFBQU0sQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsSUFBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0lBQzNFO0FBQUEsQUFFQSxTQUFPLEtBQUcsQ0FBQztFQUNaLENBQUM7QUFFRCxLQUFHLFVBQVUsT0FBTyxFQUFJLFVBQVUsTUFBSyxDQUFHLENBQUEsS0FBSSxDQUFHLENBQUEsT0FBTTtBQUN0RCxRQUFVLEdBQUEsQ0FBQSxDQUFBLENBQUEsRUFBSyxDQUFBLElBQUcsSUFBSSxDQUFJO0FBQ3pCLEFBQUksUUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLElBQUcsSUFBSSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRXRCLFNBQUssTUFBTyxLQUFHLENBQUEsR0FBTSxTQUFPLENBQUEsRUFBSyxDQUFBLElBQUcsUUFBUSxDQUFJO0FBQy9DLEFBQUksVUFBQSxDQUFBLElBQUcsRUFBSSxFQUFFLEtBQUksU0FBUyxDQUFHLENBQUEsS0FBSSxRQUFRLENBQUcsQ0FBQSxLQUFJLGNBQWMsQ0FBRyxDQUFBLE9BQU0sR0FBSyxDQUFBLE9BQU0sTUFBTSxDQUFHLE1BQUksQ0FBRSxDQUFDO0FBQ2xHLFdBQUcsV0FBVyxRQUFRLEFBQUMsRUFBQyxTQUFBLElBQUc7ZUFBSyxDQUFBLElBQUcsS0FBSyxBQUFDLENBQUUsTUFBSyxDQUFFLElBQUcsQ0FBQyxDQUFFO1FBQUEsRUFBRSxDQUFDO0FBQzNELFdBQUcsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsUUFBUSxNQUFNLEFBQUMsQ0FBRSxFQUFDLENBQUcsS0FBRyxDQUFFLENBQUM7TUFDekM7QUFBQSxBQUVBLFNBQUssQ0FBQSxJQUFNLFNBQU8sQ0FBSTtBQUNyQixBQUFJLFVBQUEsQ0FBQSxVQUFTLEVBQUksQ0FBQSxJQUFHLElBQUksRUFBRSxJQUFNLFVBQVEsQ0FBQSxDQUFJLElBQUUsRUFBSSxJQUFFO0FBQ25ELGFBQUMsRUFBSSxDQUFBLEtBQUksYUFBYSxBQUFDLENBQUUsSUFBRyxJQUFJLE9BQU8sQ0FBRSxDQUFBLENBQUMsYUFBYSxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBRyxRQUFNLENBQUU7QUFDNUUsYUFBQyxFQUFJLENBQUEsS0FBSSxhQUFhLEFBQUMsQ0FBRSxJQUFHLElBQUksT0FBTyxDQUFFLENBQUEsQ0FBQyxhQUFhLENBQUUsQ0FBQSxDQUFDLENBQUcsTUFBSSxDQUFHLFFBQU0sQ0FBRSxDQUFDO0FBRTlFLFdBQUcsT0FBTyxBQUFDLENBQUUsVUFBUyxDQUFHLEdBQUMsQ0FBRyxHQUFDLENBQUUsQ0FBQztNQUNsQztBQUFBLEFBRUEsU0FBSyxDQUFBLElBQU0sWUFBVSxDQUFJO0FBQ3hCLFdBQUcsVUFBVSxBQUFDLENBQUUsSUFBRyxDQUFHLEtBQUcsQ0FBRSxDQUFDO01BQzdCO0FBQUEsSUFDRDtBQUFBLEVBQ0QsQ0FBQztBR3JFRCxBQUFJLElBQUEsQ0FBQSxVQUFTLEVIdUVFLEtHdkVrQixBSHVFZixDR3ZFZTtBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDdUV6QiIsImZpbGUiOiJjbGFzc2VzL05vZGUuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi9Qb2ludC5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XG5cbmZ1bmN0aW9uIE5vZGUoIGFyZ3MgKSB7XG5cdHZhciBjb29yZHM7XG5cdGlmICggYXJncyAmJiAoIGFyZ3MueCAhPT0gdW5kZWZpbmVkIHx8IGFyZ3MueSAhPT0gdW5kZWZpbmVkICkgKSB7XG5cdFx0Y29vcmRzID0ge1xuXHRcdFx0eDogYXJncy54LFxuXHRcdFx0eTogYXJncy55XG5cdFx0fTtcblx0fVxuXG5cdFBvaW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSggdGhpcywgWyBjb29yZHMgXSApO1xuXG5cdHRoaXMubEN0cmwgPSBuZXcgUG9pbnQoIGFyZ3MgJiYgYXJncy5sQ3RybCApO1xuXHR0aGlzLmxDdHJsLnRhZ3MuYWRkKCdjb250cm9sJyk7XG5cblx0dGhpcy5yQ3RybCA9IG5ldyBQb2ludCggYXJncyAmJiBhcmdzLnJDdHJsICk7XG5cdHRoaXMuckN0cmwudGFncy5hZGQoJ2NvbnRyb2wnKTtcblxuXHRpZiAoIGFyZ3MgJiYgYXJncy5zcmMgKSB7XG5cdFx0dGhpcy5zcmMgPSBhcmdzICYmIGFyZ3Muc3JjO1xuXHRcdFV0aWxzLm1lcmdlU3RhdGljKCB0aGlzLCBhcmdzLnNyYyApO1xuXHR9XG59XG5cbk5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQb2ludC5wcm90b3R5cGUpO1xuTm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb2RlO1xuXG5Ob2RlLnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbiggbSwgd2l0aEN0cmxzICkge1xuXHR2YXIgY29vcmRzMCA9IHRoaXMuY29vcmRzWzBdO1xuXHR0aGlzLmNvb3Jkc1swXSA9IG1bMF0gKiBjb29yZHMwICsgbVsyXSAqIHRoaXMuY29vcmRzWzFdICsgbVs0XTtcblx0dGhpcy5jb29yZHNbMV0gPSBtWzFdICogY29vcmRzMCArIG1bM10gKiB0aGlzLmNvb3Jkc1sxXSArIG1bNV07XG5cblx0aWYgKCB3aXRoQ3RybHMgKSB7XG5cdFx0Y29vcmRzMCA9IHRoaXMubEN0cmwuY29vcmRzWzBdO1xuXHRcdHRoaXMubEN0cmwuY29vcmRzWzBdID0gbVswXSAqIGNvb3JkczAgKyBtWzJdICogdGhpcy5sQ3RybC5jb29yZHNbMV0gKyBtWzRdO1xuXHRcdHRoaXMubEN0cmwuY29vcmRzWzFdID0gbVsxXSAqIGNvb3JkczAgKyBtWzNdICogdGhpcy5sQ3RybC5jb29yZHNbMV0gKyBtWzVdO1xuXG5cdFx0Y29vcmRzMCA9IHRoaXMuckN0cmwuY29vcmRzWzBdO1xuXHRcdHRoaXMuckN0cmwuY29vcmRzWzBdID0gbVswXSAqIGNvb3JkczAgKyBtWzJdICogdGhpcy5yQ3RybC5jb29yZHNbMV0gKyBtWzRdO1xuXHRcdHRoaXMuckN0cmwuY29vcmRzWzFdID0gbVsxXSAqIGNvb3JkczAgKyBtWzNdICogdGhpcy5yQ3RybC5jb29yZHNbMV0gKyBtWzVdO1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiggcGFyYW1zLCBnbHlwaCwgY29udG91ciApIHtcblx0Zm9yICggdmFyIGkgaW4gdGhpcy5zcmMgKSB7XG5cdFx0dmFyIGF0dHIgPSB0aGlzLnNyY1tpXTtcblxuXHRcdGlmICggdHlwZW9mIGF0dHIgPT09ICdvYmplY3QnICYmIGF0dHIudXBkYXRlciApIHtcblx0XHRcdHZhciBhcmdzID0gWyBnbHlwaC5jb250b3VycywgZ2x5cGguYW5jaG9ycywgZ2x5cGgucGFyZW50QW5jaG9ycywgY29udG91ciAmJiBjb250b3VyLm5vZGVzLCBVdGlscyBdO1xuXHRcdFx0YXR0ci5wYXJhbWV0ZXJzLmZvckVhY2gobmFtZSA9PiBhcmdzLnB1c2goIHBhcmFtc1tuYW1lXSApICk7XG5cdFx0XHR0aGlzW2ldID0gYXR0ci51cGRhdGVyLmFwcGx5KCB7fSwgYXJncyApO1xuXHRcdH1cblxuXHRcdGlmICggaSA9PT0gJ29uTGluZScgKSB7XG5cdFx0XHR2YXIga25vd25Db29yZCA9IHRoaXMuc3JjLnggPT09IHVuZGVmaW5lZCA/ICd5JyA6ICd4Jyxcblx0XHRcdFx0cDAgPSBVdGlscy5wcm9wRnJvbVBhdGgoIHRoaXMuc3JjLm9uTGluZVswXS5kZXBlbmRlbmNpZXNbMF0sIGdseXBoLCBjb250b3VyICksXG5cdFx0XHRcdHAxID0gVXRpbHMucHJvcEZyb21QYXRoKCB0aGlzLnNyYy5vbkxpbmVbMV0uZGVwZW5kZW5jaWVzWzBdLCBnbHlwaCwgY29udG91ciApO1xuXG5cdFx0XHR0aGlzLm9uTGluZSgga25vd25Db29yZCwgcDAsIHAxICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBpID09PSAndHJhbnNmb3JtJyApIHtcblx0XHRcdHRoaXMudHJhbnNmb3JtKCBhdHRyLCB0cnVlICk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBOb2RlOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Segment.js',[], function() {
  
  function Segment(start, end) {
    this.start = start;
    this.end = end;
    this.lCtrl = this.start.lCtrl;
    this.rCtrl = this.end.rCtrl;
  }
  Segment.prototype.toString = function() {
    return ['C', this.lCtrl, this.rCtrl, this.end].join(' ');
  };
  var $__default = Segment;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJjbGFzc2VzL1NlZ21lbnQuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsSUNBTixVQUFTLEFBQWdCOztBQ0F6QixTQUFTLFFBQU0sQ0FBRyxLQUFJLENBQUcsQ0FBQSxHQUFFLENBQUk7QUFDOUIsT0FBRyxNQUFNLEVBQUksTUFBSSxDQUFDO0FBQ2xCLE9BQUcsSUFBSSxFQUFJLElBQUUsQ0FBQztBQUNkLE9BQUcsTUFBTSxFQUFJLENBQUEsSUFBRyxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFHLE1BQU0sRUFBSSxDQUFBLElBQUcsSUFBSSxNQUFNLENBQUM7RUFDNUI7QUFBQSxBQUVBLFFBQU0sVUFBVSxTQUFTLEVBQUksVUFBUSxBQUFDLENBQUU7QUFDdkMsU0FBTyxDQUFBLENBQ04sR0FBRSxDQUNGLENBQUEsSUFBRyxNQUFNLENBQ1QsQ0FBQSxJQUFHLE1BQU0sQ0FDVCxDQUFBLElBQUcsSUFBSSxDQUNSLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0VBQ1osQ0FBQztBQ2RELEFBQUksSUFBQSxDQUFBLFVBQVMsRURnQkUsUUNoQmtCLEFEZ0JaLENDaEJZO0FDQWpDO0FDQUEsZ0JBQXdCO0FBQUUsdUJBQXdCO0lBQUU7QUNBcEQsYUFBUyxDQUFHLEtBQUc7QUFBQSxHRkFRO0FIRW5CLENERnVDLENBQUM7QUVnQnRCIiwiZmlsZSI6ImNsYXNzZXMvU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJmdW5jdGlvbiBTZWdtZW50KCBzdGFydCwgZW5kICkge1xuXHR0aGlzLnN0YXJ0ID0gc3RhcnQ7XG5cdHRoaXMuZW5kID0gZW5kO1xuXHR0aGlzLmxDdHJsID0gdGhpcy5zdGFydC5sQ3RybDtcblx0dGhpcy5yQ3RybCA9IHRoaXMuZW5kLnJDdHJsO1xufVxuXG5TZWdtZW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gW1xuXHRcdCdDJyxcblx0XHR0aGlzLmxDdHJsLFxuXHRcdHRoaXMuckN0cmwsXG5cdFx0dGhpcy5lbmRcblx0XS5qb2luKCcgJyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50OyIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=;
define('classes/Contour.js',['./Classify.js', './Node.js', './Segment.js', './Utils.js'], function($__0,$__2,$__4,$__6) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Classify = $__0.default;
  var Node = $__2.default;
  var Segment = $__4.default;
  var Utils = $__6.default;
  function Contour(args) {
    Classify.prototype.constructor.apply(this);
    this.nodes = [];
    if (args && args.src) {
      this.src = args.src;
      this.fromSrc(args.src);
      Utils.mergeStatic(this, args.src);
    }
  }
  Contour.prototype = Object.create(Classify.prototype);
  Contour.prototype.constructor = Contour;
  Contour.prototype.fromSrc = function(contourSrc) {
    var $__8 = this;
    contourSrc.point.forEach((function(pointSrc) {
      $__8.addNode({src: pointSrc});
    }));
  };
  Contour.prototype.addNode = function(args) {
    var node = args.constructor === Node ? args : new Node(args);
    this.nodes.push(node);
    return node;
  };
  Contour.prototype.transform = function(m, withControls) {
    this.nodes.forEach((function(node) {
      return node.transform(m, withControls);
    }));
    return this;
  };
  Contour.prototype.toSVG = function() {
    var path = [],
        nodes = this.nodes,
        firstNode = this.nodes[0],
        lastNode = this.nodes[this.nodes.length - 1];
    nodes.forEach(function(node, i) {
      if (i === 0) {
        path.push('M');
      } else {
        path.push('C', nodes[i - 1].lCtrl, node.rCtrl);
      }
      path.push(node);
    });
    if (this.type !== 'open') {
      path.push('C', lastNode.lCtrl, firstNode.rCtrl, firstNode, 'Z');
    }
    this.pathData = path.join(' ');
    return this.pathData;
  };
  Contour.prototype.toOT = function(path) {
    var nodes = this.nodes,
        firstNode = this.nodes[0],
        lastNode = this.nodes[this.nodes.length - 1];
    nodes.forEach(function(node, i) {
      if (i === 0) {
        path.commands.push({
          type: 'M',
          x: Math.round(node.x) || 0,
          y: Math.round(node.y) || 0
        });
      } else {
        path.commands.push({
          type: 'C',
          x1: Math.round(nodes[i - 1].lCtrl.x) || 0,
          y1: Math.round(nodes[i - 1].lCtrl.y) || 0,
          x2: Math.round(node.rCtrl.x) || 0,
          y2: Math.round(node.rCtrl.y) || 0,
          x: Math.round(node.x) || 0,
          y: Math.round(node.y) || 0
        });
      }
    });
    if (this.type !== 'open') {
      path.commands.push({
        type: 'C',
        x1: Math.round(lastNode.lCtrl.x) || 0,
        y1: Math.round(lastNode.lCtrl.y) || 0,
        x2: Math.round(firstNode.rCtrl.x) || 0,
        y2: Math.round(firstNode.rCtrl.y) || 0,
        x: Math.round(firstNode.x) || 0,
        y: Math.round(firstNode.y) || 0
      });
    }
    return path;
  };
  Contour.prototype.update = function(params, glyph) {
    var $__8 = this;
    this.nodes.forEach((function(node) {
      return node.update(params, glyph, $__8);
    }));
    if (this.src && this.src.transform) {
      this.transform(this.src.transform, true);
    }
    this.toSVG();
  };
  Object.defineProperty(Contour.prototype, 'segments', {get: function() {
      var segments = [],
          length = this.nodes.length,
          i = -1;
      while (++i < length - 1) {
        segments.push(new Segment(this.nodes[i], this.nodes[i + 1]));
      }
      if (this.type === 'closed') {
        segments.push(new Segment(this.nodes[length - 1], this.nodes[0]));
      }
      return segments;
    }});
  var $__default = Contour;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Db250b3VyLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FlLGVBQWMsQ0FDbEIsWUFBVSxDQUNQLGVBQWEsQ0FDZixhQUFXLEVDSDdCLFVBQVMsbUJBQWdCOztBQ0F6QixLQUFJLEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBQUEsSUZEcEQsU0FBTztJQUNQLEtBQUc7SUFDSCxRQUFNO0lBQ04sTUFBSTtBQUVYLFNBQVMsUUFBTSxDQUFHLElBQUcsQ0FBSTtBQUN4QixXQUFPLFVBQVUsWUFBWSxNQUFNLEFBQUMsQ0FBRSxJQUFHLENBQUUsQ0FBQztBQUU1QyxPQUFHLE1BQU0sRUFBSSxHQUFDLENBQUM7QUFFZixPQUFLLElBQUcsR0FBSyxDQUFBLElB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QUcsQ0FBRSxDQUFDO0lBQzNDO0FBQUEsQUFFQSxPQUFHLE1BQU0sQUFBQyxFQUFDLENBQUM7RUFDYixDQUFDO0FBR0QsT0FBSyxlQUFlLEFBQUMsQ0FBQyxPQUFNLFVBQVUsQ0FBRyxXQUFTLENBQUcsRUFDcEQsR0FBRSxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ2YsQUFBSSxRQUFBLENBQUEsUUFBTyxFQUFJLEdBQUM7QUFDZixlQUFLLEVBQUksQ0FBQSxJQUFHLE1BQU0sT0FBTztBQUN6QixVQUFBLEVBQUksRUFBQyxDQUFBLENBQUM7QUFFUCxZQUFRLEVBQUUsQ0FBQSxDQUFBLENBQUksQ0FBQSxNQUFLLEVBQUksRUFBQSxDQUFJO0FBQzFCLGVBQU8sS0FBSyxBQUFDLENBQUUsR0FBSSxRQUFNLEFBQUMsQ0FBQyxJQUFHLE1BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUEsRUFBRSxFQUFBLENBQUMsQ0FBQyxDQUFFLENBQUM7TUFDN0Q7QUFBQSxBQUVBLFNBQUssSUFBRyxLQUFLLElBQU0sU0FBTyxDQUFJO0FBQzdCLGVBQU8sS0FBSyxBQUFDLENBQUUsR0FBSSxRQUFNLEFBQUMsQ0FBQyxJQUFHLE1BQU0sQ0FBRSxNQUFLLEVBQUcsRUFBQSxDQUFDLENBQUcsQ0FBQSxJQUFHLE1BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFFLENBQUM7TUFDbkU7QUFBQSxBQUVBLFdBQU8sU0FBTyxDQUFDO0lBQ2hCLENBQ0QsQ0FBQyxDQUFDO0FHdkpGLEFBQUksSUFBQSxDQUFBLFVBQVMsRUh5SkUsUUd6SmtCLEFIeUpaLENHekpZO0FDQWpDO0FDQUEsZ0JBQXdCO0FBQUUsdUJBQXdCO0lBQUU7QUNBcEQsYUFBUyxDQUFHLEtBQUc7QUFBQSxHRkFRO0FIRW5CLENGRnVDLENBQUM7QUN5SnRCIiwiZmlsZSI6ImNsYXNzZXMvQ29udG91ci5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImltcG9ydCBDbGFzc2lmeSBmcm9tICcuL0NsYXNzaWZ5LmpzJztcbmltcG9ydCBOb2RlIGZyb20gJy4vTm9kZS5qcyc7XG5pbXBvcnQgU2VnbWVudCBmcm9tICcuL1NlZ21lbnQuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuXG5mdW5jdGlvbiBDb250b3VyKCBhcmdzICkge1xuXHRDbGFzc2lmeS5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkoIHRoaXMgKTtcblxuXHR0aGlzLm5vZGVzID0gW107XG5cblx0aWYgKCBhcmdzICYmIGFyZ3Muc3JjICkge1xuXHRcdHRoaXMuc3JjID0gYXJncy5zcmM7XG5cdFx0dGhpcy5mcm9tU3JjKCBhcmdzLnNyYyApO1xuXHRcdFV0aWxzLm1lcmdlU3RhdGljKCB0aGlzLCBhcmdzLnNyYyApO1xuXHR9XG59XG5cbkNvbnRvdXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzc2lmeS5wcm90b3R5cGUpO1xuQ29udG91ci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250b3VyO1xuXG5Db250b3VyLnByb3RvdHlwZS5mcm9tU3JjID0gZnVuY3Rpb24oIGNvbnRvdXJTcmMgKSB7XG5cdGNvbnRvdXJTcmMucG9pbnQuZm9yRWFjaChwb2ludFNyYyA9PiB7XG5cdFx0dGhpcy5hZGROb2RlKHsgc3JjOiBwb2ludFNyYyB9KTtcblx0fSk7XG59O1xuXG5Db250b3VyLnByb3RvdHlwZS5hZGROb2RlID0gZnVuY3Rpb24oIGFyZ3MgKSB7XG5cdHZhciBub2RlID0gYXJncy5jb25zdHJ1Y3RvciA9PT0gTm9kZSA/XG5cdFx0XHRhcmdzOlxuXHRcdFx0bmV3IE5vZGUoIGFyZ3MgKTtcblxuXHR0aGlzLm5vZGVzLnB1c2goIG5vZGUgKTtcblxuXHRyZXR1cm4gbm9kZTtcbn07XG5cbkNvbnRvdXIucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKCBtLCB3aXRoQ29udHJvbHMgKSB7XG5cdHRoaXMubm9kZXMuZm9yRWFjaChub2RlID0+IG5vZGUudHJhbnNmb3JtKG0sIHdpdGhDb250cm9scykpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuQ29udG91ci5wcm90b3R5cGUudG9TVkcgPSBmdW5jdGlvbigpIHtcblx0dmFyIHBhdGggPSBbXSxcblx0XHRub2RlcyA9IHRoaXMubm9kZXMsXG5cdFx0Zmlyc3ROb2RlID0gdGhpcy5ub2Rlc1swXSxcblx0XHRsYXN0Tm9kZSA9IHRoaXMubm9kZXNbdGhpcy5ub2Rlcy5sZW5ndGggLSAxXTtcblxuXHRub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKCBub2RlLCBpICkge1xuXHRcdC8vIGFkZCBsZXR0ZXJcblx0XHRpZiAoIGkgPT09IDAgKSB7XG5cdFx0XHRwYXRoLnB1c2goJ00nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGF0aC5wdXNoKFxuXHRcdFx0XHQnQycsXG5cdFx0XHRcdG5vZGVzW2ktMV0ubEN0cmwsXG5cdFx0XHRcdG5vZGUuckN0cmxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIG5vZGUgY29vcmRpbmF0ZXNcblx0XHRwYXRoLnB1c2gobm9kZSk7XG5cblx0fSk7XG5cblx0Ly8gY3ljbGVcblx0aWYgKCB0aGlzLnR5cGUgIT09ICdvcGVuJyApIHtcblx0XHRwYXRoLnB1c2goXG5cdFx0XHQnQycsXG5cdFx0XHRsYXN0Tm9kZS5sQ3RybCxcblx0XHRcdGZpcnN0Tm9kZS5yQ3RybCxcblx0XHRcdGZpcnN0Tm9kZSxcblx0XHRcdCdaJ1xuXHRcdCk7XG5cdH1cblxuXHR0aGlzLnBhdGhEYXRhID0gcGF0aC5qb2luKCcgJyk7XG5cblx0cmV0dXJuIHRoaXMucGF0aERhdGE7XG59O1xuXG5Db250b3VyLnByb3RvdHlwZS50b09UID0gZnVuY3Rpb24ocGF0aCkge1xuXHR2YXIgbm9kZXMgPSB0aGlzLm5vZGVzLFxuXHRcdGZpcnN0Tm9kZSA9IHRoaXMubm9kZXNbMF0sXG5cdFx0bGFzdE5vZGUgPSB0aGlzLm5vZGVzW3RoaXMubm9kZXMubGVuZ3RoIC0gMV07XG5cblx0bm9kZXMuZm9yRWFjaChmdW5jdGlvbiggbm9kZSwgaSApIHtcblx0XHQvLyBhZGQgbGV0dGVyXG5cdFx0aWYgKCBpID09PSAwICkge1xuXHRcdFx0cGF0aC5jb21tYW5kcy5wdXNoKHtcblx0XHRcdFx0dHlwZTogJ00nLFxuXHRcdFx0XHR4OiBNYXRoLnJvdW5kKCBub2RlLnggKSB8fCAwLFxuXHRcdFx0XHR5OiBNYXRoLnJvdW5kKCBub2RlLnkgKSB8fCAwXG5cdFx0XHR9KTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXRoLmNvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHR0eXBlOiAnQycsXG5cdFx0XHRcdHgxOiBNYXRoLnJvdW5kKCBub2Rlc1tpLTFdLmxDdHJsLnggKSB8fCAwLFxuXHRcdFx0XHR5MTogTWF0aC5yb3VuZCggbm9kZXNbaS0xXS5sQ3RybC55ICkgfHwgMCxcblx0XHRcdFx0eDI6IE1hdGgucm91bmQoIG5vZGUuckN0cmwueCApIHx8IDAsXG5cdFx0XHRcdHkyOiBNYXRoLnJvdW5kKCBub2RlLnJDdHJsLnkgKSB8fCAwLFxuXHRcdFx0XHR4OiBNYXRoLnJvdW5kKCBub2RlLnggKSB8fCAwLFxuXHRcdFx0XHR5OiBNYXRoLnJvdW5kKCBub2RlLnkgKSB8fCAwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGN5Y2xlXG5cdGlmICggdGhpcy50eXBlICE9PSAnb3BlbicgKSB7XG5cdFx0cGF0aC5jb21tYW5kcy5wdXNoKHtcblx0XHRcdHR5cGU6ICdDJyxcblx0XHRcdHgxOiBNYXRoLnJvdW5kKCBsYXN0Tm9kZS5sQ3RybC54ICkgfHwgMCxcblx0XHRcdHkxOiBNYXRoLnJvdW5kKCBsYXN0Tm9kZS5sQ3RybC55ICkgfHwgMCxcblx0XHRcdHgyOiBNYXRoLnJvdW5kKCBmaXJzdE5vZGUuckN0cmwueCApIHx8IDAsXG5cdFx0XHR5MjogTWF0aC5yb3VuZCggZmlyc3ROb2RlLnJDdHJsLnkgKSB8fCAwLFxuXHRcdFx0eDogTWF0aC5yb3VuZCggZmlyc3ROb2RlLnggKSB8fCAwLFxuXHRcdFx0eTogTWF0aC5yb3VuZCggZmlyc3ROb2RlLnkgKSB8fCAwXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gcGF0aDtcbn07XG5cbkNvbnRvdXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCBwYXJhbXMsIGdseXBoICkge1xuXHR0aGlzLm5vZGVzLmZvckVhY2gobm9kZSA9PiBub2RlLnVwZGF0ZSggcGFyYW1zLCBnbHlwaCwgdGhpcyApKTtcblxuXHRpZiAoIHRoaXMuc3JjICYmIHRoaXMuc3JjLnRyYW5zZm9ybSApIHtcblx0XHR0aGlzLnRyYW5zZm9ybSggdGhpcy5zcmMudHJhbnNmb3JtLCB0cnVlICk7XG5cdH1cblxuXHR0aGlzLnRvU1ZHKCk7XG59O1xuXG4vLyBGb3Igbm93IHdlJ3JlIGp1c3QgZ29pbmcgdG8gcmVidWlsZCB0aGUgc2VnbWVudHMgYXJyYXkgb24gZWFjaCB1c2Vcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb250b3VyLnByb3RvdHlwZSwgJ3NlZ21lbnRzJywge1xuXHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWdtZW50cyA9IFtdLFxuXHRcdFx0bGVuZ3RoID0gdGhpcy5ub2Rlcy5sZW5ndGgsXG5cdFx0XHRpID0gLTE7XG5cblx0XHR3aGlsZSAoICsraSA8IGxlbmd0aCAtIDEgKSB7XG5cdFx0XHRzZWdtZW50cy5wdXNoKCBuZXcgU2VnbWVudCh0aGlzLm5vZGVzW2ldLCB0aGlzLm5vZGVzW2krMV0pICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnR5cGUgPT09ICdjbG9zZWQnICkge1xuXHRcdFx0c2VnbWVudHMucHVzaCggbmV3IFNlZ21lbnQodGhpcy5ub2Rlc1tsZW5ndGggLTFdLCB0aGlzLm5vZGVzWzBdKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBzZWdtZW50cztcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbnRvdXI7IiwiZnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIHtcbiAgICAgICRfX3BsYWNlaG9sZGVyX18xXG4gICAgfSIsImlmICghJF9fcGxhY2Vob2xkZXJfXzAgfHwgISRfX3BsYWNlaG9sZGVyX18xLl9fZXNNb2R1bGUpXG4gICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA9IHtkZWZhdWx0OiAkX19wbGFjZWhvbGRlcl9fM30iLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLCJfX2VzTW9kdWxlOiB0cnVlIl19;
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define('bower_components/opentype.js/dist/opentype.js',[],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.opentype=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Run-time checking of preconditions.



// Precondition function that checks if the given predicate is true.
// If not, it will throw an error.
exports.argument = function (predicate, message) {
    if (!predicate) {
        throw new Error(message);
    }
};

// Precondition function that checks if the given assertion is true.
// If not, it will throw an error.
exports.assert = exports.argument;

},{}],2:[function(require,module,exports){
// Drawing utility functions.



// Draw a line on the given context from point `x1,y1` to point `x2,y2`.
function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

exports.line = line;

},{}],3:[function(require,module,exports){
// Glyph encoding



var cffStandardStrings = [
    '.notdef', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'exclamdown', 'cent', 'sterling',
    'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle', 'quotedblleft', 'guillemotleft',
    'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'endash', 'dagger', 'daggerdbl', 'periodcentered', 'paragraph',
    'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright', 'guillemotright', 'ellipsis', 'perthousand',
    'questiondown', 'grave', 'acute', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'dieresis', 'ring',
    'cedilla', 'hungarumlaut', 'ogonek', 'caron', 'emdash', 'AE', 'ordfeminine', 'Lslash', 'Oslash', 'OE',
    'ordmasculine', 'ae', 'dotlessi', 'lslash', 'oslash', 'oe', 'germandbls', 'onesuperior', 'logicalnot', 'mu',
    'trademark', 'Eth', 'onehalf', 'plusminus', 'Thorn', 'onequarter', 'divide', 'brokenbar', 'degree', 'thorn',
    'threequarters', 'twosuperior', 'registered', 'minus', 'eth', 'multiply', 'threesuperior', 'copyright',
    'Aacute', 'Acircumflex', 'Adieresis', 'Agrave', 'Aring', 'Atilde', 'Ccedilla', 'Eacute', 'Ecircumflex',
    'Edieresis', 'Egrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Igrave', 'Ntilde', 'Oacute', 'Ocircumflex',
    'Odieresis', 'Ograve', 'Otilde', 'Scaron', 'Uacute', 'Ucircumflex', 'Udieresis', 'Ugrave', 'Yacute',
    'Ydieresis', 'Zcaron', 'aacute', 'acircumflex', 'adieresis', 'agrave', 'aring', 'atilde', 'ccedilla', 'eacute',
    'ecircumflex', 'edieresis', 'egrave', 'iacute', 'icircumflex', 'idieresis', 'igrave', 'ntilde', 'oacute',
    'ocircumflex', 'odieresis', 'ograve', 'otilde', 'scaron', 'uacute', 'ucircumflex', 'udieresis', 'ugrave',
    'yacute', 'ydieresis', 'zcaron', 'exclamsmall', 'Hungarumlautsmall', 'dollaroldstyle', 'dollarsuperior',
    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', '266 ff', 'onedotenleader',
    'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle', 'fouroldstyle', 'fiveoldstyle', 'sixoldstyle',
    'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'commasuperior', 'threequartersemdash', 'periodsuperior',
    'questionsmall', 'asuperior', 'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', 'isuperior', 'lsuperior',
    'msuperior', 'nsuperior', 'osuperior', 'rsuperior', 'ssuperior', 'tsuperior', 'ff', 'ffi', 'ffl',
    'parenleftinferior', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', 'exclamdownsmall',
    'centoldstyle', 'Lslashsmall', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall', 'Brevesmall', 'Caronsmall',
    'Dotaccentsmall', 'Macronsmall', 'figuredash', 'hypheninferior', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall',
    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds',
    'zerosuperior', 'foursuperior', 'fivesuperior', 'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior',
    'zeroinferior', 'oneinferior', 'twoinferior', 'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior',
    'seveninferior', 'eightinferior', 'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior',
    'commainferior', 'Agravesmall', 'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall',
    'Aringsmall', 'AEsmall', 'Ccedillasmall', 'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall',
    'Igravesmall', 'Iacutesmall', 'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall',
    'Oacutesmall', 'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall',
    'Uacutesmall', 'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall', '001.000',
    '001.001', '001.002', '001.003', 'Black', 'Bold', 'Book', 'Light', 'Medium', 'Regular', 'Roman', 'Semibold'];

var cffStandardEncoding = [
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'exclamdown', 'cent', 'sterling', 'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle',
    'quotedblleft', 'guillemotleft', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', '', 'endash', 'dagger',
    'daggerdbl', 'periodcentered', '', 'paragraph', 'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright',
    'guillemotright', 'ellipsis', 'perthousand', '', 'questiondown', '', 'grave', 'acute', 'circumflex', 'tilde',
    'macron', 'breve', 'dotaccent', 'dieresis', '', 'ring', 'cedilla', '', 'hungarumlaut', 'ogonek', 'caron',
    'emdash', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'AE', '', 'ordfeminine', '', '', '',
    '', 'Lslash', 'Oslash', 'OE', 'ordmasculine', '', '', '', '', '', 'ae', '', '', '', 'dotlessi', '', '',
    'lslash', 'oslash', 'oe', 'germandbls'];

var cffExpertEncoding = [
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', 'space', 'exclamsmall', 'Hungarumlautsmall', '', 'dollaroldstyle', 'dollarsuperior',
    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', 'twodotenleader', 'onedotenleader',
    'comma', 'hyphen', 'period', 'fraction', 'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle',
    'fouroldstyle', 'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'colon',
    'semicolon', 'commasuperior', 'threequartersemdash', 'periodsuperior', 'questionsmall', '', 'asuperior',
    'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', '', '', 'isuperior', '', '', 'lsuperior', 'msuperior',
    'nsuperior', 'osuperior', '', '', 'rsuperior', 'ssuperior', 'tsuperior', '', 'ff', 'fi', 'fl', 'ffi', 'ffl',
    'parenleftinferior', '', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'exclamdownsmall', 'centoldstyle', 'Lslashsmall', '', '', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall',
    'Brevesmall', 'Caronsmall', '', 'Dotaccentsmall', '', '', 'Macronsmall', '', '', 'figuredash', 'hypheninferior',
    '', '', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall', '', '', '', 'onequarter', 'onehalf', 'threequarters',
    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds', '',
    '', 'zerosuperior', 'onesuperior', 'twosuperior', 'threesuperior', 'foursuperior', 'fivesuperior',
    'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior', 'zeroinferior', 'oneinferior', 'twoinferior',
    'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior', 'seveninferior', 'eightinferior',
    'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior', 'commainferior', 'Agravesmall',
    'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall', 'Aringsmall', 'AEsmall', 'Ccedillasmall',
    'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall', 'Iacutesmall',
    'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall', 'Oacutesmall',
    'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall', 'Uacutesmall',
    'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall'];

var standardNames = [
    '.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
    'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash',
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less',
    'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
    'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
    'Adieresis', 'Aring', 'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave',
    'acircumflex', 'adieresis', 'atilde', 'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis',
    'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute', 'ograve', 'ocircumflex', 'odieresis',
    'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent', 'sterling', 'section',
    'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute', 'dieresis', 'notequal',
    'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal', 'greaterequal', 'yen', 'mu', 'partialdiff', 'summation',
    'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine', 'Omega', 'ae', 'oslash', 'questiondown',
    'exclamdown', 'logicalnot', 'radical', 'florin', 'approxequal', 'Delta', 'guillemotleft', 'guillemotright',
    'ellipsis', 'nonbreakingspace', 'Agrave', 'Atilde', 'Otilde', 'OE', 'oe', 'endash', 'emdash', 'quotedblleft',
    'quotedblright', 'quoteleft', 'quoteright', 'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction',
    'currency', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered', 'quotesinglbase',
    'quotedblbase', 'perthousand', 'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute',
    'Icircumflex', 'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve', 'Uacute', 'Ucircumflex',
    'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut',
    'ogonek', 'caron', 'Lslash', 'lslash', 'Scaron', 'scaron', 'Zcaron', 'zcaron', 'brokenbar', 'Eth', 'eth',
    'Yacute', 'yacute', 'Thorn', 'thorn', 'minus', 'multiply', 'onesuperior', 'twosuperior', 'threesuperior',
    'onehalf', 'onequarter', 'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla', 'scedilla',
    'Cacute', 'cacute', 'Ccaron', 'ccaron', 'dcroat'];

// This is the encoding used for fonts created from scratch.
// It loops through all glyphs and finds the appropriate unicode value.
// Since it's linear time, other encodings will be faster.
function DefaultEncoding(font) {
    this.font = font;
}

DefaultEncoding.prototype.charToGlyphIndex = function (c) {
    var code, glyphs, i, glyph, j;
    code = c.charCodeAt(0);
    glyphs = this.font.glyphs;
    if (glyphs) {
        for (i = 0; i < glyphs.length; i += 1) {
            glyph = glyphs[i];
            for (j = 0; j < glyph.unicodes.length; j += 1) {
                if (glyph.unicodes[j] === code) {
                    return i;
                }
            }
        }
    } else {
        return null;
    }
};

function CmapEncoding(cmap) {
    this.cmap = cmap;
}

CmapEncoding.prototype.charToGlyphIndex = function (c) {
    return this.cmap.glyphIndexMap[c.charCodeAt(0)] || 0;
};

function CffEncoding(encoding, charset) {
    this.encoding = encoding;
    this.charset = charset;
}

CffEncoding.prototype.charToGlyphIndex = function (s) {
    var code, charName;
    code = s.charCodeAt(0);
    charName = this.encoding[code];
    return this.charset.indexOf(charName);
};

function GlyphNames(post) {
    var i;
    switch (post.version) {
    case 1:
        this.names = exports.standardNames.slice();
        break;
    case 2:
        this.names = new Array(post.numberOfGlyphs);
        for (i = 0; i < post.numberOfGlyphs; i++) {
            if (post.glyphNameIndex[i] < exports.standardNames.length) {
                this.names[i] = exports.standardNames[post.glyphNameIndex[i]];
            } else {
                this.names[i] = post.names[post.glyphNameIndex[i] - exports.standardNames.length];
            }
        }
        break;
    case 2.5:
        this.names = new Array(post.numberOfGlyphs);
        for (i = 0; i < post.numberOfGlyphs; i++) {
            this.names[i] = exports.standardNames[i + post.glyphNameIndex[i]];
        }
        break;
    case 3:
        this.names = [];
        break;
    }
}

GlyphNames.prototype.nameToGlyphIndex = function (name) {
    return this.names.indexOf(name);
};

GlyphNames.prototype.glyphIndexToName = function (gid) {
    return this.names[gid];
};

function addGlyphNames(font) {
    var glyphIndexMap, charCodes, i, c, glyphIndex, glyph;
    glyphIndexMap = font.tables.cmap.glyphIndexMap;
    charCodes = Object.keys(glyphIndexMap);
    for (i = 0; i < charCodes.length; i += 1) {
        c = charCodes[i];
        glyphIndex = glyphIndexMap[c];
        glyph = font.glyphs[glyphIndex];
        glyph.addUnicode(parseInt(c));
    }
    for (i = 0; i < font.glyphs.length; i += 1) {
        glyph = font.glyphs[i];
        if (font.cffEncoding) {
            glyph.name = font.cffEncoding.charset[i];
        } else {
            glyph.name = font.glyphNames.glyphIndexToName(i);
        }
    }
}

exports.cffStandardStrings = cffStandardStrings;
exports.cffStandardEncoding = cffStandardEncoding;
exports.cffExpertEncoding = cffExpertEncoding;
exports.standardNames = standardNames;
exports.DefaultEncoding = DefaultEncoding;
exports.CmapEncoding = CmapEncoding;
exports.CffEncoding = CffEncoding;
exports.GlyphNames = GlyphNames;
exports.addGlyphNames = addGlyphNames;

},{}],4:[function(require,module,exports){
// The Font object



var path = require('./path');
var sfnt = require('./tables/sfnt');
var encoding = require('./encoding');

// A Font represents a loaded OpenType font file.
// It contains a set of glyphs and methods to draw text on a drawing context,
// or to get a path representing the text.
function Font(options) {
    options = options || {};
    // OS X will complain if the names are empty, so we put a single space everywhere by default.
    this.familyName = options.familyName || ' ';
    this.styleName = options.styleName || ' ';
    this.designer = options.designer || ' ';
    this.designerURL = options.designerURL || ' ';
    this.manufacturer = options.manufacturer || ' ';
    this.manufacturerURL = options.manufacturerURL || ' ';
    this.license = options.license || ' ';
    this.licenseURL = options.licenseURL || ' ';
    this.version = options.version || 'Version 0.1';
    this.description = options.description || ' ';
    this.copyright = options.copyright || ' ';
    this.trademark = options.trademark || ' ';
    this.unitsPerEm = options.unitsPerEm || 1000;
    this.supported = true;
    this.glyphs = options.glyphs || [];
    this.encoding = new encoding.DefaultEncoding(this);
    this.tables = {};
}

// Check if the font has a glyph for the given character.
Font.prototype.hasChar = function (c) {
    return this.encoding.charToGlyphIndex(c) !== null;
};

// Convert the given character to a single glyph index.
// Note that this function assumes that there is a one-to-one mapping between
// the given character and a glyph; for complex scripts this might not be the case.
Font.prototype.charToGlyphIndex = function (s) {
    return this.encoding.charToGlyphIndex(s);
};

// Convert the given character to a single Glyph object.
// Note that this function assumes that there is a one-to-one mapping between
// the given character and a glyph; for complex scripts this might not be the case.
Font.prototype.charToGlyph = function (c) {
    var glyphIndex, glyph;
    glyphIndex = this.charToGlyphIndex(c);
    glyph = this.glyphs[glyphIndex];
    if (!glyph) {
        glyph = this.glyphs[0]; // .notdef
    }
    return glyph;
};

// Convert the given text to a list of Glyph objects.
// Note that there is no strict one-to-one mapping between characters and
// glyphs, so the list of returned glyphs can be larger or smaller than the
// length of the given string.
Font.prototype.stringToGlyphs = function (s) {
    var i, c, glyphs;
    glyphs = [];
    for (i = 0; i < s.length; i += 1) {
        c = s[i];
        glyphs.push(this.charToGlyph(c));
    }
    return glyphs;
};

Font.prototype.nameToGlyphIndex = function (name) {
    return this.glyphNames.nameToGlyphIndex(name);
};

Font.prototype.nameToGlyph = function (name) {
    var glyphIndex, glyph;
    glyphIndex = this.nametoGlyphIndex(name);
    glyph = this.glyphs[glyphIndex];
    if (!glyph) {
        glyph = this.glyphs[0]; // .notdef
    }
    return glyph;
};

Font.prototype.glyphIndexToName = function (gid) {
    if (!this.glyphNames.glyphIndexToName) {
        return '';
    }
    return this.glyphNames.glyphIndexToName(gid);
};

// Retrieve the value of the kerning pair between the left glyph (or its index)
// and the right glyph (or its index). If no kerning pair is found, return 0.
// The kerning value gets added to the advance width when calculating the spacing
// between glyphs.
Font.prototype.getKerningValue = function (leftGlyph, rightGlyph) {
    leftGlyph = leftGlyph.index || leftGlyph;
    rightGlyph = rightGlyph.index || rightGlyph;
    var gposKerning = this.getGposKerningValue;
    return gposKerning ? gposKerning(leftGlyph, rightGlyph) :
        (this.kerningPairs[leftGlyph + ',' + rightGlyph] || 0);
};

// Helper function that invokes the given callback for each glyph in the given text.
// The callback gets `(glyph, x, y, fontSize, options)`.
Font.prototype.forEachGlyph = function (text, x, y, fontSize, options, callback) {
    var kerning, fontScale, glyphs, i, glyph, kerningValue;
    if (!this.supported) {
        return;
    }
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 72;
    options = options || {};
    kerning = options.kerning === undefined ? true : options.kerning;
    fontScale = 1 / this.unitsPerEm * fontSize;
    glyphs = this.stringToGlyphs(text);
    for (i = 0; i < glyphs.length; i += 1) {
        glyph = glyphs[i];
        callback(glyph, x, y, fontSize, options);
        if (glyph.advanceWidth) {
            x += glyph.advanceWidth * fontScale;
        }
        if (kerning && i < glyphs.length - 1) {
            kerningValue = this.getKerningValue(glyph, glyphs[i + 1]);
            x += kerningValue * fontScale;
        }
    }
};

// Create a Path object that represents the given text.
//
// text - The text to create.
// x - Horizontal position of the beginning of the text. (default: 0)
// y - Vertical position of the *baseline* of the text. (default: 0)
// fontSize - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`. (default: 72)
// Options is an optional object that contains:
// - kerning - Whether to take kerning information into account. (default: true)
//
// Returns a Path object.
Font.prototype.getPath = function (text, x, y, fontSize, options) {
    var fullPath = new path.Path();
    this.forEachGlyph(text, x, y, fontSize, options, function (glyph, x, y, fontSize) {
        var path = glyph.getPath(x, y, fontSize);
        fullPath.extend(path);
    });
    return fullPath;
};

// Draw the text on the given drawing context.
//
// ctx - A 2D drawing context, like Canvas.
// text - The text to create.
// x - Horizontal position of the beginning of the text. (default: 0)
// y - Vertical position of the *baseline* of the text. (default: 0)
// fontSize - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`. (default: 72)
// Options is an optional object that contains:
// - kerning - Whether to take kerning information into account. (default: true)
Font.prototype.draw = function (ctx, text, x, y, fontSize, options) {
    this.getPath(text, x, y, fontSize, options).draw(ctx);
};

// Draw the points of all glyphs in the text.
// On-curve points will be drawn in blue, off-curve points will be drawn in red.
//
// ctx - A 2D drawing context, like Canvas.
// text - The text to create.
// x - Horizontal position of the beginning of the text. (default: 0)
// y - Vertical position of the *baseline* of the text. (default: 0)
// fontSize - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`. (default: 72)
// Options is an optional object that contains:
// - kerning - Whether to take kerning information into account. (default: true)
Font.prototype.drawPoints = function (ctx, text, x, y, fontSize, options) {
    this.forEachGlyph(text, x, y, fontSize, options, function (glyph, x, y, fontSize) {
        glyph.drawPoints(ctx, x, y, fontSize);
    });
};

// Draw lines indicating important font measurements for all glyphs in the text.
// Black lines indicate the origin of the coordinate system (point 0,0).
// Blue lines indicate the glyph bounding box.
// Green line indicates the advance width of the glyph.
//
// ctx - A 2D drawing context, like Canvas.
// text - The text to create.
// x - Horizontal position of the beginning of the text. (default: 0)
// y - Vertical position of the *baseline* of the text. (default: 0)
// fontSize - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`. (default: 72)
// Options is an optional object that contains:
// - kerning - Whether to take kerning information into account. (default: true)
Font.prototype.drawMetrics = function (ctx, text, x, y, fontSize, options) {
    this.forEachGlyph(text, x, y, fontSize, options, function (glyph, x, y, fontSize) {
        glyph.drawMetrics(ctx, x, y, fontSize);
    });
};

// Validate
Font.prototype.validate = function () {
    var warnings = [];
    var font = this;

    function assert(predicate, message) {
        if (!predicate) {
            warnings.push(message);
        }
    }

    function assertStringAttribute(attrName) {
        assert(font[attrName] && font[attrName].trim().length > 0, 'No ' + attrName + ' specified.');
    }

    // Identification information
    assertStringAttribute('familyName');
    assertStringAttribute('weightName');
    assertStringAttribute('manufacturer');
    assertStringAttribute('copyright');
    assertStringAttribute('version');

    // Dimension information
    assert(this.unitsPerEm > 0, 'No unitsPerEm specified.');
};

// Convert the font object to a SFNT data structure.
// This structure contains all the necessary tables and metadata to create a binary OTF file.
Font.prototype.toTables = function () {
    return sfnt.fontToTable(this);
};

Font.prototype.toBuffer = function () {
    var sfntTable = this.toTables();
    var bytes = sfntTable.encode();
    var buffer = new ArrayBuffer(bytes.length);
    var intArray = new Uint8Array(buffer);
    for (var i = 0; i < bytes.length; i++) {
        intArray[i] = bytes[i];
    }
    return buffer;
};

// Initiate a download of the OpenType font.
Font.prototype.download = function () {
    var fileName = this.familyName.replace(/\s/g, '') + '-' + this.styleName + '.otf';
    var buffer = this.toBuffer();

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, buffer.byteLength, function (fs) {
        fs.root.getFile(fileName, {create: true}, function (fileEntry) {
            fileEntry.createWriter(function (writer) {
                var dataView = new DataView(buffer);
                var blob = new Blob([dataView], {type: 'font/opentype'});
                writer.write(blob);

                 writer.addEventListener('writeend', function () {
                    // Navigating to the file will download it.
                    location.href = fileEntry.toURL();
                 }, false);
            });
        });
    }, function (err) {
        throw err;
    });
};

exports.Font = Font;

},{"./encoding":3,"./path":8,"./tables/sfnt":23}],5:[function(require,module,exports){
// The Glyph object



var check = require('./check');
var draw = require('./draw');
var path = require('./path');

// A Glyph is an individual mark that often corresponds to a character.
// Some glyphs, such as ligatures, are a combination of many characters.
// Glyphs are the basic building blocks of a font.
//
// The `Glyph` class contains utility methods for drawing the path and its points.
function Glyph(options) {
    this.font = options.font || null;
    this.index = options.index || 0;
    this.name = options.name || null;
    this.unicode = options.unicode || undefined;
    this.unicodes = options.unicodes || options.unicode !== undefined ? [options.unicode] : [];
    this.xMin = options.xMin || 0;
    this.yMin = options.yMin || 0;
    this.xMax = options.xMax || 0;
    this.yMax = options.yMax || 0;
    this.advanceWidth = options.advanceWidth || 0;
    this.path = options.path || null;
}

Glyph.prototype.addUnicode = function (unicode) {
    if (this.unicodes.length === 0) {
        this.unicode = unicode;
    }
    this.unicodes.push(unicode);
};

// Convert the glyph to a Path we can draw on a drawing context.
//
// x - Horizontal position of the glyph. (default: 0)
// y - Vertical position of the *baseline* of the glyph. (default: 0)
// fontSize - Font size, in pixels (default: 72).
Glyph.prototype.getPath = function (x, y, fontSize) {
    var scale, p, commands, cmd;
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 72;
    scale = 1 / this.font.unitsPerEm * fontSize;
    p = new path.Path();
    commands = this.path.commands;
    for (var i = 0; i < commands.length; i += 1) {
        cmd = commands[i];
        if (cmd.type === 'M') {
            p.moveTo(x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 'L') {
            p.lineTo(x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 'Q') {
            p.quadraticCurveTo(x + (cmd.x1 * scale), y + (-cmd.y1 * scale),
                               x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 'C') {
            p.curveTo(x + (cmd.x1 * scale), y + (-cmd.y1 * scale),
                      x + (cmd.x2 * scale), y + (-cmd.y2 * scale),
                      x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 'Z') {
            p.closePath();
        }
    }
    return p;
};

// Split the glyph into contours.
// This function is here for backwards compatibility, and to
// provide raw access to the TrueType glyph outlines.
Glyph.prototype.getContours = function () {
    var contours, currentContour, i, pt;
    if (this.points === undefined) {
        return [];
    }
    contours = [];
    currentContour = [];
    for (i = 0; i < this.points.length; i += 1) {
        pt = this.points[i];
        currentContour.push(pt);
        if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
        }
    }
    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
    return contours;
};

// Calculate the xMin/yMin/xMax/yMax/lsb/rsb for a Glyph.
Glyph.prototype.getMetrics = function () {
    var commands = this.path.commands;
    var xCoords = [];
    var yCoords = [];
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        if (cmd.type !== 'Z') {
            xCoords.push(cmd.x);
            yCoords.push(cmd.y);
        }
        if (cmd.type === 'Q' || cmd.type === 'C') {
            xCoords.push(cmd.x1);
            yCoords.push(cmd.y1);
        }
        if (cmd.type === 'C') {
            xCoords.push(cmd.x2);
            yCoords.push(cmd.y2);
        }
    }
    var metrics = {
        xMin: Math.min.apply(null, xCoords),
        yMin: Math.min.apply(null, yCoords),
        xMax: Math.max.apply(null, xCoords),
        yMax: Math.max.apply(null, yCoords),
        leftSideBearing: 0
    };
    metrics.rightSideBearing = this.advanceWidth - metrics.leftSideBearing - (metrics.xMax - metrics.xMin);
    return metrics;
};

// Draw the glyph on the given context.
//
// ctx - The drawing context.
// x - Horizontal position of the glyph. (default: 0)
// y - Vertical position of the *baseline* of the glyph. (default: 0)
// fontSize - Font size, in pixels (default: 72).
Glyph.prototype.draw = function (ctx, x, y, fontSize) {
    this.getPath(x, y, fontSize).draw(ctx);
};

// Draw the points of the glyph.
// On-curve points will be drawn in blue, off-curve points will be drawn in red.
//
// ctx - The drawing context.
// x - Horizontal position of the glyph. (default: 0)
// y - Vertical position of the *baseline* of the glyph. (default: 0)
// fontSize - Font size, in pixels (default: 72).
Glyph.prototype.drawPoints = function (ctx, x, y, fontSize) {

    function drawCircles(l, x, y, scale) {
        var j, PI_SQ = Math.PI * 2;
        ctx.beginPath();
        for (j = 0; j < l.length; j += 1) {
            ctx.moveTo(x + (l[j].x * scale), y + (l[j].y * scale));
            ctx.arc(x + (l[j].x * scale), y + (l[j].y * scale), 2, 0, PI_SQ, false);
        }
        ctx.closePath();
        ctx.fill();
    }

    var scale, i, blueCircles, redCircles, path, cmd;
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 24;
    scale = 1 / this.font.unitsPerEm * fontSize;

    blueCircles = [];
    redCircles = [];
    path = this.path;
    for (i = 0; i < path.commands.length; i += 1) {
        cmd = path.commands[i];
        if (cmd.x !== undefined) {
            blueCircles.push({x: cmd.x, y: -cmd.y});
        }
        if (cmd.x1 !== undefined) {
            redCircles.push({x: cmd.x1, y: -cmd.y1});
        }
        if (cmd.x2 !== undefined) {
            redCircles.push({x: cmd.x2, y: -cmd.y2});
        }
    }

    ctx.fillStyle = 'blue';
    drawCircles(blueCircles, x, y, scale);
    ctx.fillStyle = 'red';
    drawCircles(redCircles, x, y, scale);
};

// Draw lines indicating important font measurements.
// Black lines indicate the origin of the coordinate system (point 0,0).
// Blue lines indicate the glyph bounding box.
// Green line indicates the advance width of the glyph.
//
// ctx - The drawing context.
// x - Horizontal position of the glyph. (default: 0)
// y - Vertical position of the *baseline* of the glyph. (default: 0)
// fontSize - Font size, in pixels (default: 72).
Glyph.prototype.drawMetrics = function (ctx, x, y, fontSize) {
    var scale;
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 24;
    scale = 1 / this.font.unitsPerEm * fontSize;
    ctx.lineWidth = 1;
    // Draw the origin
    ctx.strokeStyle = 'black';
    draw.line(ctx, x, -10000, x, 10000);
    draw.line(ctx, -10000, y, 10000, y);
    // Draw the glyph box
    ctx.strokeStyle = 'blue';
    draw.line(ctx, x + (this.xMin * scale), -10000, x + (this.xMin * scale), 10000);
    draw.line(ctx, x + (this.xMax * scale), -10000, x + (this.xMax * scale), 10000);
    draw.line(ctx, -10000, y + (-this.yMin * scale), 10000, y + (-this.yMin * scale));
    draw.line(ctx, -10000, y + (-this.yMax * scale), 10000, y + (-this.yMax * scale));
    // Draw the advance width
    ctx.strokeStyle = 'green';
    draw.line(ctx, x + (this.advanceWidth * scale), -10000, x + (this.advanceWidth * scale), 10000);
};

exports.Glyph = Glyph;

},{"./check":1,"./draw":2,"./path":8}],6:[function(require,module,exports){
// opentype.js
// https://github.com/nodebox/opentype.js
// (c) 2014 Frederik De Bleser
// opentype.js may be freely distributed under the MIT license.

/* global ArrayBuffer, DataView, Uint8Array, XMLHttpRequest  */



var encoding = require('./encoding');
var _font = require('./font');
var glyph = require('./glyph');
var parse = require('./parse');
var path = require('./path');

var cmap = require('./tables/cmap');
var cff = require('./tables/cff');
var glyf = require('./tables/glyf');
var gpos = require('./tables/gpos');
var head = require('./tables/head');
var hhea = require('./tables/hhea');
var hmtx = require('./tables/hmtx');
var kern = require('./tables/kern');
var loca = require('./tables/loca');
var maxp = require('./tables/maxp');
var _name = require('./tables/name');
var os2 = require('./tables/os2');
var post = require('./tables/post');

// File loaders /////////////////////////////////////////////////////////

// Convert a Node.js Buffer to an ArrayBuffer
function toArrayBuffer(buffer) {
    var i,
        arrayBuffer = new ArrayBuffer(buffer.length),
        data = new Uint8Array(arrayBuffer);

    for (i = 0; i < buffer.length; i += 1) {
        data[i] = buffer[i];
    }

    return arrayBuffer;
}

function loadFromFile(path, callback) {
    var fs = require('fs');
    fs.readFile(path, function (err, buffer) {
        if (err) {
            return callback(err.message);
        }

        callback(null, toArrayBuffer(buffer));
    });
}

function loadFromUrl(url, callback) {
    var request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        if (request.status !== 200) {
            return callback('Font could not be loaded: ' + request.statusText);
        }
        return callback(null, request.response);
    };
    request.send();
}

// Public API ///////////////////////////////////////////////////////////

// Parse the OpenType file data (as an ArrayBuffer) and return a Font object.
// If the file could not be parsed (most likely because it contains Postscript outlines)
// we return an empty Font object with the `supported` flag set to `false`.
function parseBuffer(buffer) {
    var font, data, version, numTables, i, p, tag, offset, hmtxOffset, glyfOffset, locaOffset,
        cffOffset, kernOffset, gposOffset, indexToLocFormat, numGlyphs, locaTable,
        shortVersion;
    // OpenType fonts use big endian byte ordering.
    // We can't rely on typed array view types, because they operate with the endianness of the host computer.
    // Instead we use DataViews where we can specify endianness.

    font = new _font.Font();
    data = new DataView(buffer, 0);

    version = parse.getFixed(data, 0);
    if (version === 1.0) {
        font.outlinesFormat = 'truetype';
    } else {
        version = parse.getTag(data, 0);
        if (version === 'OTTO') {
            font.outlinesFormat = 'cff';
        } else {
            throw new Error('Unsupported OpenType version ' + version);
        }
    }

    numTables = parse.getUShort(data, 4);

    // Offset into the table records.
    p = 12;
    for (i = 0; i < numTables; i += 1) {
        tag = parse.getTag(data, p);
        offset = parse.getULong(data, p + 8);
        switch (tag) {
        case 'cmap':
            font.tables.cmap = cmap.parse(data, offset);
            font.encoding = new encoding.CmapEncoding(font.tables.cmap);
            if (!font.encoding) {
                font.supported = false;
            }
            break;
        case 'head':
            font.tables.head = head.parse(data, offset);
            font.unitsPerEm = font.tables.head.unitsPerEm;
            indexToLocFormat = font.tables.head.indexToLocFormat;
            break;
        case 'hhea':
            font.tables.hhea = hhea.parse(data, offset);
            font.ascender = font.tables.hhea.ascender;
            font.descender = font.tables.hhea.descender;
            font.numberOfHMetrics = font.tables.hhea.numberOfHMetrics;
            break;
        case 'hmtx':
            hmtxOffset = offset;
            break;
        case 'maxp':
            font.tables.maxp = maxp.parse(data, offset);
            font.numGlyphs = numGlyphs = font.tables.maxp.numGlyphs;
            break;
        case 'name':
            font.tables.name = _name.parse(data, offset);
            font.familyName = font.tables.name.fontFamily;
            font.styleName = font.tables.name.fontSubfamily;
            break;
        case 'OS/2':
            font.tables.os2 = os2.parse(data, offset);
            break;
        case 'post':
            font.tables.post = post.parse(data, offset);
            font.glyphNames = new encoding.GlyphNames(font.tables.post);
            break;
        case 'glyf':
            glyfOffset = offset;
            break;
        case 'loca':
            locaOffset = offset;
            break;
        case 'CFF ':
            cffOffset = offset;
            break;
        case 'kern':
            kernOffset = offset;
            break;
        case 'GPOS':
            gposOffset = offset;
            break;
        }
        p += 16;
    }

    if (glyfOffset && locaOffset) {
        shortVersion = indexToLocFormat === 0;
        locaTable = loca.parse(data, locaOffset, numGlyphs, shortVersion);
        font.glyphs = glyf.parse(data, glyfOffset, locaTable, font);
        hmtx.parse(data, hmtxOffset, font.numberOfHMetrics, font.numGlyphs, font.glyphs);
        encoding.addGlyphNames(font);
    } else if (cffOffset) {
        cff.parse(data, cffOffset, font);
        encoding.addGlyphNames(font);
    } else {
        font.supported = false;
    }

    if (font.supported) {
        if (kernOffset) {
            font.kerningPairs = kern.parse(data, kernOffset);
        } else {
            font.kerningPairs = {};
        }
        if (gposOffset) {
            gpos.parse(data, gposOffset, font);
        }
    }

    return font;
}

// Asynchronously load the font from a URL or a filesystem. When done, call the callback
// with two arguments `(err, font)`. The `err` will be null on success,
// the `font` is a Font object.
//
// We use the node.js callback convention so that
// opentype.js can integrate with frameworks like async.js.
function load(url, callback) {
    var isNode = typeof window === 'undefined';
    var loadFn = isNode ? loadFromFile : loadFromUrl;
    loadFn(url, function (err, arrayBuffer) {
        if (err) {
            return callback(err);
        }
        var font = parseBuffer(arrayBuffer);
        if (!font.supported) {
            return callback('Font is not supported (is this a Postscript font?)');
        }
        return callback(null, font);
    });
}

exports.Font = _font.Font;
exports.Glyph = glyph.Glyph;
exports.Path = path.Path;
exports.parse = parseBuffer;
exports.load = load;

},{"./encoding":3,"./font":4,"./glyph":5,"./parse":7,"./path":8,"./tables/cff":10,"./tables/cmap":11,"./tables/glyf":12,"./tables/gpos":13,"./tables/head":14,"./tables/hhea":15,"./tables/hmtx":16,"./tables/kern":17,"./tables/loca":18,"./tables/maxp":19,"./tables/name":20,"./tables/os2":21,"./tables/post":22,"fs":undefined}],7:[function(require,module,exports){
// Parsing utility functions



// Retrieve an unsigned byte from the DataView.
exports.getByte = function getByte(dataView, offset) {
    return dataView.getUint8(offset);
};

exports.getCard8 = exports.getByte;

// Retrieve an unsigned 16-bit short from the DataView.
// The value is stored in big endian.
exports.getUShort = function (dataView, offset) {
    return dataView.getUint16(offset, false);
};

exports.getCard16 = exports.getUShort;

// Retrieve a signed 16-bit short from the DataView.
// The value is stored in big endian.
exports.getShort = function (dataView, offset) {
    return dataView.getInt16(offset, false);
};

// Retrieve an unsigned 32-bit long from the DataView.
// The value is stored in big endian.
exports.getULong = function (dataView, offset) {
    return dataView.getUint32(offset, false);
};

// Retrieve a 32-bit signed fixed-point number (16.16) from the DataView.
// The value is stored in big endian.
exports.getFixed = function (dataView, offset) {
    var decimal, fraction;
    decimal = dataView.getInt16(offset, false);
    fraction = dataView.getUint16(offset + 2, false);
    return decimal + fraction / 65535;
};

// Retrieve a 4-character tag from the DataView.
// Tags are used to identify tables.
exports.getTag = function (dataView, offset) {
    var tag = '', i;
    for (i = offset; i < offset + 4; i += 1) {
        tag += String.fromCharCode(dataView.getInt8(i));
    }
    return tag;
};

// Retrieve an offset from the DataView.
// Offsets are 1 to 4 bytes in length, depending on the offSize argument.
exports.getOffset = function (dataView, offset, offSize) {
    var i, v;
    v = 0;
    for (i = 0; i < offSize; i += 1) {
        v <<= 8;
        v += dataView.getUint8(offset + i);
    }
    return v;
};

// Retrieve a number of bytes from start offset to the end offset from the DataView.
exports.getBytes = function (dataView, startOffset, endOffset) {
    var bytes, i;
    bytes = [];
    for (i = startOffset; i < endOffset; i += 1) {
        bytes.push(dataView.getUint8(i));
    }
    return bytes;
};

// Convert the list of bytes to a string.
exports.bytesToString = function (bytes) {
    var s, i;
    s = '';
    for (i = 0; i < bytes.length; i += 1) {
        s += String.fromCharCode(bytes[i]);
    }
    return s;
};

var typeOffsets = {
    byte: 1,
    uShort: 2,
    short: 2,
    uLong: 4,
    fixed: 4,
    longDateTime: 8,
    tag: 4
};

// A stateful parser that changes the offset whenever a value is retrieved.
// The data is a DataView.
function Parser(data, offset) {
    this.data = data;
    this.offset = offset;
    this.relativeOffset = 0;
}

Parser.prototype.parseByte = function () {
    var v = this.data.getUint8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
};

Parser.prototype.parseChar = function () {
    var v = this.data.getInt8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
};

Parser.prototype.parseCard8 = Parser.prototype.parseByte;

Parser.prototype.parseUShort = function () {
    var v = this.data.getUint16(this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
};
Parser.prototype.parseCard16 = Parser.prototype.parseUShort;
Parser.prototype.parseSID = Parser.prototype.parseUShort;
Parser.prototype.parseOffset16 = Parser.prototype.parseUShort;

Parser.prototype.parseShort = function () {
    var v = this.data.getInt16(this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
};

Parser.prototype.parseF2Dot14 = function () {
    var v = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
    this.relativeOffset += 2;
    return v;
};

Parser.prototype.parseULong = function () {
    var v = exports.getULong(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v;
};

Parser.prototype.parseFixed = function () {
    var v = exports.getFixed(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v;
};

Parser.prototype.parseOffset16List =
Parser.prototype.parseUShortList = function (count) {
    var offsets = new Array(count),
        dataView = this.data,
        offset = this.offset + this.relativeOffset;
    for (var i = 0; i < count; i++) {
        offsets[i] = exports.getUShort(dataView, offset);
        offset += 2;
    }
    this.relativeOffset += count * 2;
    return offsets;
};

Parser.prototype.parseString = function (length) {
    var dataView = this.data,
        offset = this.offset + this.relativeOffset,
        string = '';
    this.relativeOffset += length;
    for (var i = 0; i < length; i++) {
        string += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return string;
};

Parser.prototype.parseTag = function () {
    return this.parseString(4);
};

// LONGDATETIME is a 64-bit integer.
// JavaScript and unix timestamps traditionally use 32 bits, so we
// only take the last 32 bits.
Parser.prototype.parseLongDateTime = function() {
    var v = exports.getULong(this.data, this.offset + this.relativeOffset + 4);
    this.relativeOffset += 8;
    return v;
};

Parser.prototype.parseFixed = function() {
    var v = exports.getULong(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v / 65536;
};

Parser.prototype.parseVersion = function() {
    var major = exports.getUShort(this.data, this.offset + this.relativeOffset);
    // How to interpret the minor version is very vague in the spec. 0x5000 is 5, 0x1000 is 1
    // This returns the correct number if minor = 0xN000 where N is 0-9
    var minor = exports.getUShort(this.data, this.offset + this.relativeOffset + 2);
    this.relativeOffset += 4;
    return major + minor / 0x1000 / 10;
};

Parser.prototype.skip = function (type, amount) {
    if (amount === undefined) {
        amount = 1;
    }
    this.relativeOffset += typeOffsets[type] * amount;
};

exports.Parser = Parser;

},{}],8:[function(require,module,exports){
// Geometric objects



// A bézier path containing a set of path commands similar to a SVG path.
// Paths can be drawn on a context using `draw`.
function Path() {
    this.commands = [];
    this.fill = 'black';
    this.stroke = null;
    this.strokeWidth = 1;
}

Path.prototype.moveTo = function (x, y) {
    this.commands.push({
        type: 'M',
        x: x,
        y: y
    });
};

Path.prototype.lineTo = function (x, y) {
    this.commands.push({
        type: 'L',
        x: x,
        y: y
    });
};

Path.prototype.curveTo = Path.prototype.bezierCurveTo = function (x1, y1, x2, y2, x, y) {
    this.commands.push({
        type: 'C',
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        x: x,
        y: y
    });
};

Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function (x1, y1, x, y) {
    this.commands.push({
        type: 'Q',
        x1: x1,
        y1: y1,
        x: x,
        y: y
    });
};

Path.prototype.close = Path.prototype.closePath = function () {
    this.commands.push({
        type: 'Z'
    });
};

// Add the given path or list of commands to the commands of this path.
Path.prototype.extend = function (pathOrCommands) {
    if (pathOrCommands.commands) {
        pathOrCommands = pathOrCommands.commands;
    }
    Array.prototype.push.apply(this.commands, pathOrCommands);
};

// Draw the path to a 2D context.
Path.prototype.draw = function (ctx) {
    var i, cmd;
    ctx.beginPath();
    for (i = 0; i < this.commands.length; i += 1) {
        cmd = this.commands[i];
        if (cmd.type === 'M') {
            ctx.moveTo(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
            ctx.lineTo(cmd.x, cmd.y);
        } else if (cmd.type === 'C') {
            ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        } else if (cmd.type === 'Q') {
            ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        } else if (cmd.type === 'Z') {
            ctx.closePath();
        }
    }
    if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
    }
    if (this.stroke) {
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = this.strokeWidth;
        ctx.stroke();
    }
};

// Convert the Path to a string of path data instructions
// See http://www.w3.org/TR/SVG/paths.html#PathData
// Parameters:
// - decimalPlaces: The amount of decimal places for floating-point values (default: 2)
Path.prototype.toPathData = function (decimalPlaces) {
    decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;

    function floatToString(v) {
        if (Math.round(v) === v) {
            return '' + Math.round(v);
        } else {
            return v.toFixed(decimalPlaces);
        }
    }

    function packValues() {
        var s = '';
        for (var i = 0; i < arguments.length; i += 1) {
            var v = arguments[i];
            if (v >= 0 && i > 0) {
                s += ' ';
            }
            s += floatToString(v);
        }
        return s;
    }

    var d = '';
    for (var i = 0; i < this.commands.length; i += 1) {
        var cmd = this.commands[i];
        if (cmd.type === 'M') {
            d += 'M' + packValues(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
            d += 'L' + packValues(cmd.x, cmd.y);
        } else if (cmd.type === 'C') {
            d += 'C' + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        } else if (cmd.type === 'Q') {
            d += 'Q' + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
        } else if (cmd.type === 'Z') {
            d += 'Z';
        }
    }
    return d;
};

// Convert the path to a SVG <path> element, as a string.
// Parameters:
// - decimalPlaces: The amount of decimal places for floating-point values (default: 2)
Path.prototype.toSVG = function (decimalPlaces) {
    var svg = '<path d="';
    svg += this.toPathData(decimalPlaces);
    svg += '"';
    if (this.fill & this.fill !== 'black') {
        if (this.fill === null) {
            svg += ' fill="none"';
        } else {
            svg += ' fill="' + this.fill + '"';
        }
    }
    if (this.stroke) {
        svg += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"';
    }
    svg += '/>';
    return svg;
};

exports.Path = Path;

},{}],9:[function(require,module,exports){
// Table metadata



var check = require('./check');
var encode = require('./types').encode;
var sizeOf = require('./types').sizeOf;

function Table(tableName, fields, options) {
    var i;
    for (i = 0; i < fields.length; i += 1) {
        var field = fields[i];
        this[field.name] = field.value;
    }
    this.tableName = tableName;
    this.fields = fields;
    if (options) {
        var optionKeys = Object.keys(options);
        for (i = 0; i < optionKeys.length; i += 1) {
            var k = optionKeys[i];
            var v = options[k];
            if (this[k] !== undefined) {
                this[k] = v;
            }
        }
    }
}

Table.prototype.sizeOf = function () {
    var v = 0;
    for (var i = 0; i < this.fields.length; i += 1) {
        var field = this.fields[i];
        var value = this[field.name];
        if (value === undefined) {
            value = field.value;
        }
        if (typeof value.sizeOf === 'function') {
            v += value.sizeOf();
        } else {
            var sizeOfFunction = sizeOf[field.type];
            check.assert(typeof sizeOfFunction === 'function', 'Could not find sizeOf function for field' + field.name);
            v += sizeOfFunction(value);
        }
    }
    return v;
};

Table.prototype.encode = function () {
    return encode.TABLE(this);
};

exports.Table = Table;

},{"./check":1,"./types":24}],10:[function(require,module,exports){
// The `CFF` table contains the glyph outlines in PostScript format.
// https://www.microsoft.com/typography/OTSPEC/cff.htm
// http://download.microsoft.com/download/8/0/1/801a191c-029d-4af3-9642-555f6fe514ee/cff.pdf
// http://download.microsoft.com/download/8/0/1/801a191c-029d-4af3-9642-555f6fe514ee/type2.pdf



var encoding = require('../encoding');
var _glyph = require('../glyph');
var parse = require('../parse');
var path = require('../path');
var table = require('../table');

// Custom equals function that can also check lists.
function equals(a, b) {
    if (a === b) {
        return true;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i += 1) {
            if (!equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

// Parse a `CFF` INDEX array.
// An index array consists of a list of offsets, then a list of objects at those offsets.
function parseCFFIndex(data, start, conversionFn) {
    var offsets, objects, count, endOffset, offsetSize, objectOffset, pos, i, value;
    offsets = [];
    objects = [];
    count = parse.getCard16(data, start);
    if (count !== 0) {
        offsetSize = parse.getByte(data, start + 2);
        objectOffset = start + ((count + 1) * offsetSize) + 2;
        pos = start + 3;
        for (i = 0; i < count + 1; i += 1) {
            offsets.push(parse.getOffset(data, pos, offsetSize));
            pos += offsetSize;
        }
        // The total size of the index array is 4 header bytes + the value of the last offset.
        endOffset = objectOffset + offsets[count];
    } else {
        endOffset = start + 2;
    }
    for (i = 0; i < offsets.length - 1; i += 1) {
        value = parse.getBytes(data, objectOffset + offsets[i], objectOffset + offsets[i + 1]);
        if (conversionFn) {
            value = conversionFn(value);
        }
        objects.push(value);
    }
    return {objects: objects, startOffset: start, endOffset: endOffset};
}

// Parse a `CFF` DICT real value.
function parseFloatOperand(parser) {
    var s, eof, lookup, b, n1, n2;
    s = '';
    eof = 15;
    lookup = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'E', 'E-', null, '-'];
    while (true) {
        b = parser.parseByte();
        n1 = b >> 4;
        n2 = b & 15;

        if (n1 === eof) {
            break;
        }
        s += lookup[n1];

        if (n2 === eof) {
            break;
        }
        s += lookup[n2];
    }
    return parseFloat(s);
}

// Parse a `CFF` DICT operand.
function parseOperand(parser, b0) {
    var b1, b2, b3, b4;
    if (b0 === 28) {
        b1 = parser.parseByte();
        b2 = parser.parseByte();
        return b1 << 8 | b2;
    }
    if (b0 === 29) {
        b1 = parser.parseByte();
        b2 = parser.parseByte();
        b3 = parser.parseByte();
        b4 = parser.parseByte();
        return b1 << 24 | b2 << 16 | b3 << 8 | b4;
    }
    if (b0 === 30) {
        return parseFloatOperand(parser);
    }
    if (b0 >= 32 && b0 <= 246) {
        return b0 - 139;
    }
    if (b0 >= 247 && b0 <= 250) {
        b1 = parser.parseByte();
        return (b0 - 247) * 256 + b1 + 108;
    }
    if (b0 >= 251 && b0 <= 254) {
        b1 = parser.parseByte();
        return -(b0 - 251) * 256 - b1 - 108;
    }
    throw new Error('Invalid b0 ' + b0);
}

// Convert the entries returned by `parseDict` to a proper dictionary.
// If a value is a list of one, it is unpacked.
function entriesToObject(entries) {
    var o, key, values, i, value;
    o = {};
    for (i = 0; i < entries.length; i += 1) {
        key = entries[i][0];
        values = entries[i][1];
        if (values.length === 1) {
            value = values[0];
        } else {
            value = values;
        }
        if (o.hasOwnProperty(key)) {
            throw new Error('Object ' + o + ' already has key ' + key);
        }
        o[key] = value;
    }
    return o;
}

// Parse a `CFF` DICT object.
// A dictionary contains key-value pairs in a compact tokenized format.
function parseCFFDict(data, start, size) {
    var parser, entries, operands, op;
    start = start !== undefined ? start : 0;
    parser = new parse.Parser(data, start);
    entries = [];
    operands = [];
    size = size !== undefined ? size : data.length;

    while (parser.relativeOffset < size) {
        op = parser.parseByte();
        // The first byte for each dict item distinguishes between operator (key) and operand (value).
        // Values <= 21 are operators.
        if (op <= 21) {
            // Two-byte operators have an initial escape byte of 12.
            if (op === 12) {
                op = 1200 + parser.parseByte();
            }
            entries.push([op, operands]);
            operands = [];
        } else {
            // Since the operands (values) come before the operators (keys), we store all operands in a list
            // until we encounter an operator.
            operands.push(parseOperand(parser, op));
        }
    }
    return entriesToObject(entries);
}

// Given a String Index (SID), return the value of the string.
// Strings below index 392 are standard CFF strings and are not encoded in the font.
function getCFFString(strings, index) {
    if (index <= 390) {
        index = encoding.cffStandardStrings[index];
    } else {
        index = strings[index - 391];
    }
    return index;
}

// Interpret a dictionary and return a new dictionary with readable keys and values for missing entries.
// This function takes `meta` which is a list of objects containing `operand`, `name` and `default`.
function interpretDict(dict, meta, strings) {
    var i, m, value, newDict;
    newDict = {};
    // Because we also want to include missing values, we start out from the meta list
    // and lookup values in the dict.
    for (i = 0; i < meta.length; i += 1) {
        m = meta[i];
        value = dict[m.op];
        if (value === undefined) {
            value = m.value !== undefined ? m.value : null;
        }
        if (m.type === 'SID') {
            value = getCFFString(strings, value);
        }
        newDict[m.name] = value;
    }
    return newDict;
}

// Parse the CFF header.
function parseCFFHeader(data, start) {
    var header = {};
    header.formatMajor = parse.getCard8(data, start);
    header.formatMinor = parse.getCard8(data, start + 1);
    header.size = parse.getCard8(data, start + 2);
    header.offsetSize = parse.getCard8(data, start + 3);
    header.startOffset = start;
    header.endOffset = start + 4;
    return header;
}

var TOP_DICT_META = [
    {name: 'version', op: 0, type: 'SID'},
    {name: 'notice', op: 1, type: 'SID'},
    {name: 'copyright', op: 1200, type: 'SID'},
    {name: 'fullName', op: 2, type: 'SID'},
    {name: 'familyName', op: 3, type: 'SID'},
    {name: 'weight', op: 4, type: 'SID'},
    {name: 'isFixedPitch', op: 1201, type: 'number', value: 0},
    {name: 'italicAngle', op: 1202, type: 'number', value: 0},
    {name: 'underlinePosition', op: 1203, type: 'number', value: -100},
    {name: 'underlineThickness', op: 1204, type: 'number', value: 50},
    {name: 'paintType', op: 1205, type: 'number', value: 0},
    {name: 'charstringType', op: 1206, type: 'number', value: 2},
    {name: 'fontMatrix', op: 1207, type: ['real', 'real', 'real', 'real', 'real', 'real'], value: [0.001, 0, 0, 0.001, 0, 0]},
    {name: 'uniqueId', op: 13, type: 'number'},
    {name: 'fontBBox', op: 5, type: ['number', 'number', 'number', 'number'], value: [0, 0, 0, 0]},
    {name: 'strokeWidth', op: 1208, type: 'number', value: 0},
    {name: 'xuid', op: 14, type: [], value: null},
    {name: 'charset', op: 15, type: 'offset', value: 0},
    {name: 'encoding', op: 16, type: 'offset', value: 0},
    {name: 'charStrings', op: 17, type: 'offset', value: 0},
    {name: 'private', op: 18, type: ['number', 'offset'], value: [0, 0]}
];

var PRIVATE_DICT_META = [
    {name: 'subrs', op: 19, type: 'offset', value: 0},
    {name: 'defaultWidthX', op: 20, type: 'number', value: 0},
    {name: 'nominalWidthX', op: 21, type: 'number', value: 0}
];

// Parse the CFF top dictionary. A CFF table can contain multiple fonts, each with their own top dictionary.
// The top dictionary contains the essential metadata for the font, together with the private dictionary.
function parseCFFTopDict(data, strings) {
    var dict;
    dict = parseCFFDict(data, 0, data.byteLength);
    return interpretDict(dict, TOP_DICT_META, strings);
}

// Parse the CFF private dictionary. We don't fully parse out all the values, only the ones we need.
function parseCFFPrivateDict(data, start, size, strings) {
    var dict;
    dict = parseCFFDict(data, start, size);
    return interpretDict(dict, PRIVATE_DICT_META, strings);
}

// Parse the CFF charset table, which contains internal names for all the glyphs.
// This function will return a list of glyph names.
// See Adobe TN #5176 chapter 13, "Charsets".
function parseCFFCharset(data, start, nGlyphs, strings) {
    var parser, format, charset, i, sid, count;
    parser = new parse.Parser(data, start);
    // The .notdef glyph is not included, so subtract 1.
    nGlyphs -= 1;
    charset = ['.notdef'];

    format = parser.parseCard8();
    if (format === 0) {
        for (i = 0; i < nGlyphs; i += 1) {
            sid = parser.parseSID();
            charset.push(getCFFString(strings, sid));
        }
    } else if (format === 1) {
        while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard8();
            for (i = 0; i <= count; i += 1) {
                charset.push(getCFFString(strings, sid));
                sid += 1;
            }
        }
    } else if (format === 2) {
        while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard16();
            for (i = 0; i <= count; i += 1) {
                charset.push(getCFFString(strings, sid));
                sid += 1;
            }
        }
    } else {
        throw new Error('Unknown charset format ' + format);
    }

    return charset;
}

// Parse the CFF encoding data. Only one encoding can be specified per font.
// See Adobe TN #5176 chapter 12, "Encodings".
function parseCFFEncoding(data, start, charset) {
    var enc, parser, format, nCodes, i, code, nRanges, first, nLeft, j;
    enc = {};
    parser = new parse.Parser(data, start);
    format = parser.parseCard8();
    if (format === 0) {
        nCodes = parser.parseCard8();
        for (i = 0; i < nCodes; i += 1) {
            code = parser.parseCard8();
            enc[code] = i;
        }
    } else if (format === 1) {
        nRanges = parser.parseCard8();
        code = 1;
        for (i = 0; i < nRanges; i += 1) {
            first = parser.parseCard8();
            nLeft = parser.parseCard8();
            for (j = first; j <= first + nLeft; j += 1) {
                enc[j] = code;
                code += 1;
            }
        }
    } else {
        throw new Error('Unknown encoding format ' + format);
    }
    return new encoding.CffEncoding(enc, charset);
}

// Take in charstring code and return a Glyph object.
// The encoding is described in the Type 2 Charstring Format
// https://www.microsoft.com/typography/OTSPEC/charstr2.htm
function parseCFFCharstring(code, font, index) {
    var p, glyph, stack, nStems, haveWidth, width, x, y, c1x, c1y, c2x, c2y, v;
    p = new path.Path();
    stack = [];
    nStems = 0;
    haveWidth = false;
    width = font.defaultWidthX;
    x = y = 0;

    function parseStems() {
        var hasWidthArg;
        // The number of stem operators on the stack is always even.
        // If the value is uneven, that means a width is specified.
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
            width = stack.shift() + font.nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
    }

    function parse(code) {
        var i, b1, b2, b3, b4, codeIndex, subrCode;
        i = 0;
        while (i < code.length) {
            v = code[i];
            i += 1;
            switch (v) {
            case 1: // hstem
                parseStems();
                break;
            case 3: // vstem
                parseStems();
                break;
            case 4: // vmoveto
                if (stack.length > 1 && !haveWidth) {
                    width = stack.shift() + font.nominalWidthX;
                    haveWidth = true;
                }
                y += stack.pop();
                p.moveTo(x, y);
                break;
            case 5: // rlineto
                while (stack.length > 0) {
                    x += stack.shift();
                    y += stack.shift();
                    p.lineTo(x, y);
                }
                break;
            case 6: // hlineto
                while (stack.length > 0) {
                    x += stack.shift();
                    p.lineTo(x, y);
                    if (stack.length === 0) {
                        break;
                    }
                    y += stack.shift();
                    p.lineTo(x, y);
                }
                break;
            case 7: // vlineto
                while (stack.length > 0) {
                    y += stack.shift();
                    p.lineTo(x, y);
                    if (stack.length === 0) {
                        break;
                    }
                    x += stack.shift();
                    p.lineTo(x, y);
                }
                break;
            case 8: // rrcurveto
                while (stack.length > 0) {
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
            case 10: // callsubr
                codeIndex = stack.pop() + font.subrsBias;
                subrCode = font.subrs[codeIndex];
                if (subrCode) {
                    parse(subrCode);
                }
                break;
            case 11: // return
                return;
            case 12: // escape
                v = code[i];
                i += 1;
                break;
            case 14: // endchar
                if (stack.length > 0 && !haveWidth) {
                    width = stack.shift() + font.nominalWidthX;
                    haveWidth = true;
                }
                p.closePath();
                break;
            case 18: // hstemhm
                parseStems();
                break;
            case 19: // hintmask
            case 20: // cntrmask
                parseStems();
                i += (nStems + 7) >> 3;
                break;
            case 21: // rmoveto
                if (stack.length > 2 && !haveWidth) {
                    width = stack.shift() + font.nominalWidthX;
                    haveWidth = true;
                }
                y += stack.pop();
                x += stack.pop();
                p.moveTo(x, y);
                break;
            case 22: // hmoveto
                if (stack.length > 1 && !haveWidth) {
                    width = stack.shift() + font.nominalWidthX;
                    haveWidth = true;
                }
                x += stack.pop();
                p.moveTo(x, y);
                break;
            case 23: // vstemhm
                parseStems();
                break;
            case 24: // rcurveline
                while (stack.length > 2) {
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                x += stack.shift();
                y += stack.shift();
                p.lineTo(x, y);
                break;
            case 25: // rlinecurve
                while (stack.length > 6) {
                    x += stack.shift();
                    y += stack.shift();
                    p.lineTo(x, y);
                }
                c1x = x + stack.shift();
                c1y = y + stack.shift();
                c2x = c1x + stack.shift();
                c2y = c1y + stack.shift();
                x = c2x + stack.shift();
                y = c2y + stack.shift();
                p.curveTo(c1x, c1y, c2x, c2y, x, y);
                break;
            case 26: // vvcurveto
                if (stack.length % 2) {
                    x += stack.shift();
                }
                while (stack.length > 0) {
                    c1x = x;
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x;
                    y = c2y + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
            case 27: // hhcurveto
                if (stack.length % 2) {
                    y += stack.shift();
                }
                while (stack.length > 0) {
                    c1x = x + stack.shift();
                    c1y = y;
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y;
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
            case 28: // shortint
                b1 = code[i];
                b2 = code[i + 1];
                stack.push(((b1 << 24) | (b2 << 16)) >> 16);
                i += 2;
                break;
            case 29: // callgsubr
                codeIndex = stack.pop() + font.gsubrsBias;
                subrCode = font.gsubrs[codeIndex];
                if (subrCode) {
                    parse(subrCode);
                }
                break;
            case 30: // vhcurveto
                while (stack.length > 0) {
                    c1x = x;
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + (stack.length === 1 ? stack.shift() : 0);
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    if (stack.length === 0) {
                        break;
                    }
                    c1x = x + stack.shift();
                    c1y = y;
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    y = c2y + stack.shift();
                    x = c2x + (stack.length === 1 ? stack.shift() : 0);
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
            case 31: // hvcurveto
                while (stack.length > 0) {
                    c1x = x + stack.shift();
                    c1y = y;
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    y = c2y + stack.shift();
                    x = c2x + (stack.length === 1 ? stack.shift() : 0);
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    if (stack.length === 0) {
                        break;
                    }
                    c1x = x;
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + (stack.length === 1 ? stack.shift() : 0);
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                }
                break;
            default:
                if (v < 32) {
                    console.log('Glyph ' + index + ': unknown operator ' + v);
                } else if (v < 247) {
                    stack.push(v - 139);
                } else if (v < 251) {
                    b1 = code[i];
                    i += 1;
                    stack.push((v - 247) * 256 + b1 + 108);
                } else if (v < 255) {
                    b1 = code[i];
                    i += 1;
                    stack.push(-(v - 251) * 256 - b1 - 108);
                } else {
                    b1 = code[i];
                    b2 = code[i + 1];
                    b3 = code[i + 2];
                    b4 = code[i + 3];
                    i += 4;
                    stack.push(((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) / 65536);
                }
            }
        }
    }

    parse(code);
    glyph = new _glyph.Glyph({font: font, index: index});
    glyph.path = p;
    glyph.advanceWidth = width;
    return glyph;
}

// Subroutines are encoded using the negative half of the number space.
// See type 2 chapter 4.7 "Subroutine operators".
function calcCFFSubroutineBias(subrs) {
    var bias;
    if (subrs.length < 1240) {
        bias = 107;
    } else if (subrs.length < 33900) {
        bias = 1131;
    } else {
        bias = 32768;
    }
    return bias;
}

// Parse the `CFF` table, which contains the glyph outlines in PostScript format.
function parseCFFTable(data, start, font) {
    var header, nameIndex, topDictIndex, stringIndex, globalSubrIndex, topDict, privateDictOffset, privateDict,
        subrOffset, subrIndex, charString, charStringsIndex, charset, i;
    font.tables.cff = {};
    header = parseCFFHeader(data, start);
    nameIndex = parseCFFIndex(data, header.endOffset, parse.bytesToString);
    topDictIndex = parseCFFIndex(data, nameIndex.endOffset);
    stringIndex = parseCFFIndex(data, topDictIndex.endOffset, parse.bytesToString);
    globalSubrIndex = parseCFFIndex(data, stringIndex.endOffset);
    font.gsubrs = globalSubrIndex.objects;
    font.gsubrsBias = calcCFFSubroutineBias(font.gsubrs);

    var topDictData = new DataView(new Uint8Array(topDictIndex.objects[0]).buffer);
    topDict = parseCFFTopDict(topDictData, stringIndex.objects);
    font.tables.cff.topDict = topDict;

    privateDictOffset = start + topDict['private'][1];
    privateDict = parseCFFPrivateDict(data, privateDictOffset, topDict['private'][0], stringIndex.objects);
    font.defaultWidthX = privateDict.defaultWidthX;
    font.nominalWidthX = privateDict.nominalWidthX;

    if (privateDict.subrs !== 0) {
        subrOffset = privateDictOffset + privateDict.subrs;
        subrIndex = parseCFFIndex(data, subrOffset);
        font.subrs = subrIndex.objects;
        font.subrsBias = calcCFFSubroutineBias(font.subrs);
    } else {
        font.subrs = [];
        font.subrsBias = 0;
    }

    // Offsets in the top dict are relative to the beginning of the CFF data, so add the CFF start offset.
    charStringsIndex = parseCFFIndex(data, start + topDict.charStrings);
    font.nGlyphs = charStringsIndex.objects.length;

    charset = parseCFFCharset(data, start + topDict.charset, font.nGlyphs, stringIndex.objects);
    if (topDict.encoding === 0) { // Standard encoding
        font.cffEncoding = new encoding.CffEncoding(encoding.cffStandardEncoding, charset);
    } else if (topDict.encoding === 1) { // Expert encoding
        font.cffEncoding = new encoding.CffEncoding(encoding.cffExpertEncoding, charset);
    } else {
        font.cffEncoding = parseCFFEncoding(data, start + topDict.encoding, charset);
    }
    // Prefer the CMAP encoding to the CFF encoding.
    font.encoding = font.encoding || font.cffEncoding;

    font.glyphs = [];
    for (i = 0; i < font.nGlyphs; i += 1) {
        charString = charStringsIndex.objects[i];
        font.glyphs.push(parseCFFCharstring(charString, font, i));
    }
}


// Convert a string to a String ID (SID).
// The list of strings is modified in place.
function encodeString(s, strings) {
    var i, sid;
    // Is the string in the CFF standard strings?
    i = encoding.cffStandardStrings.indexOf(s);
    if (i >= 0) {
        sid = i;
    }
    // Is the string already in the string index?
    i = strings.indexOf(s);
    if (i >= 0) {
        sid = i + encoding.cffStandardStrings.length;
    } else {
        sid = encoding.cffStandardStrings.length + strings.length;
        strings.push(s);
    }
    return sid;
}

function makeHeader() {
    return new table.Table('Header', [
        {name: 'major', type: 'Card8', value: 1},
        {name: 'minor', type: 'Card8', value: 0},
        {name: 'hdrSize', type: 'Card8', value: 4},
        {name: 'major', type: 'Card8', value: 1}
    ]);
}

function makeNameIndex(fontNames) {
    var t = new table.Table('Name INDEX', [
        {name: 'names', type: 'INDEX', value: []}
    ]);
    t.names = [];
    for (var i = 0; i < fontNames.length; i += 1) {
        t.names.push({name: 'name_' + i, type: 'NAME', value: fontNames[i]});
    }
    return t;
}

// Given a dictionary's metadata, create a DICT structure.
function makeDict(meta, attrs, strings) {
    var m = {}, i, entry, value;
    for (i = 0; i < meta.length; i += 1) {
        entry = meta[i];
        value = attrs[entry.name];
        if (value !== undefined && !equals(value, entry.value)) {
            if (entry.type === 'SID') {
                value = encodeString(value, strings);
            }
            m[entry.op] = {name: entry.name, type: entry.type, value: value};
        }
    }
    return m;
}

// The Top DICT houses the global font attributes.
function makeTopDict(attrs, strings) {
    var t = new table.Table('Top DICT', [
        {name: 'dict', type: 'DICT', value: {}}
    ]);
    t.dict = makeDict(TOP_DICT_META, attrs, strings);
    return t;
}

function makeTopDictIndex(topDict) {
    var t = new table.Table('Top DICT INDEX', [
        {name: 'topDicts', type: 'INDEX', value: []}
    ]);
    t.topDicts = [{name: 'topDict_0', type: 'TABLE', value: topDict}];
    return t;
}

function makeStringIndex(strings) {
    var t = new table.Table('String INDEX', [
        {name: 'strings', type: 'INDEX', value: []}
    ]);
    t.strings = [];
    for (var i = 0; i < strings.length; i += 1) {
        t.strings.push({name: 'string_' + i, type: 'STRING', value: strings[i]});
    }
    return t;
}

function makeGlobalSubrIndex() {
    // Currently we don't use subroutines.
    return new table.Table('Global Subr INDEX', [
        {name: 'subrs', type: 'INDEX', value: []}
    ]);
}

function makeCharsets(glyphNames, strings) {
    var t = new table.Table('Charsets', [
        {name: 'format', type: 'Card8', value: 0}
    ]);
    for (var i = 0; i < glyphNames.length; i += 1) {
        var glyphName = glyphNames[i];
        var glyphSID = encodeString(glyphName, strings);
        t.fields.push({name: 'glyph_' + i, type: 'SID', value: glyphSID});
    }
    return t;
}

function glyphToOps(glyph) {
    var ops = [], path = glyph.path, x, y, i, cmd, dx, dy, dx1, dy1, dx2, dy2;
    ops.push({name: 'width', type: 'NUMBER', value: glyph.advanceWidth});
    x = 0;
    y = 0;
    for (i = 0; i < path.commands.length; i += 1) {
        cmd = path.commands[i];
        if (cmd.type === 'M') {
            dx = cmd.x - x;
            dy = cmd.y - y;
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rmoveto', type: 'OP', value: 21});
            x = cmd.x;
            y = cmd.y;
        } else if (cmd.type === 'L') {
            dx = cmd.x - x;
            dy = cmd.y - y;
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rlineto', type: 'OP', value: 5});
            x = cmd.x;
            y = cmd.y;
        } else if (cmd.type === 'Q') {
            // FIXME: Add support for quad curves
            throw new Error('Writing quad curves is currently not supported.');
        } else if (cmd.type === 'C') {
            dx1 = cmd.x1 - x;
            dy1 = cmd.y1 - y;
            dx2 = cmd.x2 - cmd.x1;
            dy2 = cmd.y2 - cmd.y1;
            dx = cmd.x - cmd.x2;
            dy = cmd.y - cmd.y2;
            ops.push({name: 'dx1', type: 'NUMBER', value: dx1});
            ops.push({name: 'dy1', type: 'NUMBER', value: dy1});
            ops.push({name: 'dx2', type: 'NUMBER', value: dx2});
            ops.push({name: 'dy2', type: 'NUMBER', value: dy2});
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rrcurveto', type: 'OP', value: 8});
            x = cmd.x;
            y = cmd.y;
        } else if (cmd.type === 'Z') {
            // Contours are closed automatically.
        }
    }
    ops.push({name: 'endchar', type: 'OP', value: 14});
    return ops;
}

function makeCharStringsIndex(glyphs) {
    var t = new table.Table('CharStrings INDEX', [
        {name: 'charStrings', type: 'INDEX', value: []}
    ]);
    for (var i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs[i];
        var ops = glyphToOps(glyph);
        t.charStrings.push({name: glyph.name, type: 'CHARSTRING', value: ops});
    }
    return t;
}

function makePrivateDict(attrs, strings) {
    var t = new table.Table('Private DICT', [
        {name: 'dict', type: 'DICT', value: {}}
    ]);
    t.dict = makeDict(PRIVATE_DICT_META, attrs, strings);
    return t;
}

function makePrivateDictIndex(privateDict) {
    var t = new table.Table('Private DICT INDEX', [
        {name: 'privateDicts', type: 'INDEX', value: []}
    ]);
    t.privateDicts = [{name: 'privateDict_0', type: 'TABLE', value: privateDict}];
    return t;
}

function makeCFFTable(glyphs, options) {
    var t = new table.Table('CFF ', [
        {name: 'header', type: 'TABLE'},
        {name: 'nameIndex', type: 'TABLE'},
        {name: 'topDictIndex', type: 'TABLE'},
        {name: 'stringIndex', type: 'TABLE'},
        {name: 'globalSubrIndex', type: 'TABLE'},
        {name: 'charsets', type: 'TABLE'},
        {name: 'charStringsIndex', type: 'TABLE'},
        {name: 'privateDictIndex', type: 'TABLE'}
    ]);

    // We use non-zero values for the offsets so that the DICT encodes them.
    // This is important because the size of the Top DICT plays a role in offset calculation,
    // and the size shouldn't change after we've written correct offsets.
    var attrs = {
        version: options.version,
        fullName: options.fullName,
        familyName: options.familyName,
        weight: options.weightName,
        charset: 999,
        encoding: 0,
        charStrings: 999,
        private: [0, 999]
    };

    var privateAttrs = {};

    var glyphNames = [];
    // Skip first glyph (.notdef)
    for (var i = 1; i < glyphs.length; i += 1) {
        glyphNames.push(glyphs[i].name);
    }

    var strings = [];

    t.header = makeHeader();
    t.nameIndex = makeNameIndex([options.postScriptName]);
    var topDict = makeTopDict(attrs, strings);
    t.topDictIndex = makeTopDictIndex(topDict);
    t.globalSubrIndex = makeGlobalSubrIndex();
    t.charsets = makeCharsets(glyphNames, strings);
    t.charStringsIndex = makeCharStringsIndex(glyphs);
    var privateDict = makePrivateDict(privateAttrs, strings);
    t.privateDictIndex = makePrivateDictIndex(privateDict);

    // Needs to come at the end, to encode all custom strings used in the font.
    t.stringIndex = makeStringIndex(strings);

    var startOffset = t.header.sizeOf() +
        t.nameIndex.sizeOf() +
        t.topDictIndex.sizeOf() +
        t.stringIndex.sizeOf() +
        t.globalSubrIndex.sizeOf();
    attrs.charset = startOffset;
    attrs.encoding = 0; // We use the CFF standard encoding; proper encoding will be handled in cmap.
    attrs.charStrings = attrs.charset + t.charsets.sizeOf();
    attrs.private[1] = attrs.charStrings + t.charStringsIndex.sizeOf();

    // Recreate the Top DICT INDEX with the correct offsets.
    topDict = makeTopDict(attrs, strings);
    t.topDictIndex = makeTopDictIndex(topDict);

    return t;
}

exports.parse = parseCFFTable;
exports.make = makeCFFTable;

},{"../encoding":3,"../glyph":5,"../parse":7,"../path":8,"../table":9}],11:[function(require,module,exports){
// The `cmap` table stores the mappings from characters to glyphs.
// https://www.microsoft.com/typography/OTSPEC/cmap.htm



var check = require('../check');
var parse = require('../parse');
var table = require('../table');

// Parse the `cmap` table. This table stores the mappings from characters to glyphs.
// There are many available formats, but we only support the Windows format 4.
// This function returns a `CmapEncoding` object or null if no supported format could be found.
function parseCmapTable(data, start) {
    var version, numTables, offset, platformId, encodingId, format, segCount,
        endCountParser, startCountParser, idDeltaParser, idRangeOffsetParser, glyphIndexOffset,
        endCount, startCount, i, c, idDelta, idRangeOffset, p, glyphIndex;
    var cmap = {};
    cmap.version = version = parse.getUShort(data, start);
    check.argument(version === 0, 'cmap table version should be 0.');

    // The cmap table can contain many sub-tables, each with their own format.
    // We're only interested in a "platform 3" table. This is a Windows format.
    cmap.numtables = numTables = parse.getUShort(data, start + 2);
    offset = -1;
    for (i = 0; i < numTables; i += 1) {
        platformId = parse.getUShort(data, start + 4 + (i * 8));
        encodingId = parse.getUShort(data, start + 4 + (i * 8) + 2);
        if (platformId === 3 && (encodingId === 1 || encodingId === 0)) {
            offset = parse.getULong(data, start + 4 + (i * 8) + 4);
            break;
        }
    }
    if (offset === -1) {
        // There is no cmap table in the font that we support, so return null.
        // This font will be marked as unsupported.
        return null;
    }

    p = new parse.Parser(data, start + offset);
    cmap.format = format = p.parseUShort();
    check.argument(format === 4, 'Only format 4 cmap tables are supported.');
    // Length in bytes of the sub-tables.
    cmap.length = p.parseUShort();
    cmap.language = p.parseUShort();
    // segCount is stored x 2.
    cmap.segCount = segCount = p.parseUShort() >> 1;
    // Skip searchRange, entrySelector, rangeShift.
    p.skip('uShort', 3);

    // The "unrolled" mapping from character codes to glyph indices.
    cmap.glyphIndexMap = {};

    endCountParser = new parse.Parser(data, start + offset + 14);
    startCountParser = new parse.Parser(data, start + offset + 16 + segCount * 2);
    idDeltaParser = new parse.Parser(data, start + offset + 16 + segCount * 4);
    idRangeOffsetParser = new parse.Parser(data, start + offset + 16 + segCount * 6);
    glyphIndexOffset = start + offset + 16 + segCount * 8;
    for (i = 0; i < segCount - 1; i += 1) {
        endCount = endCountParser.parseUShort();
        startCount = startCountParser.parseUShort();
        idDelta = idDeltaParser.parseShort();
        idRangeOffset = idRangeOffsetParser.parseUShort();
        for (c = startCount; c <= endCount; c += 1) {
            if (idRangeOffset !== 0) {
                // The idRangeOffset is relative to the current position in the idRangeOffset array.
                // Take the current offset in the idRangeOffset array.
                glyphIndexOffset = (idRangeOffsetParser.offset + idRangeOffsetParser.relativeOffset - 2);
                // Add the value of the idRangeOffset, which will move us into the glyphIndex array.
                glyphIndexOffset += idRangeOffset;
                // Then add the character index of the current segment, multiplied by 2 for USHORTs.
                glyphIndexOffset += (c - startCount) * 2;
                glyphIndex = parse.getUShort(data, glyphIndexOffset);
                if (glyphIndex !== 0) {
                    glyphIndex = (glyphIndex + idDelta) & 0xFFFF;
                }
            } else {
                glyphIndex = (c + idDelta) & 0xFFFF;
            }
            cmap.glyphIndexMap[c] = glyphIndex;
        }
    }
    return cmap;
}

function addSegment(t, code, glyphIndex) {
    t.segments.push({
        end: code,
        start: code,
        delta: -(code - glyphIndex),
        offset: 0
    });
}

function addTerminatorSegment(t) {
    t.segments.push({
        end: 0xFFFF,
        start: 0xFFFF,
        delta: 1,
        offset: 0
    });
}

function makeCmapTable(glyphs) {
    var i, j, glyph;
    var t = new table.Table('cmap', [
        {name: 'version', type: 'USHORT', value: 0},
        {name: 'numTables', type: 'USHORT', value: 1},
        {name: 'platformID', type: 'USHORT', value: 3},
        {name: 'encodingID', type: 'USHORT', value: 1},
        {name: 'offset', type: 'ULONG', value: 12},
        {name: 'format', type: 'USHORT', value: 4},
        {name: 'length', type: 'USHORT', value: 0},
        {name: 'language', type: 'USHORT', value: 0},
        {name: 'segCountX2', type: 'USHORT', value: 0},
        {name: 'searchRange', type: 'USHORT', value: 0},
        {name: 'entrySelector', type: 'USHORT', value: 0},
        {name: 'rangeShift', type: 'USHORT', value: 0}
    ]);

    t.segments = [];
    for (i = 0; i < glyphs.length; i += 1) {
        glyph = glyphs[i];
        for (j = 0; j < glyph.unicodes.length; j += 1) {
            addSegment(t, glyph.unicodes[j], i);
        }
    }
    addTerminatorSegment(t);

    var segCount;
    segCount = t.segments.length;
    t.segCountX2 = segCount * 2;
    t.searchRange = Math.pow(2, Math.floor(Math.log(segCount) / Math.log(2))) * 2;
    t.entrySelector = Math.log(t.searchRange / 2) / Math.log(2);
    t.rangeShift = t.segCountX2 - t.searchRange;

     // Set up parallel segment arrays.
    var endCounts = [],
        startCounts = [],
        idDeltas = [],
        idRangeOffsets = [],
        glyphIds = [];

    for (i = 0; i < segCount; i += 1) {
        var segment = t.segments[i];
        endCounts = endCounts.concat({name: 'end_' + i, type: 'USHORT', value: segment.end});
        startCounts = startCounts.concat({name: 'start_' + i, type: 'USHORT', value: segment.start});
        idDeltas = idDeltas.concat({name: 'idDelta_' + i, type: 'SHORT', value: segment.delta});
        idRangeOffsets = idRangeOffsets.concat({name: 'idRangeOffset_' + i, type: 'USHORT', value: segment.offset});
        if (segment.glyphId !== undefined) {
            glyphIds = glyphIds.concat({name: 'glyph_' + i, type: 'USHORT', value: segment.glyphId});
        }
    }
    t.fields = t.fields.concat(endCounts);
    t.fields.push({name: 'reservedPad', type: 'USHORT', value: 0});
    t.fields = t.fields.concat(startCounts);
    t.fields = t.fields.concat(idDeltas);
    t.fields = t.fields.concat(idRangeOffsets);
    t.fields = t.fields.concat(glyphIds);

    t.length = 14 + // Subtable header
        endCounts.length * 2 +
        2 + // reservedPad
        startCounts.length * 2 +
        idDeltas.length * 2 +
        idRangeOffsets.length * 2 +
        glyphIds.length * 2;
    return t;
}

exports.parse = parseCmapTable;
exports.make = makeCmapTable;

},{"../check":1,"../parse":7,"../table":9}],12:[function(require,module,exports){
// The `glyf` table describes the glyphs in TrueType outline format.
// http://www.microsoft.com/typography/otspec/glyf.htm



var check = require('../check');
var _glyph = require('../glyph');
var parse = require('../parse');
var path = require('../path');

// Parse the coordinate data for a glyph.
function parseGlyphCoordinate(p, flag, previousValue, shortVectorBitMask, sameBitMask) {
    var v;
    if ((flag & shortVectorBitMask) > 0) {
        // The coordinate is 1 byte long.
        v = p.parseByte();
        // The `same` bit is re-used for short values to signify the sign of the value.
        if ((flag & sameBitMask) === 0) {
            v = -v;
        }
        v = previousValue + v;
    } else {
        //  The coordinate is 2 bytes long.
        // If the `same` bit is set, the coordinate is the same as the previous coordinate.
        if ((flag & sameBitMask) > 0) {
            v = previousValue;
        } else {
            // Parse the coordinate as a signed 16-bit delta value.
            v = previousValue + p.parseShort();
        }
    }
    return v;
}

// Parse a TrueType glyph.
function parseGlyph(data, start, index, font) {
    var p, glyph, flag, i, j, flags,
        endPointIndices, numberOfCoordinates, repeatCount, points, point, px, py,
        component, moreComponents;
    p = new parse.Parser(data, start);
    glyph = new _glyph.Glyph({font: font, index: index});
    glyph.numberOfContours = p.parseShort();
    glyph.xMin = p.parseShort();
    glyph.yMin = p.parseShort();
    glyph.xMax = p.parseShort();
    glyph.yMax = p.parseShort();
    if (glyph.numberOfContours > 0) {
        // This glyph is not a composite.
        endPointIndices = glyph.endPointIndices = [];
        for (i = 0; i < glyph.numberOfContours; i += 1) {
            endPointIndices.push(p.parseUShort());
        }

        glyph.instructionLength = p.parseUShort();
        glyph.instructions = [];
        for (i = 0; i < glyph.instructionLength; i += 1) {
            glyph.instructions.push(p.parseByte());
        }

        numberOfCoordinates = endPointIndices[endPointIndices.length - 1] + 1;
        flags = [];
        for (i = 0; i < numberOfCoordinates; i += 1) {
            flag = p.parseByte();
            flags.push(flag);
            // If bit 3 is set, we repeat this flag n times, where n is the next byte.
            if ((flag & 8) > 0) {
                repeatCount = p.parseByte();
                for (j = 0; j < repeatCount; j += 1) {
                    flags.push(flag);
                    i += 1;
                }
            }
        }
        check.argument(flags.length === numberOfCoordinates, 'Bad flags.');

        if (endPointIndices.length > 0) {
            points = [];
            // X/Y coordinates are relative to the previous point, except for the first point which is relative to 0,0.
            if (numberOfCoordinates > 0) {
                for (i = 0; i < numberOfCoordinates; i += 1) {
                    flag = flags[i];
                    point = {};
                    point.onCurve = !!(flag & 1);
                    point.lastPointOfContour = endPointIndices.indexOf(i) >= 0;
                    points.push(point);
                }
                px = 0;
                for (i = 0; i < numberOfCoordinates; i += 1) {
                    flag = flags[i];
                    point = points[i];
                    point.x = parseGlyphCoordinate(p, flag, px, 2, 16);
                    px = point.x;
                }

                py = 0;
                for (i = 0; i < numberOfCoordinates; i += 1) {
                    flag = flags[i];
                    point = points[i];
                    point.y = parseGlyphCoordinate(p, flag, py, 4, 32);
                    py = point.y;
                }
            }
            glyph.points = points;
        } else {
            glyph.points = [];
        }
    } else if (glyph.numberOfContours === 0) {
        glyph.points = [];
    } else {
        glyph.isComposite = true;
        glyph.points = [];
        glyph.components = [];
        moreComponents = true;
        while (moreComponents) {
            flags = p.parseUShort();
            component = {
                glyphIndex: p.parseUShort(),
                 xScale: 1,
                 scale01: 0,
                 scale10: 0,
                 yScale: 1,
                 dx: 0,
                 dy: 0
             };
            if ((flags & 1) > 0) {
                // The arguments are words
                component.dx = p.parseShort();
                component.dy = p.parseShort();
            } else {
                // The arguments are bytes
                component.dx = p.parseChar();
                component.dy = p.parseChar();
            }
            if ((flags & 8) > 0) {
                // We have a scale
                component.xScale = component.yScale = p.parseF2Dot14();
            } else if ((flags & 64) > 0) {
                // We have an X / Y scale
                component.xScale = p.parseF2Dot14();
                component.yScale = p.parseF2Dot14();
            } else if ((flags & 128) > 0) {
                // We have a 2x2 transformation
                component.xScale = p.parseF2Dot14();
                component.scale01 = p.parseF2Dot14();
                component.scale10 = p.parseF2Dot14();
                component.yScale = p.parseF2Dot14();
            }

            glyph.components.push(component);
            moreComponents = !!(flags & 32);
        }
    }
    return glyph;
}

// Transform an array of points and return a new array.
function transformPoints(points, transform) {
    var newPoints, i, pt, newPt;
    newPoints = [];
    for (i = 0; i < points.length; i += 1) {
        pt = points[i];
        newPt = {
            x: transform.xScale * pt.x + transform.scale01 * pt.y + transform.dx,
            y: transform.scale10 * pt.x + transform.yScale * pt.y + transform.dy,
            onCurve: pt.onCurve,
            lastPointOfContour: pt.lastPointOfContour
        };
        newPoints.push(newPt);
    }
    return newPoints;
}


function getContours(points) {
    var contours, currentContour, i, pt;
    contours = [];
    currentContour = [];
    for (i = 0; i < points.length; i += 1) {
        pt = points[i];
        currentContour.push(pt);
        if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
        }
    }
    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
    return contours;
}

// Convert the TrueType glyph outline to a Path.
function getPath(points) {
    var p, contours, i, realFirstPoint, j, contour, pt, firstPt,
        prevPt, midPt, curvePt, lastPt;
    p = new path.Path();
    if (!points) {
        return p;
    }
    contours = getContours(points);
    for (i = 0; i < contours.length; i += 1) {
        contour = contours[i];
        firstPt = contour[0];
        lastPt = contour[contour.length - 1];
        if (firstPt.onCurve) {
            curvePt = null;
            // The first point will be consumed by the moveTo command,
            // so skip it in the loop.
            realFirstPoint = true;
        } else {
            if (lastPt.onCurve) {
                // If the first point is off-curve and the last point is on-curve,
                // start at the last point.
                firstPt = lastPt;
            } else {
                // If both first and last points are off-curve, start at their middle.
                firstPt = { x: (firstPt.x + lastPt.x) / 2, y: (firstPt.y + lastPt.y) / 2 };
            }
            curvePt = firstPt;
            // The first point is synthesized, so don't skip the real first point.
            realFirstPoint = false;
        }
        p.moveTo(firstPt.x, firstPt.y);

        for (j = realFirstPoint ? 1 : 0; j < contour.length; j += 1) {
            pt = contour[j];
            prevPt = j === 0 ? firstPt : contour[j - 1];
            if (prevPt.onCurve && pt.onCurve) {
                // This is a straight line.
                p.lineTo(pt.x, pt.y);
            } else if (prevPt.onCurve && !pt.onCurve) {
                curvePt = pt;
            } else if (!prevPt.onCurve && !pt.onCurve) {
                midPt = { x: (prevPt.x + pt.x) / 2, y: (prevPt.y + pt.y) / 2 };
                p.quadraticCurveTo(prevPt.x, prevPt.y, midPt.x, midPt.y);
                curvePt = pt;
            } else if (!prevPt.onCurve && pt.onCurve) {
                // Previous point off-curve, this point on-curve.
                p.quadraticCurveTo(curvePt.x, curvePt.y, pt.x, pt.y);
                curvePt = null;
            } else {
                throw new Error('Invalid state.');
            }
        }
        if (firstPt !== lastPt) {
            // Connect the last and first points
            if (curvePt) {
                p.quadraticCurveTo(curvePt.x, curvePt.y, firstPt.x, firstPt.y);
            } else {
                p.lineTo(firstPt.x, firstPt.y);
            }
        }
    }
    p.closePath();
    return p;
}

// Parse all the glyphs according to the offsets from the `loca` table.
function parseGlyfTable(data, start, loca, font) {
    var glyphs, i, j, offset, nextOffset, glyph,
        component, componentGlyph, transformedPoints;
    glyphs = [];
    // The last element of the loca table is invalid.
    for (i = 0; i < loca.length - 1; i += 1) {
        offset = loca[i];
        nextOffset = loca[i + 1];
        if (offset !== nextOffset) {
            glyphs.push(parseGlyph(data, start + offset, i, font));
        } else {
            glyphs.push(new _glyph.Glyph({font: font, index: i}));
        }
    }
    // Go over the glyphs again, resolving the composite glyphs.
    for (i = 0; i < glyphs.length; i += 1) {
        glyph = glyphs[i];
        if (glyph.isComposite) {
            for (j = 0; j < glyph.components.length; j += 1) {
                component = glyph.components[j];
                componentGlyph = glyphs[component.glyphIndex];
                if (componentGlyph.points) {
                    transformedPoints = transformPoints(componentGlyph.points, component);
                    glyph.points = glyph.points.concat(transformedPoints);
                }
            }
        }
        glyph.path = getPath(glyph.points);
    }
    return glyphs;
}

exports.parse = parseGlyfTable;

},{"../check":1,"../glyph":5,"../parse":7,"../path":8}],13:[function(require,module,exports){
// The `GPOS` table contains kerning pairs, among other things.
// https://www.microsoft.com/typography/OTSPEC/gpos.htm



var check = require('../check');
var parse = require('../parse');

// Parse ScriptList and FeatureList tables of GPOS, GSUB, GDEF, BASE, JSTF tables.
// These lists are unused by now, this function is just the basis for a real parsing.
function parseTaggedListTable(data, start) {
    var p = new parse.Parser(data, start),
        n = p.parseUShort(),
        list = [];
    for (var i = 0; i < n; i++) {
        list[p.parseTag()] = { offset: p.parseUShort() };
    }
    return list;
}

// Parse a coverage table in a GSUB, GPOS or GDEF table.
// Format 1 is a simple list of glyph ids,
// Format 2 is a list of ranges. It is expanded in a list of glyphs, maybe not the best idea.
function parseCoverageTable(data, start) {
    var p = new parse.Parser(data, start),
        format = p.parseUShort(),
        count =  p.parseUShort();
    if (format === 1) {
        return p.parseUShortList(count);
    }
    else if (format === 2) {
        var i, begin, end, index, coverage = [];
        for (; count--;) {
            begin = p.parseUShort();
            end = p.parseUShort();
            index = p.parseUShort();
            for (i = begin; i <= end; i++) {
                coverage[index++] = i;
            }
        }
        return coverage;
    }
}

// Parse a Class Definition Table in a GSUB, GPOS or GDEF table.
// Returns a function that gets a class value from a glyph ID.
function parseClassDefTable(data, start) {
    var p = new parse.Parser(data, start),
        format = p.parseUShort();
    if (format === 1) {
        // Format 1 specifies a range of consecutive glyph indices, one class per glyph ID.
        var startGlyph = p.parseUShort(),
            glyphCount = p.parseUShort(),
            classes = p.parseUShortList(glyphCount);
        return function(glyphID) {
            return classes[glyphID - startGlyph] || 0;
        };
    }
    else if (format === 2) {
        // Format 2 defines multiple groups of glyph indices that belong to the same class.
        var rangeCount = p.parseUShort(),
            startGlyphs = [],
            endGlyphs = [],
            classValues = [];
        for (var i = 0; i < rangeCount; i++) {
            startGlyphs[i] = p.parseUShort();
            endGlyphs[i] = p.parseUShort();
            classValues[i] = p.parseUShort();
        }
        return function(glyphID) {
            var l, c, r;
            l = 0;
            r = startGlyphs.length - 1;
            while (l < r) {
                c = (l + r + 1) >> 1;
                if (glyphID < startGlyphs[c]) {
                    r = c - 1;
                } else {
                    l = c;
                }
            }
            if (startGlyphs[l] <= glyphID && glyphID <= endGlyphs[l]) {
                return classValues[l] || 0;
            }
            return 0;
        };
    }
}

// Parse a pair adjustment positioning subtable, format 1 or format 2
// The subtable is returned in the form of a lookup function.
function parsePairPosSubTable(data, start) {
    var p = new parse.Parser(data, start);
    var format, coverageOffset, coverage, valueFormat1, valueFormat2,
        sharedPairSets, firstGlyph, secondGlyph, value1, value2;
    // This part is common to format 1 and format 2 subtables
    format = p.parseUShort();
    coverageOffset = p.parseUShort();
    coverage = parseCoverageTable(data, start+coverageOffset);
    // valueFormat 4: XAdvance only, 1: XPlacement only, 0: no ValueRecord for second glyph
    // Only valueFormat1=4 and valueFormat2=0 is supported.
    valueFormat1 = p.parseUShort();
    valueFormat2 = p.parseUShort();
    if (valueFormat1 !== 4 || valueFormat2 !== 0) return;
    sharedPairSets = {};
    if (format === 1) {
        // Pair Positioning Adjustment: Format 1
        var pairSetCount, pairSetOffsets, pairSetOffset, sharedPairSet, pairValueCount, pairSet;
        pairSetCount = p.parseUShort();
        pairSet = [];
        // Array of offsets to PairSet tables-from beginning of PairPos subtable-ordered by Coverage Index
        pairSetOffsets = p.parseOffset16List(pairSetCount);
        for (firstGlyph = 0; firstGlyph < pairSetCount; firstGlyph++) {
            pairSetOffset = pairSetOffsets[firstGlyph];
            sharedPairSet = sharedPairSets[pairSetOffset];
            if (!sharedPairSet) {
                // Parse a pairset table in a pair adjustment subtable format 1
                sharedPairSet = {};
                p.relativeOffset = pairSetOffset;
                pairValueCount = p.parseUShort();
                for (; pairValueCount--;) {
                    secondGlyph = p.parseUShort();
                    if (valueFormat1) value1 = p.parseShort();
                    if (valueFormat2) value2 = p.parseShort();
                    // We only support valueFormat1 = 4 and valueFormat2 = 0,
                    // so value1 is the XAdvance and value2 is empty.
                    sharedPairSet[secondGlyph] = value1;
                }
            }
            pairSet[coverage[firstGlyph]] = sharedPairSet;
        }
        return function(leftGlyph, rightGlyph) {
            var pairs = pairSet[leftGlyph];
            if (pairs) return pairs[rightGlyph];
        };
    }
    else if (format === 2) {
        // Pair Positioning Adjustment: Format 2
        var classDef1Offset, classDef2Offset, class1Count, class2Count, i, j,
            getClass1, getClass2, kerningMatrix, kerningRow, covered;
        classDef1Offset = p.parseUShort();
        classDef2Offset = p.parseUShort();
        class1Count = p.parseUShort();
        class2Count = p.parseUShort();
        getClass1 = parseClassDefTable(data, start+classDef1Offset);
        getClass2 = parseClassDefTable(data, start+classDef2Offset);

        // Parse kerning values by class pair.
        kerningMatrix = [];
        for (i = 0; i < class1Count; i++) {
            kerningRow = kerningMatrix[i] = [];
            for (j = 0; j < class2Count; j++) {
                if (valueFormat1) value1 = p.parseShort();
                if (valueFormat2) value2 = p.parseShort();
                // We only support valueFormat1 = 4 and valueFormat2 = 0,
                // so value1 is the XAdvance and value2 is empty.
                kerningRow[j] = value1;
            }
        }

        // Convert coverage list to a hash
        covered = {};
        for(i = 0; i < coverage.length; i++) covered[coverage[i]] = 1;

        // Get the kerning value for a specific glyph pair.
        return function(leftGlyph, rightGlyph) {
            if (!covered[leftGlyph]) return null;
            var class1 = getClass1(leftGlyph),
                class2 = getClass2(rightGlyph),
                kerningRow = kerningMatrix[class1];
            return kerningRow ? kerningRow[class2] : null;
        };
    }
}

// Parse a LookupTable (present in of GPOS, GSUB, GDEF, BASE, JSTF tables).
function parseLookupTable(data, start) {
    var p = new parse.Parser(data, start);
    var table, lookupType, lookupFlag, useMarkFilteringSet, subTableCount, subTableOffsets, subtables, i;
    lookupType = p.parseUShort();
    lookupFlag = p.parseUShort();
    useMarkFilteringSet = lookupFlag & 0x10;
    subTableCount = p.parseUShort();
    subTableOffsets = p.parseOffset16List(subTableCount);
    table = {
        lookupType: lookupType,
        lookupFlag: lookupFlag,
        markFilteringSet: useMarkFilteringSet ? p.parseUShort() : -1
    };
    // LookupType 2, Pair adjustment
    if (lookupType === 2) {
        subtables = [];
        for (i = 0; i < subTableCount; i++) {
            subtables.push(parsePairPosSubTable(data, start + subTableOffsets[i]));
        }
        // Return a function which finds the kerning values in the subtables.
        table.getKerningValue = function(leftGlyph, rightGlyph) {
            for (var i = subtables.length; i--;) {
                var value = subtables[i](leftGlyph, rightGlyph);
                if (value !== undefined) return value;
            }
            return 0;
        };
    }
    return table;
}

// Parse the `GPOS` table which contains, among other things, kerning pairs.
// https://www.microsoft.com/typography/OTSPEC/gpos.htm
function parseGposTable(data, start, font) {
    var p, tableVersion, lookupListOffset, scriptList, i, featureList, lookupCount,
        lookupTableOffsets, lookupListAbsoluteOffset, table;

    p = new parse.Parser(data, start);
    tableVersion = p.parseFixed();
    check.argument(tableVersion === 1, 'Unsupported GPOS table version.');

    // ScriptList and FeatureList - ignored for now
    scriptList = parseTaggedListTable(data, start+p.parseUShort());
    // 'kern' is the feature we are looking for.
    featureList = parseTaggedListTable(data, start+p.parseUShort());

    // LookupList
    lookupListOffset = p.parseUShort();
    p.relativeOffset = lookupListOffset;
    lookupCount = p.parseUShort();
    lookupTableOffsets = p.parseOffset16List(lookupCount);
    lookupListAbsoluteOffset = start + lookupListOffset;
    for (i = 0; i < lookupCount; i++) {
        table = parseLookupTable(data, lookupListAbsoluteOffset + lookupTableOffsets[i]);
        if (table.lookupType === 2 && !font.getGposKerningValue) font.getGposKerningValue = table.getKerningValue;
    }
}

exports.parse = parseGposTable;

},{"../check":1,"../parse":7}],14:[function(require,module,exports){
// The `head` table contains global information about the font.
// https://www.microsoft.com/typography/OTSPEC/head.htm



var check = require('../check');
var parse = require('../parse');
var table = require('../table');

// Parse the header `head` table
function parseHeadTable(data, start) {
    var head = {},
        p = new parse.Parser(data, start);
    head.version = p.parseVersion();
    head.fontRevision = Math.round(p.parseFixed() * 1000) / 1000;
    head.checkSumAdjustment = p.parseULong();
    head.magicNumber = p.parseULong();
    check.argument(head.magicNumber === 0x5F0F3CF5, 'Font header has wrong magic number.');
    head.flags = p.parseUShort();
    head.unitsPerEm = p.parseUShort();
    head.created = p.parseLongDateTime();
    head.modified = p.parseLongDateTime();
    head.xMin = p.parseShort();
    head.yMin = p.parseShort();
    head.xMax = p.parseShort();
    head.yMax = p.parseShort();
    head.macStyle = p.parseUShort();
    head.lowestRecPPEM = p.parseUShort();
    head.fontDirectionHint = p.parseShort();
    head.indexToLocFormat = p.parseShort();     // 50
    head.glyphDataFormat = p.parseShort();
    return head;
}

function makeHeadTable(options) {
    return new table.Table('head', [
        {name: 'version', type: 'FIXED', value: 0x00010000},
        {name: 'fontRevision', type: 'FIXED', value: 0x00010000},
        {name: 'checkSumAdjustment', type: 'ULONG', value: 0},
        {name: 'magicNumber', type: 'ULONG', value: 0x5F0F3CF5},
        {name: 'flags', type: 'USHORT', value: 0},
        {name: 'unitsPerEm', type: 'USHORT', value: 1000},
        {name: 'created', type: 'LONGDATETIME', value: 0},
        {name: 'modified', type: 'LONGDATETIME', value: 0},
        {name: 'xMin', type: 'SHORT', value: 0},
        {name: 'yMin', type: 'SHORT', value: 0},
        {name: 'xMax', type: 'SHORT', value: 0},
        {name: 'yMax', type: 'SHORT', value: 0},
        {name: 'macStyle', type: 'USHORT', value: 0},
        {name: 'lowestRecPPEM', type: 'USHORT', value: 0},
        {name: 'fontDirectionHint', type: 'SHORT', value: 2},
        {name: 'indexToLocFormat', type: 'SHORT', value: 0},
        {name: 'glyphDataFormat', type: 'SHORT', value: 0}
    ], options);
}

exports.parse = parseHeadTable;
exports.make = makeHeadTable;

},{"../check":1,"../parse":7,"../table":9}],15:[function(require,module,exports){
// The `hhea` table contains information for horizontal layout.
// https://www.microsoft.com/typography/OTSPEC/hhea.htm



var parse = require('../parse');
var table = require('../table');

// Parse the horizontal header `hhea` table
function parseHheaTable(data, start) {
    var hhea = {},
        p = new parse.Parser(data, start);
    hhea.version = p.parseVersion();
    hhea.ascender = p.parseShort();
    hhea.descender = p.parseShort();
    hhea.lineGap = p.parseShort();
    hhea.advanceWidthMax = p.parseUShort();
    hhea.minLeftSideBearing = p.parseShort();
    hhea.minRightSideBearing = p.parseShort();
    hhea.xMaxExtent = p.parseShort();
    hhea.caretSlopeRise = p.parseShort();
    hhea.caretSlopeRun = p.parseShort();
    hhea.caretOffset = p.parseShort();
    p.relativeOffset += 8;
    hhea.metricDataFormat = p.parseShort();
    hhea.numberOfHMetrics = p.parseUShort();
    return hhea;
}

function makeHheaTable(options) {
    return new table.Table('hhea', [
        {name: 'version', type: 'FIXED', value: 0x00010000},
        {name: 'ascender', type: 'FWORD', value: 0},
        {name: 'descender', type: 'FWORD', value: 0},
        {name: 'lineGap', type: 'FWORD', value: 0},
        {name: 'advanceWidthMax', type: 'UFWORD', value: 0},
        {name: 'minLeftSideBearing', type: 'FWORD', value: 0},
        {name: 'minRightSideBearing', type: 'FWORD', value: 0},
        {name: 'xMaxExtent', type: 'FWORD', value: 0},
        {name: 'caretSlopeRise', type: 'SHORT', value: 1},
        {name: 'caretSlopeRun', type: 'SHORT', value: 0},
        {name: 'caretOffset', type: 'SHORT', value: 0},
        {name: 'reserved1', type: 'SHORT', value: 0},
        {name: 'reserved2', type: 'SHORT', value: 0},
        {name: 'reserved3', type: 'SHORT', value: 0},
        {name: 'reserved4', type: 'SHORT', value: 0},
        {name: 'metricDataFormat', type: 'SHORT', value: 0},
        {name: 'numberOfHMetrics', type: 'USHORT', value: 0}
    ], options);
}

exports.parse = parseHheaTable;
exports.make = makeHheaTable;

},{"../parse":7,"../table":9}],16:[function(require,module,exports){
// The `hmtx` table contains the horizontal metrics for all glyphs.
// https://www.microsoft.com/typography/OTSPEC/hmtx.htm



var parse = require('../parse');
var table = require('../table');

// Parse the `hmtx` table, which contains the horizontal metrics for all glyphs.
// This function augments the glyph array, adding the advanceWidth and leftSideBearing to each glyph.
function parseHmtxTable(data, start, numMetrics, numGlyphs, glyphs) {
    var p, i, glyph, advanceWidth, leftSideBearing;
    p = new parse.Parser(data, start);
    for (i = 0; i < numGlyphs; i += 1) {
        // If the font is monospaced, only one entry is needed. This last entry applies to all subsequent glyphs.
        if (i < numMetrics) {
            advanceWidth = p.parseUShort();
            leftSideBearing = p.parseShort();
        }
        glyph = glyphs[i];
        glyph.advanceWidth = advanceWidth;
        glyph.leftSideBearing = leftSideBearing;
    }
}

function makeHmtxTable(glyphs) {
    var t = new table.Table('hmtx', []);
    for (var i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs[i];
        var advanceWidth = glyph.advanceWidth || 0;
        var leftSideBearing = glyph.leftSideBearing || 0;
        t.fields.push({name: 'advanceWidth_' + i, type: 'USHORT', value: advanceWidth});
        t.fields.push({name: 'leftSideBearing_' + i, type: 'SHORT', value: leftSideBearing});
    }
    return t;
}

exports.parse = parseHmtxTable;
exports.make = makeHmtxTable;




},{"../parse":7,"../table":9}],17:[function(require,module,exports){
// The `kern` table contains kerning pairs.
// Note that some fonts use the GPOS OpenType layout table to specify kerning.
// https://www.microsoft.com/typography/OTSPEC/kern.htm



var check = require('../check');
var parse = require('../parse');

// Parse the `kern` table which contains kerning pairs.
function parseKernTable(data, start) {
    var pairs, p, tableVersion, subTableVersion, nPairs,
        i, leftIndex, rightIndex, value;
    pairs = {};
    p = new parse.Parser(data, start);
    tableVersion = p.parseUShort();
    check.argument(tableVersion === 0, 'Unsupported kern table version.');
    // Skip nTables.
    p.skip('uShort', 1);
    subTableVersion = p.parseUShort();
    check.argument(subTableVersion === 0, 'Unsupported kern sub-table version.');
    // Skip subTableLength, subTableCoverage
    p.skip('uShort', 2);
    nPairs = p.parseUShort();
    // Skip searchRange, entrySelector, rangeShift.
    p.skip('uShort', 3);
    for (i = 0; i < nPairs; i += 1) {
        leftIndex = p.parseUShort();
        rightIndex = p.parseUShort();
        value = p.parseShort();
        pairs[leftIndex + ',' + rightIndex] = value;
    }
    return pairs;
}

exports.parse = parseKernTable;

},{"../check":1,"../parse":7}],18:[function(require,module,exports){
// The `loca` table stores the offsets to the locations of the glyphs in the font.
// https://www.microsoft.com/typography/OTSPEC/loca.htm



var parse = require('../parse');

// Parse the `loca` table. This table stores the offsets to the locations of the glyphs in the font,
// relative to the beginning of the glyphData table.
// The number of glyphs stored in the `loca` table is specified in the `maxp` table (under numGlyphs)
// The loca table has two versions: a short version where offsets are stored as uShorts, and a long
// version where offsets are stored as uLongs. The `head` table specifies which version to use
// (under indexToLocFormat).
function parseLocaTable(data, start, numGlyphs, shortVersion) {
    var p, parseFn, glyphOffsets, glyphOffset, i;
    p = new parse.Parser(data, start);
    parseFn = shortVersion ? p.parseUShort : p.parseULong;
    // There is an extra entry after the last index element to compute the length of the last glyph.
    // That's why we use numGlyphs + 1.
    glyphOffsets = [];
    for (i = 0; i < numGlyphs + 1; i += 1) {
        glyphOffset = parseFn.call(p);
        if (shortVersion) {
            // The short table version stores the actual offset divided by 2.
            glyphOffset *= 2;
        }
        glyphOffsets.push(glyphOffset);
    }
    return glyphOffsets;
}

exports.parse = parseLocaTable;

},{"../parse":7}],19:[function(require,module,exports){
// The `maxp` table establishes the memory requirements for the font.
// We need it just to get the number of glyphs in the font.
// https://www.microsoft.com/typography/OTSPEC/maxp.htm



var parse = require('../parse');
var table = require('../table');

// Parse the maximum profile `maxp` table.
function parseMaxpTable(data, start) {
    var maxp = {},
        p = new parse.Parser(data, start);
    maxp.version = p.parseVersion();
    maxp.numGlyphs = p.parseUShort();
    if (maxp.version === 1.0) {
        maxp.maxPoints = p.parseUShort();
        maxp.maxContours = p.parseUShort();
        maxp.maxCompositePoints = p.parseUShort();
        maxp.maxCompositeContours = p.parseUShort();
        maxp.maxZones = p.parseUShort();
        maxp.maxTwilightPoints = p.parseUShort();
        maxp.maxStorage = p.parseUShort();
        maxp.maxFunctionDefs = p.parseUShort();
        maxp.maxInstructionDefs = p.parseUShort();
        maxp.maxStackElements = p.parseUShort();
        maxp.maxSizeOfInstructions = p.parseUShort();
        maxp.maxComponentElements = p.parseUShort();
        maxp.maxComponentDepth = p.parseUShort();
    }
    return maxp;
}

function makeMaxpTable(numGlyphs) {
    return new table.Table('maxp', [
        {name: 'version', type: 'FIXED', value: 0x00005000},
        {name: 'numGlyphs', type: 'USHORT', value: numGlyphs}
    ]);
}

exports.parse = parseMaxpTable;
exports.make = makeMaxpTable;

},{"../parse":7,"../table":9}],20:[function(require,module,exports){
// The `name` naming table.
// https://www.microsoft.com/typography/OTSPEC/name.htm



var encode = require('../types').encode;
var parse = require('../parse');
var table = require('../table');

// NameIDs for the name table.
var nameTableNames = [
    'copyright',              // 0
    'fontFamily',             // 1
    'fontSubfamily',          // 2
    'uniqueID',               // 3
    'fullName',               // 4
    'version',                // 5
    'postScriptName',         // 6
    'trademark',              // 7
    'manufacturer',           // 8
    'designer',               // 9
    'description',            // 10
    'manufacturerURL',        // 11
    'designerURL',            // 12
    'licence',                // 13
    'licenceURL',             // 14
    'reserved',               // 15
    'preferredFamily',        // 16
    'preferredSubfamily',     // 17
    'compatibleFullName',     // 18
    'sampleText',             // 19
    'postScriptFindFontName', // 20
    'wwsFamily',              // 21
    'wwsSubfamily'            // 22
];

// Parse the naming `name` table
// Only Windows Unicode English names are supported.
// Format 1 additional fields are not supported
function parseNameTable(data, start) {
    var name = {},
        p = new parse.Parser(data, start);
    name.format = p.parseUShort();
    var count = p.parseUShort(),
        stringOffset = p.offset + p.parseUShort();
    var platformID, encodingID, languageID, nameID, property, byteLength,
        offset, str, i, j, codePoints;
    var unknownCount = 0;
    for(i = 0; i < count; i++) {
        platformID = p.parseUShort();
        encodingID = p.parseUShort();
        languageID = p.parseUShort();
        nameID = p.parseUShort();
        property = nameTableNames[nameID];
        byteLength = p.parseUShort();
        offset = p.parseUShort();
        // platformID - encodingID - languageID standard combinations :
        // 1 - 0 - 0 : Macintosh, Roman, English
        // 3 - 1 - 0x409 : Windows, Unicode BMP (UCS-2), en-US
        if (platformID === 3 && encodingID === 1 && languageID === 0x409) {
            codePoints = [];
            var length = byteLength/2;
            for(j = 0; j < length; j++, offset += 2) {
                codePoints[j] = parse.getShort(data, stringOffset+offset);
            }
            str = String.fromCharCode.apply(null, codePoints);
            if (property) {
                name[property] = str;
            }
            else {
                unknownCount++;
                name['unknown'+unknownCount] = str;
            }
        }

    }
    if (name.format === 1) {
        name.langTagCount = p.parseUShort();
    }
    return name;
}

function makeNameRecord(platformID, encodingID, languageID, nameID, length, offset) {
    return new table.Table('NameRecord', [
        {name: 'platformID', type: 'USHORT', value: platformID},
        {name: 'encodingID', type: 'USHORT', value: encodingID},
        {name: 'languageID', type: 'USHORT', value: languageID},
        {name: 'nameID', type: 'USHORT', value: nameID},
        {name: 'length', type: 'USHORT', value: length},
        {name: 'offset', type: 'USHORT', value: offset}
    ]);
}

function addMacintoshNameRecord(t, recordID, s, offset) {
    // Macintosh, Roman, English
    var stringBytes = encode.STRING(s);
    t.records.push(makeNameRecord(1, 0, 0, recordID, stringBytes.length, offset));
    t.strings.push(stringBytes);
    offset += stringBytes.length;
    return offset;
}

function addWindowsNameRecord(t, recordID, s, offset) {
    // Windows, Unicode BMP (UCS-2), US English
    var utf16Bytes = encode.UTF16(s);
    t.records.push(makeNameRecord(3, 1, 0x0409, recordID, utf16Bytes.length, offset));
    t.strings.push(utf16Bytes);
    offset += utf16Bytes.length;
    return offset;
}

function makeNameTable(options) {
    var i, s;
    var t = new table.Table('name', [
        {name: 'format', type: 'USHORT', value: 0},
        {name: 'count', type: 'USHORT', value: 0},
        {name: 'stringOffset', type: 'USHORT', value: 0}
    ]);
    t.records = [];
    t.strings = [];
    var offset = 0;
    // Add Macintosh records first
    for (i = 0; i < nameTableNames.length; i += 1) {
        if (options[nameTableNames[i]] !== undefined) {
            s = options[nameTableNames[i]];
            offset = addMacintoshNameRecord(t, i, s, offset);
        }
    }
    // Then add Windows records
    for (i = 0; i < nameTableNames.length; i += 1) {
        if (options[nameTableNames[i]] !== undefined) {
            s = options[nameTableNames[i]];
            offset = addWindowsNameRecord(t, i, s, offset);
        }
    }

    t.count = t.records.length;
    t.stringOffset = 6 + t.count * 12;
    for (i = 0; i < t.records.length; i += 1) {
        t.fields.push({name: 'record_' + i, type: 'TABLE', value: t.records[i]});
    }
    for (i = 0; i < t.strings.length; i += 1) {
        t.fields.push({name: 'string_' + i, type: 'LITERAL', value: t.strings[i]});
    }
    return t;
}

exports.parse = parseNameTable;
exports.make = makeNameTable;

},{"../parse":7,"../table":9,"../types":24}],21:[function(require,module,exports){
// The `OS/2` table contains metrics required in OpenType fonts.
// https://www.microsoft.com/typography/OTSPEC/os2.htm



var parse = require('../parse');
var table = require('../table');

// Parse the OS/2 and Windows metrics `OS/2` table
function parseOS2Table(data, start) {
    var os2 = {},
        p = new parse.Parser(data, start);
    os2.version = p.parseUShort();
    os2.xAvgCharWidth = p.parseShort();
    os2.usWeightClass = p.parseUShort();
    os2.usWidthClass = p.parseUShort();
    os2.fsType = p.parseUShort();
    os2.ySubscriptXSize = p.parseShort();
    os2.ySubscriptYSize = p.parseShort();
    os2.ySubscriptXOffset = p.parseShort();
    os2.ySubscriptYOffset = p.parseShort();
    os2.ySuperscriptXSize = p.parseShort();
    os2.ySuperscriptYSize = p.parseShort();
    os2.ySuperscriptXOffset = p.parseShort();
    os2.ySuperscriptYOffset = p.parseShort();
    os2.yStrikeoutSize = p.parseShort();
    os2.yStrikeoutPosition = p.parseShort();
    os2.sFamilyClass = p.parseShort();
    os2.panose = [];
    for (var i = 0; i < 10; i++) {
        os2.panose[i] = p.parseByte();
    }
    os2.ulUnicodeRange1 = p.parseULong();
    os2.ulUnicodeRange2 = p.parseULong();
    os2.ulUnicodeRange3 = p.parseULong();
    os2.ulUnicodeRange4 = p.parseULong();
    os2.achVendID = String.fromCharCode(p.parseByte(), p.parseByte(), p.parseByte(), p.parseByte());
    os2.fsSelection = p.parseUShort();
    os2.usFirstCharIndex = p.parseUShort();
    os2.usLastCharIndex = p.parseUShort();
    os2.sTypoAscender = p.parseShort();
    os2.sTypoDescender = p.parseShort();
    os2.sTypoLineGap = p.parseShort();
    os2.usWinAscent = p.parseUShort();
    os2.usWinDescent = p.parseUShort();
    if (os2.version >= 1) {
        os2.ulCodePageRange1 = p.parseULong();
        os2.ulCodePageRange2 = p.parseULong();
    }
    if (os2.version >= 2) {
        os2.sxHeight = p.parseShort();
        os2.sCapHeight = p.parseShort();
        os2.usDefaultChar = p.parseUShort();
        os2.usBreakChar = p.parseUShort();
        os2.usMaxContent = p.parseUShort();
    }
    return os2;
}

function makeOS2Table(options) {
    return new table.Table('OS/2', [
        {name: 'version', type: 'USHORT', value: 0x0003},
        {name: 'xAvgCharWidth', type: 'SHORT', value: 0},
        {name: 'usWeightClass', type: 'USHORT', value: 0},
        {name: 'usWidthClass', type: 'USHORT', value: 0},
        {name: 'fsType', type: 'USHORT', value: 0},
        {name: 'ySubscriptXSize', type: 'SHORT', value: 0},
        {name: 'ySubscriptYSize', type: 'SHORT', value: 0},
        {name: 'ySubscriptXOffset', type: 'SHORT', value: 0},
        {name: 'ySubscriptYOffset', type: 'SHORT', value: 0},
        {name: 'ySuperscriptXSize', type: 'SHORT', value: 0},
        {name: 'ySuperscriptYSize', type: 'SHORT', value: 0},
        {name: 'ySuperscriptXOffset', type: 'SHORT', value: 0},
        {name: 'ySuperscriptYOffset', type: 'SHORT', value: 0},
        {name: 'yStrikeoutSize', type: 'SHORT', value: 0},
        {name: 'yStrikeoutPosition', type: 'SHORT', value: 0},
        {name: 'sFamilyClass', type: 'SHORT', value: 0},
        {name: 'bFamilyType', type: 'BYTE', value: 0},
        {name: 'bSerifStyle', type: 'BYTE', value: 0},
        {name: 'bWeight', type: 'BYTE', value: 0},
        {name: 'bProportion', type: 'BYTE', value: 0},
        {name: 'bContrast', type: 'BYTE', value: 0},
        {name: 'bStrokeVariation', type: 'BYTE', value: 0},
        {name: 'bArmStyle', type: 'BYTE', value: 0},
        {name: 'bLetterform', type: 'BYTE', value: 0},
        {name: 'bMidline', type: 'BYTE', value: 0},
        {name: 'bXHeight', type: 'BYTE', value: 0},
        {name: 'ulUnicodeRange1', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange2', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange3', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange4', type: 'ULONG', value: 0},
        {name: 'achVendID', type: 'CHARARRAY', value: 'XXXX'},
        {name: 'fsSelection', type: 'USHORT', value: 0},
        {name: 'usFirstCharIndex', type: 'USHORT', value: 0},
        {name: 'usLastCharIndex', type: 'USHORT', value: 0},
        {name: 'sTypoAscender', type: 'SHORT', value: 0},
        {name: 'sTypoDescender', type: 'SHORT', value: 0},
        {name: 'sTypoLineGap', type: 'SHORT', value: 0},
        {name: 'usWinAscent', type: 'USHORT', value: 0},
        {name: 'usWinDescent', type: 'USHORT', value: 0},
        {name: 'ulCodePageRange1', type: 'ULONG', value: 0},
        {name: 'ulCodePageRange2', type: 'ULONG', value: 0},
        {name: 'sxHeight', type: 'SHORT', value: 0},
        {name: 'sCapHeight', type: 'SHORT', value: 0},
        {name: 'usDefaultChar', type: 'USHORT', value: 0},
        {name: 'usBreakChar', type: 'USHORT', value: 0},
        {name: 'usMaxContext', type: 'USHORT', value: 0}
    ], options);
}

exports.parse = parseOS2Table;
exports.make = makeOS2Table;

},{"../parse":7,"../table":9}],22:[function(require,module,exports){
// The `post` table stores additional PostScript information, such as glyph names.
// https://www.microsoft.com/typography/OTSPEC/post.htm



var encoding = require('../encoding');
var parse = require('../parse');
var table = require('../table');

// Parse the PostScript `post` table
function parsePostTable(data, start) {
    var post = {},
        p = new parse.Parser(data, start),
        i, nameLength;
    post.version = p.parseVersion();
    post.italicAngle = p.parseFixed();
    post.underlinePosition = p.parseShort();
    post.underlineThickness = p.parseShort();
    post.isFixedPitch = p.parseULong();
    post.minMemType42 = p.parseULong();
    post.maxMemType42 = p.parseULong();
    post.minMemType1 = p.parseULong();
    post.maxMemType1 = p.parseULong();
    switch (post.version) {
    case 1:
        post.names = encoding.standardNames.slice();
        break;
    case 2:
        post.numberOfGlyphs = p.parseUShort();
        post.glyphNameIndex = new Array(post.numberOfGlyphs);
        for (i = 0; i < post.numberOfGlyphs; i++) {
            post.glyphNameIndex[i] = p.parseUShort();
        }
        post.names = [];
        for (i = 0; i < post.numberOfGlyphs; i++) {
            if (post.glyphNameIndex[i] >= encoding.standardNames.length) {
                nameLength = p.parseChar();
                post.names.push(p.parseString(nameLength));
            }
        }
        break;
    case 2.5:
        post.numberOfGlyphs = p.parseUShort();
        post.offset = new Array(post.numberOfGlyphs);
        for (i = 0; i < post.numberOfGlyphs; i++) {
            post.offset[i] = p.parseChar();
        }
        break;
    }
    return post;
}

function makePostTable() {
    return new table.Table('post', [
        {name: 'version', type: 'FIXED', value: 0x00030000},
        {name: 'italicAngle', type: 'FIXED', value: 0},
        {name: 'underlinePosition', type: 'FWORD', value: 0},
        {name: 'underlineThickness', type: 'FWORD', value: 0},
        {name: 'isFixedPitch', type: 'ULONG', value: 0},
        {name: 'minMemType42', type: 'ULONG', value: 0},
        {name: 'maxMemType42', type: 'ULONG', value: 0},
        {name: 'minMemType1', type: 'ULONG', value: 0},
        {name: 'maxMemType1', type: 'ULONG', value: 0}
    ]);
}

exports.parse = parsePostTable;
exports.make = makePostTable;

},{"../encoding":3,"../parse":7,"../table":9}],23:[function(require,module,exports){
// The `sfnt` wrapper provides organization for the tables in the font.
// It is the top-level data structure in a font.
// https://www.microsoft.com/typography/OTSPEC/otff.htm
// Recommendations for creating OpenType Fonts:
// http://www.microsoft.com/typography/otspec140/recom.htm



var check = require('../check');
var table = require('../table');

var cmap = require('./cmap');
var cff = require('./cff');
var head = require('./head');
var hhea = require('./hhea');
var hmtx = require('./hmtx');
var maxp = require('./maxp');
var _name = require('./name');
var os2 = require('./os2');
var post = require('./post');

function log2(v) {
    return Math.log(v) / Math.log(2) | 0;
}

function computeCheckSum(bytes) {
    while (bytes.length % 4 !== 0) {
        bytes.push(0);
    }
    var sum = 0;
    for (var i = 0; i < bytes.length; i += 4) {
        sum += (bytes[i] << 24) +
            (bytes[i + 1] << 16) +
            (bytes[i + 2] << 8) +
            (bytes[i + 3]);
    }
    sum %= Math.pow(2, 32);
    return sum;
}

function makeTableRecord(tag, checkSum, offset, length) {
    return new table.Table('Table Record', [
        {name: 'tag', type: 'TAG', value: tag !== undefined ? tag : ''},
        {name: 'checkSum', type: 'ULONG', value: checkSum !== undefined ? checkSum : 0},
        {name: 'offset', type: 'ULONG', value: offset !== undefined ? offset : 0},
        {name: 'length', type: 'ULONG', value: length !== undefined ? length : 0}
    ]);
}

function makeSfntTable(tables) {
    var sfnt = new table.Table('sfnt', [
        {name: 'version', type: 'TAG', value: 'OTTO'},
        {name: 'numTables', type: 'USHORT', value: 0},
        {name: 'searchRange', type: 'USHORT', value: 0},
        {name: 'entrySelector', type: 'USHORT', value: 0},
        {name: 'rangeShift', type: 'USHORT', value: 0}
    ]);
    sfnt.tables = tables;
    sfnt.numTables = tables.length;
    var highestPowerOf2 = Math.pow(2, log2(sfnt.numTables));
    sfnt.searchRange = 16 * highestPowerOf2;
    sfnt.entrySelector = log2(highestPowerOf2);
    sfnt.rangeShift = sfnt.numTables * 16 - sfnt.searchRange;

    var recordFields = [];
    var tableFields = [];

    var offset = sfnt.sizeOf() + (makeTableRecord().sizeOf() * sfnt.numTables);
    while (offset % 4 !== 0) {
        offset += 1;
        tableFields.push({name: 'padding', type: 'BYTE', value: 0});
    }

    for (var i = 0; i < tables.length; i += 1) {
        var t = tables[i];
        check.argument(t.tableName.length === 4, 'Table name' + t.tableName + ' is invalid.');
        var tableLength = t.sizeOf();
        var tableRecord = makeTableRecord(t.tableName, computeCheckSum(t.encode()), offset, tableLength);
        recordFields.push({name: tableRecord.tag + ' Table Record', type: 'TABLE', value: tableRecord});
        tableFields.push({name: t.tableName + ' table', type: 'TABLE', value: t});
        offset += tableLength;
        check.argument(!isNaN(offset), 'Something went wrong calculating the offset.');
        while (offset % 4 !== 0) {
            offset += 1;
            tableFields.push({name: 'padding', type: 'BYTE', value: 0});
        }
    }

    // Table records need to be sorted alphabetically.
    recordFields.sort(function (r1, r2) {
        if (r1.value.tag > r2.value.tag) {
            return 1;
        } else {
            return -1;
        }
    });

    sfnt.fields = sfnt.fields.concat(recordFields);
    sfnt.fields = sfnt.fields.concat(tableFields);
    return sfnt;
}

// Get the metrics for a character. If the string has more than one character
// this function returns metrics for the first available character.
// You can provide optional fallback metrics if no characters are available.
function metricsForChar(font, chars, notFoundMetrics) {
    for (var i = 0; i < chars.length; i += 1) {
        var glyphIndex = font.charToGlyphIndex(chars[i]);
        if (glyphIndex > 0) {
            var glyph = font.glyphs[glyphIndex];
            return glyph.getMetrics();
        }
    }
    return notFoundMetrics;
}

// Return the smallest and largest unicode values of the characters in this font.
// For most fonts the smallest value would be 20 (space).
function charCodeBounds(glyphs) {
    var minCode, maxCode;
    for (var i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs[i];
        if (glyph.unicode >= 20) {
            if (minCode === undefined) {
                minCode = glyph.unicode;
            } else if (glyph.unicode < minCode) {
                minCode = glyph.unicode;
            }
            if (maxCode === undefined) {
                maxCode = glyph.unicode;
            } else if (glyph.unicode > maxCode) {
                maxCode = glyph.unicode;
            }
        }
    }
    return [minCode, maxCode];
}

function average(vs) {
    var sum = 0;
    for (var i = 0; i < vs.length; i += 1) {
        sum += vs[i];
    }
    return sum / vs.length;
}

// Convert the font object to a SFNT data structure.
// This structure contains all the necessary tables and metadata to create a binary OTF file.
function fontToSfntTable(font) {
    var xMins = [];
    var yMins = [];
    var xMaxs = [];
    var yMaxs = [];
    var advanceWidths = [];
    var leftSideBearings = [];
    var rightSideBearings = [];
    for (var i = 0; i < font.glyphs.length; i += 1) {
        var glyph = font.glyphs[i];
        // Skip non-important characters.
        if (glyph.name === '.notdef') continue;
        var metrics = glyph.getMetrics();
        xMins.push(metrics.xMin);
        yMins.push(metrics.yMin);
        xMaxs.push(metrics.xMax);
        yMaxs.push(metrics.yMax);
        leftSideBearings.push(metrics.leftSideBearing);
        rightSideBearings.push(metrics.rightSideBearing);
        advanceWidths.push(glyph.advanceWidth);
    }
    var globals = {
        xMin: Math.min.apply(null, xMins),
        yMin: Math.min.apply(null, yMins),
        xMax: Math.max.apply(null, xMaxs),
        yMax: Math.max.apply(null, yMaxs),
        advanceWidthMax: Math.max.apply(null, advanceWidths),
        advanceWidthAvg: average(advanceWidths),
        minLeftSideBearing: Math.min.apply(null, leftSideBearings),
        maxLeftSideBearing: Math.max.apply(null, leftSideBearings),
        minRightSideBearing: Math.min.apply(null, rightSideBearings)
    };
    globals.ascender = globals.yMax;
    globals.descender = globals.yMin;

    var headTable = head.make({
        unitsPerEm: font.unitsPerEm,
        xMin: globals.xMin,
        yMin: globals.yMin,
        xMax: globals.xMax,
        yMax: globals.yMax
    });

    var hheaTable = hhea.make({
        // Adding a little here makes OS X Quick Look happy
        ascender: globals.ascender,
        descender: globals.descender,
        advanceWidthMax: globals.advanceWidthMax,
        minLeftSideBearing: globals.minLeftSideBearing,
        minRightSideBearing: globals.minRightSideBearing,
        xMaxExtent: globals.maxLeftSideBearing + (globals.xMax - globals.xMin),
        numberOfHMetrics: font.glyphs.length
    });

    var maxpTable = maxp.make(font.glyphs.length);

    var codeBounds = charCodeBounds(font.glyphs);
    var os2Table = os2.make({
        xAvgCharWidth: Math.round(globals.advanceWidthAvg),
        usWeightClass: 500, // Medium FIXME Make this configurable
        usWidthClass: 5, // Medium (normal) FIXME Make this configurable
        usFirstCharIndex: codeBounds[0],
        usLastCharIndex: codeBounds[1],
        ulUnicodeRange1: 0x00000001, // Basic Latin
        // See http://typophile.com/node/13081 for more info on vertical metrics.
        // We get metrics for typical characters (such as "x" for xHeight).
        // We provide some fallback characters if characters are unavailable: their
        // ordering was chosen experimentally.
        sTypoAscender: globals.ascender,
        sTypoDescender: globals.descender,
        sTypoLineGap: 0,
        usWinAscent: globals.ascender,
        usWinDescent: -globals.descender,
        ulCodePageRange1: 0x00000001, // Basic Latin
        sxHeight: metricsForChar(font, 'xyvw', {yMax: 0}).yMax,
        sCapHeight: metricsForChar(font, 'HIKLEFJMNTZBDPRAGOQSUVWXY', globals).yMax,
        usBreakChar: font.hasChar(' ') ? 32 : 0 // Use space as the break character, if available.
    });


    var hmtxTable = hmtx.make(font.glyphs);
    var cmapTable = cmap.make(font.glyphs);

    var fullName = font.familyName + ' ' + font.styleName;
    var postScriptName = font.familyName.replace(/\s/g, '') + '-' + font.styleName;
    var nameTable = _name.make({
        copyright: font.copyright,
        fontFamily: font.familyName,
        fontSubfamily: font.styleName,
        uniqueID: font.manufacturer + ':' + fullName,
        fullName: fullName,
        version: font.version,
        postScriptName: postScriptName,
        trademark: font.trademark,
        manufacturer: font.manufacturer,
        designer: font.designer,
        description: font.description,
        manufacturerURL: font.manufacturerURL,
        designerURL: font.designerURL,
        license: font.license,
        licenseURL: font.licenseURL,
        preferredFamily: font.familyName,
        preferredSubfamily: font.styleName
    });
    var postTable = post.make();
    var cffTable = cff.make(font.glyphs, {
        version: font.version,
        fullName: fullName,
        familyName: font.familyName,
        weightName: font.styleName,
        postScriptName: postScriptName
    });
    // Order the tables according to the the OpenType specification 1.4.
    var tables = [headTable, hheaTable, maxpTable, os2Table, nameTable, cmapTable, postTable, cffTable, hmtxTable];

    var sfntTable = makeSfntTable(tables);

    var bytes = sfntTable.encode();
    var checkSum = computeCheckSum(bytes);
    headTable.checkSumAdjustment = 0xB1B0AFBA - checkSum;

    // Build the font again, now with the proper checkSum.
    sfntTable = makeSfntTable(tables);

    return sfntTable;
}

exports.computeCheckSum = computeCheckSum;
exports.make = makeSfntTable;
exports.fontToTable = fontToSfntTable;

},{"../check":1,"../table":9,"./cff":10,"./cmap":11,"./head":14,"./hhea":15,"./hmtx":16,"./maxp":19,"./name":20,"./os2":21,"./post":22}],24:[function(require,module,exports){
// Data types used in the OpenType font file.
// All OpenType fonts use Motorola-style byte ordering (Big Endian)

/* global WeakMap */



var check = require('./check');

var LIMIT16 = 32768; // The limit at which a 16-bit number switches signs == 2^15
var LIMIT32 = 2147483648; // The limit at which a 32-bit number switches signs == 2 ^ 31

var decode = {};
var encode = {};
var sizeOf = {};

// Return a function that always returns the same value.
function constant(v) {
    return function () {
        return v;
    };
}

// OpenType data types //////////////////////////////////////////////////////

// Convert an 8-bit unsigned integer to a list of 1 byte.
encode.BYTE = function (v) {
    check.argument(v >= 0 && v <= 255, 'Byte value should be between 0 and 255.');
    return [v];
};

sizeOf.BYTE = constant(1);

// Convert a 8-bit signed integer to a list of 1 byte.
encode.CHAR = function (v) {
    return [v.charCodeAt(0)];
};

sizeOf.BYTE = constant(1);

// Convert an ASCII string to a list of bytes.
encode.CHARARRAY = function (v) {
    var b = [];
    for (var i = 0; i < v.length; i += 1) {
        b.push(v.charCodeAt(i));
    }
    return b;
};

sizeOf.CHARARRAY = function (v) {
    return v.length;
};

// Convert a 16-bit unsigned integer to a list of 2 bytes.
encode.USHORT = function (v) {
    return [(v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.USHORT = constant(2);

// Convert a 16-bit signed integer to a list of 2 bytes.
encode.SHORT = function (v) {
    // Two's complement
    if (v >= LIMIT16){
        v = - ( 2 * LIMIT16 - v);
    }
    return [(v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.SHORT = constant(2);

// Convert a 24-bit unsigned integer to a list of 3 bytes.
encode.UINT24 = function (v) {
    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.UINT24 = constant(3);

// Convert a 32-bit unsigned integer to a list of 4 bytes.
encode.ULONG = function (v) {
    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.ULONG = constant(4);

// Convert a 32-bit unsigned integer to a list of 4 bytes.
encode.LONG = function (v) {
     // Two's complement
    if (v >= LIMIT32){
        v = - ( 2 * LIMIT32 - v);
    }
    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.LONG = constant(4);

encode.FIXED = encode.ULONG;
sizeOf.FIXED = sizeOf.ULONG;

encode.FWORD = encode.SHORT;
sizeOf.FWORD = sizeOf.SHORT;

encode.UFWORD = encode.USHORT;
sizeOf.UFWORD = sizeOf.USHORT;


// FIXME Implement LONGDATETIME
encode.LONGDATETIME = function () {
    return [0, 0, 0, 0, 0, 0, 0, 0];
};

sizeOf.LONGDATETIME = constant(8);

// Convert a 4-char tag to a list of 4 bytes.
encode.TAG = function (v) {
    check.argument(v.length === 4, 'Tag should be exactly 4 ASCII characters.');
    return [v.charCodeAt(0),
            v.charCodeAt(1),
            v.charCodeAt(2),
            v.charCodeAt(3)];
};

sizeOf.TAG = constant(4);

// CFF data types ///////////////////////////////////////////////////////////

encode.Card8 = encode.BYTE;
sizeOf.Card8 = sizeOf.BYTE;

encode.Card16 = encode.USHORT;
sizeOf.Card16 = sizeOf.USHORT;

encode.OffSize = encode.BYTE;
sizeOf.OffSize = sizeOf.BYTE;

encode.SID = encode.USHORT;
sizeOf.SID = sizeOf.USHORT;

// Convert a numeric operand or charstring number to a variable-size list of bytes.
encode.NUMBER = function (v) {
    if (v >= -107 && v <= 107) {
        return [v + 139];
    } else if (v >= 108 && v <= 1131 ) {
        v = v - 108;
        return [(v >> 8) + 247, v & 0xFF];
    } else if (v >= -1131 && v <= -108) {
        v = -v - 108;
        return [(v >> 8) + 251, v & 0xFF];
    } else if (v >= -32768 && v <= 32767) {
        return encode.NUMBER16(v);
    } else {
        return encode.NUMBER32(v);
    }
};

sizeOf.NUMBER = function (v) {
    return encode.NUMBER(v).length;
};

// Convert a signed number between -32768 and +32767 to a three-byte value.
// This ensures we always use three bytes, but is not the most compact format.
encode.NUMBER16 = function (v) {
    return [28, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.NUMBER16 = constant(2);

// Convert a signed number between -(2^31) and +(2^31-1) to a four-byte value.
// This is useful if you want to be sure you always use four bytes,
// at the expense of wasting a few bytes for smaller numbers.
encode.NUMBER32 = function (v) {
    return [29, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.NUMBER32 = constant(4);

encode.NAME = encode.CHARARRAY;
sizeOf.NAME = sizeOf.CHARARRAY;

encode.STRING = encode.CHARARRAY;
sizeOf.STRING = sizeOf.CHARARRAY;

// Convert a ASCII string to a list of UTF16 bytes.
encode.UTF16 = function (v) {
    var b = [];
    for (var i = 0; i < v.length; i += 1) {
        b.push(0);
        b.push(v.charCodeAt(i));
    }
    return b;
};

sizeOf.UTF16 = function (v) {
    return v.length * 2;
};

// Convert a list of values to a CFF INDEX structure.
// The values should be objects containing name / type / value.
encode.INDEX = function (l) {
    var offSize, offset, offsets, offsetEncoder, encodedOffsets, encodedOffset, data,
        dataSize, i, v;
    // Because we have to know which data type to use to encode the offsets,
    // we have to go through the values twice: once to encode the data and
    // calculate the offets, then again to encode the offsets using the fitting data type.
    offset = 1; // First offset is always 1.
    offsets = [offset];
    data = [];
    dataSize = 0;
    for (i = 0; i < l.length; i += 1) {
        v = encode.OBJECT(l[i]);
        Array.prototype.push.apply(data, v);
        dataSize += v.length;
        offset += v.length;
        offsets.push(offset);
    }

    if (data.length === 0) {
        return [0, 0];
    }

    encodedOffsets = [];
    offSize = (1 + Math.floor(Math.log(dataSize)/Math.log(2)) / 8) | 0;
    offsetEncoder = [undefined, encode.BYTE, encode.USHORT, encode.UINT24, encode.ULONG][offSize];
    for (i = 0; i < offsets.length; i += 1) {
        encodedOffset = offsetEncoder(offsets[i]);
        Array.prototype.push.apply(encodedOffsets, encodedOffset);
    }
    return Array.prototype.concat(encode.Card16(l.length),
                           encode.OffSize(offSize),
                           encodedOffsets,
                           data);
};

sizeOf.INDEX = function (v) {
    return encode.INDEX(v).length;
};

// Convert an object to a CFF DICT structure.
// The keys should be numeric.
// The values should be objects containing name / type / value.
encode.DICT = function (m) {
    var d = [],
        keys = Object.keys(m),
        length = keys.length;

    for (var i = 0; i < length; i += 1) {
        // Object.keys() return string keys, but our keys are always numeric.
        var k = parseInt(keys[i], 0);
        var v = m[k];
        // Value comes before the key.
        d = d.concat(encode.OPERAND(v.value, v.type));
        d = d.concat(encode.OPERATOR(k));
    }

    return d;
};

sizeOf.DICT = function (m) {
    return encode.DICT(m).length;
};

encode.OPERATOR = function (v) {
    if (v < 1200) {
        return [v];
    } else {
        return [12, v - 1200];
    }
};

encode.OPERAND = function (v, type) {
    var d, i;
    d = [];
    if (Array.isArray(type)) {
        for (i = 0; i < type.length; i += 1) {
            check.argument(v.length === type.length, 'Not enough arguments given for type' + type);
            d = d.concat(encode.OPERAND(v[i], type[i]));
        }
    } else {
        if (type === 'SID') {
            d = d.concat(encode.NUMBER(v));
        } else if (type === 'offset') {
            // We make it easy for ourselves and always encode offsets as
            // 4 bytes. This makes offset calculation for the top dict easier.
            d = d.concat(encode.NUMBER32(v));
        } else {
            // FIXME Add support for booleans
            d = d.concat(encode.NUMBER(v));
        }
    }
    return d;
};

encode.OP = encode.BYTE;
sizeOf.OP = sizeOf.BYTE;

// memoize charstring encoding using WeakMap if available
var wmm = typeof WeakMap === 'function' && new WeakMap();
// Convert a list of CharString operations to bytes.
encode.CHARSTRING = function (ops) {
    if ( wmm && wmm.has( ops ) ) {
        return wmm.get( ops );
    }

    var d = [],
        length = ops.length,
        op,
        i;

    for (i = 0; i < length; i += 1) {
        op = ops[i];
        d = d.concat( encode[op.type](op.value) );
    }

    if ( wmm ) {
        wmm.set( ops, d );
    }

    return d;
};

sizeOf.CHARSTRING = function (ops) {
    return encode.CHARSTRING(ops).length;
};

// Utility functions ////////////////////////////////////////////////////////

// Convert an object containing name / type / value to bytes.
encode.OBJECT = function (v) {
    var encodingFunction = encode[v.type];
    check.argument(encodingFunction !== undefined, 'No encoding function for type ' + v.type);
    return encodingFunction(v.value);
};

// Convert a table object to bytes.
// A table contains a list of fields containing the metadata (name, type and default value).
// The table itself has the field values set as attributes.
encode.TABLE = function (table) {
    var d = [],
        length = table.fields.length,
        i;

    for (i = 0; i < length; i += 1) {
        var field = table.fields[i];
        var encodingFunction = encode[field.type];
        check.argument(encodingFunction !== undefined, 'No encoding function for field type ' + field.type);
        var value = table[field.name];
        if (value === undefined) {
            value = field.value;
        }
        var bytes = encodingFunction(value);
        d = d.concat(bytes);
    }
    return d;
};

// Merge in a list of bytes.
encode.LITERAL = function (v) {
    return v;
};

sizeOf.LITERAL = function (v) {
    return v.length;
};


exports.decode = decode;
exports.encode = encode;
exports.sizeOf = sizeOf;

},{"./check":1}]},{},[6])(6)
});
define('classes/Glyph.js',['./Classify.js', './Contour.js', './Node.js', './Utils.js', '../bower_components/opentype.js/dist/opentype.js'], function($__0,$__2,$__4,$__6,$__8) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var Classify = $__0.default;
  var Contour = $__2.default;
  var Node = $__4.default;
  var Utils = $__6.default;
  var opentype = $__8.default;
  function Glyph(args) {
    Classify.prototype.constructor.apply(this);
    this.contours = [];
    this.anchors = [];
    this.components = [];
    this.parentAnchors = [];
    if (args && args.src) {
      this.src = args.src;
      this.fromSrc(args.src, args.fontSrc);
      Utils.mergeStatic(this, args.src);
    }
  }
  Glyph.prototype = Object.create(Classify.prototype);
  Glyph.prototype.constructor = Glyph;
  Glyph.prototype.fromSrc = function(glyphSrc, fontSrc) {
    var $__10 = this;
    Utils.createUpdaters(glyphSrc);
    if (glyphSrc.anchor) {
      glyphSrc.anchor.forEach((function(anchorSrc) {
        $__10.addAnchor({src: anchorSrc});
      }));
    }
    if (glyphSrc.outline && glyphSrc.outline.contour) {
      glyphSrc.outline.contour.forEach((function(contourSrc) {
        $__10.addContour({src: contourSrc});
      }));
    }
    if (glyphSrc.outline && glyphSrc.outline.component) {
      glyphSrc.outline.component.forEach((function(componentSrc) {
        var component = $__10.addComponent({src: fontSrc.glyphs[componentSrc.base]});
        componentSrc.anchor.forEach((function(anchorSrc) {
          component.addParentAnchor({src: anchorSrc});
        }));
        component.parentTransform = componentSrc.transform;
      }));
    }
  };
  Glyph.prototype.addContour = function(args) {
    var contour = new Contour(args);
    this.contours.push(contour);
    return contour;
  };
  Glyph.prototype.addAnchor = function(args) {
    var node = new Node(args);
    this.anchors.push(node);
    return node;
  };
  Glyph.prototype.addComponent = function(args) {
    var component = new Glyph(args);
    this.components.push(component);
    return component;
  };
  Glyph.prototype.addParentAnchor = function(args) {
    var node = new Node(args);
    this.parentAnchors.push(node);
    return node;
  };
  Glyph.prototype.update = function(params) {
    var $__10 = this;
    this.anchors.forEach((function(anchor) {
      return anchor.update(params, $__10);
    }));
    this.contours.forEach((function(contour) {
      return contour.update(params, $__10);
    }));
    this.components.forEach((function(component) {
      return component.update(params, $__10);
    }));
    this.gatherNodes();
    return this;
  };
  Glyph.prototype.gatherNodes = function() {
    return (this.allNodes = [].concat.apply(this.anchors, this.gatherContours().map((function(contour) {
      return contour.nodes;
    }))));
  };
  Glyph.prototype.gatherContours = function() {
    return (this.allContours = [].concat.apply(this.contours, this.components.map((function(component) {
      return component.contours;
    }))));
  };
  Glyph.prototype.transform = function(matrix, withControls) {
    if (!matrix) {
      matrix = this.parentTransform;
      if (this.src && this.src.transform) {
        matrix = matrix ? Utils.matrixProduct(matrix, this.src.transform) : this.src.transform;
      }
    }
    if (matrix) {
      this.anchors.forEach((function(anchor) {
        return anchor.transform(matrix, withControls);
      }));
      this.contours.forEach((function(contour) {
        return contour.transform(matrix, withControls);
      }));
      this.components.forEach((function(component) {
        return component.transform(matrix, withControls);
      }));
    }
  };
  Glyph.prototype.toSVG = function() {
    var path = [];
    this.contours.forEach(function(contour) {
      path.push(contour.toSVG());
    });
    return (this.pathData = path.join(' '));
  };
  Glyph.prototype.toOT = function() {
    var path = new opentype.Path();
    this.allContours.forEach(function(contour) {
      contour.toOT(path);
    });
    return new opentype.Glyph({
      name: this.name,
      unicode: this.unicode,
      path: path,
      advanceWidth: this.advanceWidth || 512
    });
  };
  var $__default = Glyph;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9HbHlwaC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBZSxlQUFjLENBQ2YsZUFBYSxDQUNoQixZQUFVLENBQ1QsYUFBVyxDQUNSLG1EQUFpRCxFQ0p0RSxVQUFTLHdCQUFnQjs7QUNBekIsS0FBSSxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUQzRCxBQUMyRCxLQUR2RCxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUQzRCxBQUMyRCxLQUR2RCxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUQzRCxBQUMyRCxLQUR2RCxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUQzRCxBQUMyRCxLQUR2RCxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUFBLElGRHBELFNBQU87SUFDUCxRQUFNO0lBQ04sS0FBRztJQUNILE1BQUk7SUFDSixTQUFPO0FBRWQsU0FBUyxNQUFJLENBQUcsSUFBRyxDQUFJO0FBQ3RCLFdBQU8s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QUFFO0FBQ2xDLEFBQUksTUFBQSxDQUFBLElBQUcsRUFBSSxHQUFDLENBQUM7QUFFYixPQUFHLFNBQVMsUUFBUSxBQUFDLENBQUMsU0FBVSxPQUFNLENBQUk7QUFDekMsU0FBRyxLQUFLLEFBQUMsQ0FBRSxPQUFNLE1BQU0sQUFBQyxFQUFDLENBQUUsQ0FBQztJQUM3QixDQUFDLENBQUM7QUFFRixTQUFPLEVBQUUsSUFBRyxTQUFTLEVBQUksQ0FBQSxJQUFHLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFFLENBQUM7RUFDMUMsQ0FBQztBQUVELE1BQUksVUFBVSxLQUFLLEVBQUksVUFBUSxBQUFDLENBQUU7QUFDakMsQUFBSSxNQUFBLENBQUEsSUFBRyxFQUFJLElBQUksQ0FBQSxRQUFPLEtBQUssQUFBQyxFQUFDLENBQUM7QUFFOUIsT0FBRyxZQUFZLFFBQVEsQUFBQyxDQUFDLFNBQVUsT0FBTSxDQUFJO0FBQzVDLFlBQU0sS0FBSyxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUM7SUFDckIsQ0FBQyxDQUFDO0FBRUYsU0FBTyxJQUFJLENBQUEsUUFBTyxNQUFNLEFBQUMsQ0FBQztBQUN6QixTQUFHLENBQUcsQ0FBQSxJQUFHLEtBQUs7QUFDZCxZQUFNLENBQUcsQ0FBQSxJQUFHLFFBQVE7QUFDcEIsU0FBRyxDQUFHLEtBQUc7QUFDVCxpQkFBVyxDQUFHLENBQUEsSUFBRyxhQUFhLEdBQUssSUFBRTtBQUFBLElBQ3RDLENBQUMsQ0FBQztFQUNILENBQUM7QUc5SUQsQUFBSSxJQUFBLENBQUEsVUFBUyxFSGdKRSxNR2hKa0IsQUhnSmQsQ0doSmM7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQ2dKeEIiLCJmaWxlIjoiY2xhc3Nlcy9HbHlwaC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImltcG9ydCBDbGFzc2lmeSBmcm9tICcuL0NsYXNzaWZ5LmpzJztcbmltcG9ydCBDb250b3VyIGZyb20gJy4vQ29udG91ci5qcyc7XG5pbXBvcnQgTm9kZSBmcm9tICcuL05vZGUuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuaW1wb3J0IG9wZW50eXBlIGZyb20gJy4uL2Jvd2VyX2NvbXBvbmVudHMvb3BlbnR5cGUuanMvZGlzdC9vcGVudHlwZS5qcyc7XG5cbmZ1bmN0aW9uIEdseXBoKCBhcmdzICkge1xuXHRDbGFzc2lmeS5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkoIHRoaXMgKTtcblxuXHR0aGlzLmNvbnRvdXJzID0gW107XG5cdHRoaXMuYW5jaG9ycyA9IFtdO1xuXHR0aGlzLmNvbXBvbmVudHMgPSBbXTtcblx0dGhpcy5wYXJlbnRBbmNob3JzID0gW107XG5cblx0aWYgKCBhcmdzICYmIGFyZ3Muc3JjICkge1xuXHRcdHRoaXMuc3JjID0gYXJncy5zcmM7XG5cdFx0dGhpcy5mcm9tU3JjKCBhcmdzLnNyYywgYXJncy5mb250U3JjICk7XG5cdFx0VXRpbHMubWVyZ2VTdGF0aWMoIHRoaXMsIGFyZ3Muc3JjICk7XG5cdH1cbn1cblxuR2x5cGgucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzc2lmeS5wcm90b3R5cGUpO1xuR2x5cGgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2x5cGg7XG5cbkdseXBoLnByb3RvdHlwZS5mcm9tU3JjID0gZnVuY3Rpb24oIGdseXBoU3JjLCBmb250U3JjICkge1xuXHRVdGlscy5jcmVhdGVVcGRhdGVycyggZ2x5cGhTcmMgKTtcblxuXHRpZiggZ2x5cGhTcmMuYW5jaG9yICkge1xuXHRcdGdseXBoU3JjLmFuY2hvci5mb3JFYWNoKGFuY2hvclNyYyA9PiB7XG5cdFx0XHR0aGlzLmFkZEFuY2hvcih7IHNyYzogYW5jaG9yU3JjIH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKCBnbHlwaFNyYy5vdXRsaW5lICYmIGdseXBoU3JjLm91dGxpbmUuY29udG91ciApIHtcblx0XHRnbHlwaFNyYy5vdXRsaW5lLmNvbnRvdXIuZm9yRWFjaChjb250b3VyU3JjID0+IHtcblx0XHRcdHRoaXMuYWRkQ29udG91cih7IHNyYzogY29udG91clNyYyB9KTtcblx0XHR9KTtcblx0fVxuXG5cdGlmICggZ2x5cGhTcmMub3V0bGluZSAmJiBnbHlwaFNyYy5vdXRsaW5lLmNvbXBvbmVudCApIHtcblx0XHRnbHlwaFNyYy5vdXRsaW5lLmNvbXBvbmVudC5mb3JFYWNoKGNvbXBvbmVudFNyYyA9PiB7XG5cdFx0XHR2YXIgY29tcG9uZW50ID0gdGhpcy5hZGRDb21wb25lbnQoeyBzcmM6IGZvbnRTcmMuZ2x5cGhzW2NvbXBvbmVudFNyYy5iYXNlXSB9KTtcblx0XHRcdGNvbXBvbmVudFNyYy5hbmNob3IuZm9yRWFjaChhbmNob3JTcmMgPT4ge1xuXHRcdFx0XHRjb21wb25lbnQuYWRkUGFyZW50QW5jaG9yKHsgc3JjOiBhbmNob3JTcmMgfSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29tcG9uZW50LnBhcmVudFRyYW5zZm9ybSA9IGNvbXBvbmVudFNyYy50cmFuc2Zvcm07XG5cdFx0fSk7XG5cdH1cbn07XG5cbkdseXBoLnByb3RvdHlwZS5hZGRDb250b3VyID0gZnVuY3Rpb24oIGFyZ3MgKSB7XG5cdHZhciBjb250b3VyID0gbmV3IENvbnRvdXIoIGFyZ3MgKTtcblx0dGhpcy5jb250b3Vycy5wdXNoKCBjb250b3VyICk7XG5cdHJldHVybiBjb250b3VyO1xufTtcblxuR2x5cGgucHJvdG90eXBlLmFkZEFuY2hvciA9IGZ1bmN0aW9uKCBhcmdzICkge1xuXHR2YXIgbm9kZSA9IG5ldyBOb2RlKCBhcmdzICk7XG5cdHRoaXMuYW5jaG9ycy5wdXNoKCBub2RlICk7XG5cdHJldHVybiBub2RlO1xufTtcblxuR2x5cGgucHJvdG90eXBlLmFkZENvbXBvbmVudCA9IGZ1bmN0aW9uKCBhcmdzICkge1xuXHR2YXIgY29tcG9uZW50ID0gbmV3IEdseXBoKCBhcmdzICk7XG5cdHRoaXMuY29tcG9uZW50cy5wdXNoKCBjb21wb25lbnQgKTtcblx0cmV0dXJuIGNvbXBvbmVudDtcbn07XG5cbkdseXBoLnByb3RvdHlwZS5hZGRQYXJlbnRBbmNob3IgPSBmdW5jdGlvbiggYXJncyApIHtcblx0dmFyIG5vZGUgPSBuZXcgTm9kZSggYXJncyApO1xuXHR0aGlzLnBhcmVudEFuY2hvcnMucHVzaCggbm9kZSApO1xuXHRyZXR1cm4gbm9kZTtcbn07XG5cbkdseXBoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiggcGFyYW1zICkge1xuXHR0aGlzLmFuY2hvcnMuZm9yRWFjaChhbmNob3IgPT4gYW5jaG9yLnVwZGF0ZSggcGFyYW1zLCB0aGlzICkpO1xuXHR0aGlzLmNvbnRvdXJzLmZvckVhY2goY29udG91ciA9PiBjb250b3VyLnVwZGF0ZSggcGFyYW1zLCB0aGlzICkpO1xuXHR0aGlzLmNvbXBvbmVudHMuZm9yRWFjaChjb21wb25lbnQgPT4gY29tcG9uZW50LnVwZGF0ZSggcGFyYW1zLCB0aGlzICkpO1xuXG5cdHRoaXMuZ2F0aGVyTm9kZXMoKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbkdseXBoLnByb3RvdHlwZS5nYXRoZXJOb2RlcyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gKCB0aGlzLmFsbE5vZGVzID0gW10uY29uY2F0LmFwcGx5KFxuXHRcdHRoaXMuYW5jaG9ycyxcblx0XHR0aGlzLmdhdGhlckNvbnRvdXJzKCkubWFwKCBjb250b3VyID0+IGNvbnRvdXIubm9kZXMgKVxuXHQpKTtcbn07XG5cbkdseXBoLnByb3RvdHlwZS5nYXRoZXJDb250b3VycyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gKCB0aGlzLmFsbENvbnRvdXJzID0gW10uY29uY2F0LmFwcGx5KFxuXHRcdHRoaXMuY29udG91cnMsXG5cdFx0dGhpcy5jb21wb25lbnRzLm1hcCggY29tcG9uZW50ID0+IGNvbXBvbmVudC5jb250b3VycyApXG5cdCkpO1xufTtcblxuR2x5cGgucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKCBtYXRyaXgsIHdpdGhDb250cm9scyApIHtcblxuXHQvLyB0cmFuc2Zvcm0gZnJvbSBzb3VyY2VzIGlmIG5vIG1hdHJpeCBpcyBwcm92aWRlZFxuXHRpZiAoICFtYXRyaXggKSB7XG5cdFx0bWF0cml4ID0gdGhpcy5wYXJlbnRUcmFuc2Zvcm07XG5cblx0XHRpZiAoIHRoaXMuc3JjICYmIHRoaXMuc3JjLnRyYW5zZm9ybSApIHtcblx0XHRcdG1hdHJpeCA9IG1hdHJpeCA/XG5cdFx0XHRcdFV0aWxzLm1hdHJpeFByb2R1Y3QoIG1hdHJpeCwgdGhpcy5zcmMudHJhbnNmb3JtICk6XG5cdFx0XHRcdHRoaXMuc3JjLnRyYW5zZm9ybTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIG1hdHJpeCApIHtcblx0XHR0aGlzLmFuY2hvcnMuZm9yRWFjaChhbmNob3IgPT4gYW5jaG9yLnRyYW5zZm9ybSggbWF0cml4LCB3aXRoQ29udHJvbHMgKSk7XG5cdFx0dGhpcy5jb250b3Vycy5mb3JFYWNoKGNvbnRvdXIgPT4gY29udG91ci50cmFuc2Zvcm0oIG1hdHJpeCwgd2l0aENvbnRyb2xzICkpO1xuXHRcdHRoaXMuY29tcG9uZW50cy5mb3JFYWNoKGNvbXBvbmVudCA9PiBjb21wb25lbnQudHJhbnNmb3JtKCBtYXRyaXgsIHdpdGhDb250cm9scyApKTtcblx0fVxufTtcblxuR2x5cGgucHJvdG90eXBlLnRvU1ZHID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwYXRoID0gW107XG5cblx0dGhpcy5jb250b3Vycy5mb3JFYWNoKGZ1bmN0aW9uKCBjb250b3VyICkge1xuXHRcdHBhdGgucHVzaCggY29udG91ci50b1NWRygpICk7XG5cdH0pO1xuXG5cdHJldHVybiAoIHRoaXMucGF0aERhdGEgPSBwYXRoLmpvaW4oJyAnKSApO1xufTtcblxuR2x5cGgucHJvdG90eXBlLnRvT1QgPSBmdW5jdGlvbigpIHtcblx0dmFyIHBhdGggPSBuZXcgb3BlbnR5cGUuUGF0aCgpO1xuXG5cdHRoaXMuYWxsQ29udG91cnMuZm9yRWFjaChmdW5jdGlvbiggY29udG91ciApIHtcblx0XHRjb250b3VyLnRvT1QoIHBhdGggKTtcblx0fSk7XG5cblx0cmV0dXJuIG5ldyBvcGVudHlwZS5HbHlwaCh7XG5cdFx0bmFtZTogdGhpcy5uYW1lLFxuXHRcdHVuaWNvZGU6IHRoaXMudW5pY29kZSxcblx0XHRwYXRoOiBwYXRoLFxuXHRcdGFkdmFuY2VXaWR0aDogdGhpcy5hZHZhbmNlV2lkdGggfHwgNTEyXG5cdH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2x5cGg7IiwiZnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIHtcbiAgICAgICRfX3BsYWNlaG9sZGVyX18xXG4gICAgfSIsImlmICghJF9fcGxhY2Vob2xkZXJfXzAgfHwgISRfX3BsYWNlaG9sZGVyX18xLl9fZXNNb2R1bGUpXG4gICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA9IHtkZWZhdWx0OiAkX19wbGFjZWhvbGRlcl9fM30iLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLCJfX2VzTW9kdWxlOiB0cnVlIl19;
define('classes/Font.js',['./Glyph.js', './Utils.js', '../bower_components/opentype.js/dist/opentype.js'], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Glyph = $__0.default;
  var Utils = $__2.default;
  var opentype = $__4.default;
  function Font(args) {
    this.glyphs = {};
    this.cmap = args && args.src && args.src.info['glyph-order'];
    if (args && args.src) {
      this.src = args.src;
      this.fromSrc(args.src);
      Utils.mergeStatic(this, args.src);
    }
  }
  Font.prototype.fromSrc = function(fontSrc) {
    for (var name in fontSrc.glyphs) {
      this.addGlyph(name, {
        src: fontSrc.glyphs[name],
        fontSrc: fontSrc
      });
    }
    this.familyName = fontSrc.info.familyName;
  };
  Font.prototype.addGlyph = function(name, args) {
    return (this.glyphs[name] = new Glyph(args));
  };
  Font.prototype.update = function(chars, params) {
    var $__6 = this;
    var allChars = {};
    if (chars === true) {
      chars = Object.keys(this.cmap);
    }
    chars.forEach((function(char) {
      if ($__6.cmap[char]) {
        allChars[char] = $__6.glyphs[$__6.cmap[char]].update(params, $__6);
      }
    }));
    return allChars;
  };
  Font.prototype.toSVG = function(chars) {
    var $__6 = this;
    var allChars = [];
    if (chars === true) {
      chars = Object.keys(this.cmap);
    }
    chars.sort().forEach((function(char) {
      if ($__6.cmap[char]) {
        $__6.glyphs[$__6.cmap[char]].toSVG();
        allChars.push($__6.glyphs[$__6.cmap[char]]);
      }
    }));
    return allChars;
  };
  Font.prototype.toOT = function(chars, args) {
    var $__6 = this;
    var font = new opentype.Font({
      familyName: (args && args.familyName) || this.familyName,
      styleName: (args && args.styleName) || 'Regular',
      unitsPerEm: 1024
    }),
        allChars = [new opentype.Glyph({
          name: '.notdef',
          unicode: 0,
          path: new opentype.Path()
        })];
    if (chars === true) {
      chars = Object.keys(this.cmap);
    }
    chars.sort().forEach((function(char) {
      if ($__6.cmap[char]) {
        allChars.push($__6.glyphs[$__6.cmap[char]].toOT());
      }
    }));
    font.glyphs = allChars;
    return font;
  };
  var _URL = window.URL || window.webkitURL,
      ruleIndex;
  Font.prototype.addToFonts = document.fonts ? function(chars, args) {
    document.fonts.add(new FontFace('preview', this.toOT(chars, args).toBuffer()));
  } : function(chars, args) {
    var url = _URL.createObjectURL(new Blob([new DataView(this.toOT(chars, args).toBuffer())], {type: 'font/opentype'}));
    if (ruleIndex) {
      document.styleSheets[0].deleteRule(ruleIndex);
    }
    ruleIndex = document.styleSheets[0].insertRule('@font-face { font-family: "preview"; src: url(' + url + '); }', ruleIndex || document.styleSheets[0].cssRules.length);
  };
  var $__default = Font;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Gb250LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FZLFlBQVcsQ0FDWCxhQUFXLENBQ1IsbURBQWlELEVDRnRFLFVBQVMsY0FBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFBQSxJRkRwRCxNQUFJO0lBQ0osTUFBSTtJQUNKLFNBQU87QUFFZCxTQUFTLEtBQUcsQ0FBRyxJQUFHLENBQUk7QUFDckIsT0FBRyxPQUFPLEVBQUksR0FBQyxDQUFDO0FBQ2hCLE9BQUcsS0FBSyxFQUFJLENBQUEsSUFBRyxHQUFLLENBQUEsSUFBRyxJQUFJLENBQUEsRUFBSyxDQUFBLElBQUcsSUFBSSxLQUFLLENBQUUsYUFBWSxDQUFDLENBQUM7QUFFNUQsT0FBSyxJQUFHLEdBQUssQ0FBQSxJQUFHLElBQUksQ0FBSTtBQUN2QixTQUFHLElBQUksRUFBSSxDQUFBLElBQUcsSUFBSSxD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QUFFLEdBQUksU0FBTyxBQUFDLENBQUUsSUFBRyxLQUFLLEFBQUMsQ0FBRSxLQUFJLENBQUcsS0FBRyxDQUFFLFNBQVMsQUFBQyxFQUFDLENBQUUsQ0FBRSxDQUN0RCxFQUFDLElBQUcsQ0FBRyxnQkFBYyxDQUFDLENBQ3ZCLENBQ0QsQ0FBQztBQUVELE9BQUssU0FBUSxDQUFJO0FBQ2hCLGFBQU8sWUFBWSxDQUFFLENBQUEsQ0FBQyxXQUFXLEFBQUMsQ0FBRSxTQUFRLENBQUUsQ0FBQztJQUNoRDtBQUFBLEFBRUEsWUFBUSxFQUFJLENBQUEsUUFBTyxZQUFZLENBQUUsQ0FBQSxDQUFDLFdBQVcsQUFBQyxDQUM3QyxnREFBK0MsRUFBSSxJQUFFLENBQUEsQ0FBSSxPQUFLLENBQzlELENBQUEsU0FBUSxHQUFLLENBQUEsUUFBTyxZQUFZLENBQUUsQ0FBQSxDQUFDLFNBQVMsT0FBTyxDQUNwRCxDQUFDO0VBQ0YsQ0FBQztBR3hIRixBQUFJLElBQUEsQ0FBQSxVQUFTLEVIMEhFLEtHMUhrQixBSDBIZixDRzFIZTtBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDMEh6QiIsImZpbGUiOiJjbGFzc2VzL0ZvbnQuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJpbXBvcnQgR2x5cGggZnJvbSAnLi9HbHlwaC5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XG5pbXBvcnQgb3BlbnR5cGUgZnJvbSAnLi4vYm93ZXJfY29tcG9uZW50cy9vcGVudHlwZS5qcy9kaXN0L29wZW50eXBlLmpzJztcblxuZnVuY3Rpb24gRm9udCggYXJncyApIHtcblx0dGhpcy5nbHlwaHMgPSB7fTtcblx0dGhpcy5jbWFwID0gYXJncyAmJiBhcmdzLnNyYyAmJiBhcmdzLnNyYy5pbmZvWydnbHlwaC1vcmRlciddO1xuXG5cdGlmICggYXJncyAmJiBhcmdzLnNyYyApIHtcblx0XHR0aGlzLnNyYyA9IGFyZ3Muc3JjO1xuXHRcdHRoaXMuZnJvbVNyYyggYXJncy5zcmMgKTtcblx0XHRVdGlscy5tZXJnZVN0YXRpYyggdGhpcywgYXJncy5zcmMgKTtcblx0fVxufVxuXG5Gb250LnByb3RvdHlwZS5mcm9tU3JjID0gZnVuY3Rpb24oIGZvbnRTcmMgKSB7XG5cdGZvciAoIHZhciBuYW1lIGluIGZvbnRTcmMuZ2x5cGhzICkge1xuXHRcdHRoaXMuYWRkR2x5cGgoIG5hbWUsIHtcblx0XHRcdHNyYzogZm9udFNyYy5nbHlwaHNbbmFtZV0sXG5cdFx0XHRmb250U3JjOiBmb250U3JjXG5cdFx0fSk7XG5cdH1cblxuXHR0aGlzLmZhbWlseU5hbWUgPSBmb250U3JjLmluZm8uZmFtaWx5TmFtZTtcbn07XG5cbkZvbnQucHJvdG90eXBlLmFkZEdseXBoID0gZnVuY3Rpb24oIG5hbWUsIGFyZ3MgKSB7XG5cdHJldHVybiAoIHRoaXMuZ2x5cGhzW25hbWVdID0gbmV3IEdseXBoKCBhcmdzICkgKTtcbn07XG5cbkZvbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCBjaGFycywgcGFyYW1zICkge1xuXHR2YXIgYWxsQ2hhcnMgPSB7fTtcblxuXHRpZiAoIGNoYXJzID09PSB0cnVlICkge1xuXHRcdGNoYXJzID0gT2JqZWN0LmtleXMoIHRoaXMuY21hcCApO1xuXHR9XG5cblx0Y2hhcnMuZm9yRWFjaChjaGFyID0+IHtcblx0XHRpZiAoIHRoaXMuY21hcFtjaGFyXSApIHtcblx0XHRcdGFsbENoYXJzW2NoYXJdID0gdGhpcy5nbHlwaHNbIHRoaXMuY21hcFtjaGFyXSBdLnVwZGF0ZSggcGFyYW1zLCB0aGlzICk7XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gYWxsQ2hhcnM7XG59O1xuXG5Gb250LnByb3RvdHlwZS50b1NWRyA9IGZ1bmN0aW9uKCBjaGFycyApIHtcblx0dmFyIGFsbENoYXJzID0gW107XG5cblx0aWYgKCBjaGFycyA9PT0gdHJ1ZSApIHtcblx0XHRjaGFycyA9IE9iamVjdC5rZXlzKCB0aGlzLmNtYXAgKTtcblx0fVxuXG5cdGNoYXJzLnNvcnQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuXHRcdGlmICggdGhpcy5jbWFwW2NoYXJdICkge1xuXHRcdFx0dGhpcy5nbHlwaHNbIHRoaXMuY21hcFtjaGFyXSBdLnRvU1ZHKCk7XG5cdFx0XHRhbGxDaGFycy5wdXNoKCB0aGlzLmdseXBoc1sgdGhpcy5jbWFwW2NoYXJdIF0gKTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBhbGxDaGFycztcbn07XG5cbkZvbnQucHJvdG90eXBlLnRvT1QgPSBmdW5jdGlvbiggY2hhcnMsIGFyZ3MgKSB7XG5cdHZhciBmb250ID0gbmV3IG9wZW50eXBlLkZvbnQoe1xuXHRcdFx0ZmFtaWx5TmFtZTogKCBhcmdzICYmIGFyZ3MuZmFtaWx5TmFtZSApIHx8IHRoaXMuZmFtaWx5TmFtZSxcblx0XHRcdHN0eWxlTmFtZTogKCBhcmdzICYmIGFyZ3Muc3R5bGVOYW1lICkgfHwgJ1JlZ3VsYXInLFxuXHRcdFx0dW5pdHNQZXJFbTogMTAyNFxuXHRcdH0pLFxuXHRcdGFsbENoYXJzID0gW1xuXHRcdFx0bmV3IG9wZW50eXBlLkdseXBoKHtcblx0XHRcdFx0bmFtZTogJy5ub3RkZWYnLFxuXHRcdFx0XHR1bmljb2RlOiAwLFxuXHRcdFx0XHRwYXRoOiBuZXcgb3BlbnR5cGUuUGF0aCgpXG5cdFx0XHR9KVxuXHRcdF07XG5cblx0aWYgKCBjaGFycyA9PT0gdHJ1ZSApIHtcblx0XHRjaGFycyA9IE9iamVjdC5rZXlzKCB0aGlzLmNtYXAgKTtcblx0fVxuXG5cdGNoYXJzLnNvcnQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuXHRcdGlmICggdGhpcy5jbWFwW2NoYXJdICkge1xuXHRcdFx0YWxsQ2hhcnMucHVzaCggdGhpcy5nbHlwaHNbIHRoaXMuY21hcFtjaGFyXSBdLnRvT1QoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0Zm9udC5nbHlwaHMgPSBhbGxDaGFycztcblxuXHRyZXR1cm4gZm9udDtcbn07XG5cbnZhciBfVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMLFxuXHRydWxlSW5kZXg7XG5Gb250LnByb3RvdHlwZS5hZGRUb0ZvbnRzID0gZG9jdW1lbnQuZm9udHMgP1xuXHQvLyBDU1MgZm9udCBsb2FkaW5nLCBsaWdodG5pbmcgZmFzdFxuXHRmdW5jdGlvbiggY2hhcnMsIGFyZ3MgKSB7XG5cdFx0ZG9jdW1lbnQuZm9udHMuYWRkKFxuXHRcdFx0bmV3IEZvbnRGYWNlKFxuXHRcdFx0XHQncHJldmlldycsXG5cdFx0XHRcdHRoaXMudG9PVCggY2hhcnMsIGFyZ3MgKS50b0J1ZmZlcigpXG5cdFx0XHQpXG5cdFx0KTtcblx0fTpcblx0ZnVuY3Rpb24oIGNoYXJzLCBhcmdzICkge1xuXHRcdHZhciB1cmwgPSBfVVJMLmNyZWF0ZU9iamVjdFVSTChcblx0XHRcdG5ldyBCbG9iKFxuXHRcdFx0XHRbIG5ldyBEYXRhVmlldyggdGhpcy50b09UKCBjaGFycywgYXJncyApLnRvQnVmZmVyKCkgKSBdLFxuXHRcdFx0XHR7dHlwZTogJ2ZvbnQvb3BlbnR5cGUnfVxuXHRcdFx0KVxuXHRcdCk7XG5cblx0XHRpZiAoIHJ1bGVJbmRleCApIHtcblx0XHRcdGRvY3VtZW50LnN0eWxlU2hlZXRzWzBdLmRlbGV0ZVJ1bGUoIHJ1bGVJbmRleCApO1xuXHRcdH1cblxuXHRcdHJ1bGVJbmRleCA9IGRvY3VtZW50LnN0eWxlU2hlZXRzWzBdLmluc2VydFJ1bGUoXG5cdFx0XHQnQGZvbnQtZmFjZSB7IGZvbnQtZmFtaWx5OiBcInByZXZpZXdcIjsgc3JjOiB1cmwoJyArIHVybCArICcpOyB9Jyxcblx0XHRcdHJ1bGVJbmRleCB8fMKgZG9jdW1lbnQuc3R5bGVTaGVldHNbMF0uY3NzUnVsZXMubGVuZ3RoXG5cdFx0KTtcblx0fTtcblxuZXhwb3J0IGRlZmF1bHQgRm9udDsiLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwiaWYgKCEkX19wbGFjZWhvbGRlcl9fMCB8fCAhJF9fcGxhY2Vob2xkZXJfXzEuX19lc01vZHVsZSlcbiAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yID0ge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX18zfSIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=;
define('main',['./classes/Font.js', './classes/Point.js', './classes/Node.js', './classes/Segment.js', './classes/Glyph.js', './classes/Contour.js', './classes/Utils.js', './bower_components/opentype.js/dist/opentype.js'], function($__0,$__2,$__4,$__6,$__8,$__10,$__12,$__14) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  var Font = $__0.default;
  var Point = $__2.default;
  var Node = $__4.default;
  var Segment = $__6.default;
  var Glyph = $__8.default;
  var Contour = $__10.default;
  var Utils = $__12.default;
  var opentype = $__14.default;
  function newFont(fontSrc) {
    return new Font({src: fontSrc});
  }
  newFont.Font = Font;
  newFont.Point = Point;
  newFont.Node = Node;
  newFont.Segment = Segment;
  newFont.Contour = Contour;
  newFont.Glyph = Glyph;
  newFont.Utils = Utils;
  newFont.opentype = opentype;
  var $__default = newFont;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwibWFpbi5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBVyxtQkFBa0IsQ0FDakIscUJBQW1CLENBQ3BCLG9CQUFrQixDQUNmLHVCQUFxQixDQUN2QixxQkFBbUIsQ0FDakIsdUJBQXFCLENBQ3ZCLHFCQUFtQixDQUNoQixrREFBZ0QsRUNQckUsVUFBUywwQ0FBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFEM0QsQUFDMkQsS0FEdkQsTUFBaUIsR0FBSyxFQUFDLGdCQUEyQjtBQUMxQyxVQUFvQixFQUFDLE9BQU0sT0FBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELE1BQWlCLEdBQUssRUFBQyxnQkFBMkI7QUFDMUMsVUFBb0IsRUFBQyxPQUFNLE9BQW1CLENBQUMsQ0FBQTtBQUQzRCxBQUMyRCxLQUR2RCxNQUFpQixHQUFLLEVBQUMsZ0JBQTJCO0FBQzFDLFVBQW9CLEVBQUMsT0FBTSxPQUFtQixDQUFDLENBQUE7QUFBQSxJRkRwRCxLQUFHO0lBQ0gsTUFBSTtJQUNKLEtBQUc7SUFDSCxRQUFNO0lBQ04sTUFBSTtJQUNKLFFBQU07SUFDTixNQUFJO0lBQ0osU0FBTztBQUVkLFNBQVMsUUFBTSxDQUFHLE9BQU0sQ0FBSTtBQUMzQixTQUFPLElBQUksS0FBRyxBQUFDLENBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFFLENBQUMsQ0FBQztFQUNqQztBQUFBLEFBRUEsUUFBTSxLQUFLLEVBQUksS0FBRyxDQUFDO0FBQ25CLFFBQU0sTUFBTSxFQUFJLE1BQUksQ0FBQztBQUNyQixRQUFNLEtBQUssRUFBSSxLQUFHLENBQUM7QUFDbkIsUUFBTSxRQUFRLEVBQUksUUFBTSxDQUFDO0FBQ3pCLFFBQU0sUUFBUSxFQUFJLFFBQU0sQ0FBQztBQUN6QixRQUFNLE1BQU0sRUFBSSxNQUFJLENBQUM7QUFDckIsUUFBTSxNQUFNLEVBQUksTUFBSSxDQUFDO0FBQ3JCLFFBQU0sU0FBUyxFQUFJLFNBQU8sQ0FBQztBR3BCM0IsQUFBSSxJQUFBLENBQUEsVUFBUyxFSHNCRSxRR3RCa0IsQUhzQlosQ0d0Qlk7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQ3NCdEIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImltcG9ydCBGb250IGZyb20gJy4vY2xhc3Nlcy9Gb250LmpzJztcbmltcG9ydCBQb2ludCBmcm9tICcuL2NsYXNzZXMvUG9pbnQuanMnO1xuaW1wb3J0IE5vZGUgZnJvbSAnLi9jbGFzc2VzL05vZGUuanMnO1xuaW1wb3J0IFNlZ21lbnQgZnJvbSAnLi9jbGFzc2VzL1NlZ21lbnQuanMnO1xuaW1wb3J0IEdseXBoIGZyb20gJy4vY2xhc3Nlcy9HbHlwaC5qcyc7XG5pbXBvcnQgQ29udG91ciBmcm9tICcuL2NsYXNzZXMvQ29udG91ci5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9jbGFzc2VzL1V0aWxzLmpzJztcbmltcG9ydCBvcGVudHlwZSBmcm9tICcuL2Jvd2VyX2NvbXBvbmVudHMvb3BlbnR5cGUuanMvZGlzdC9vcGVudHlwZS5qcyc7XG5cbmZ1bmN0aW9uIG5ld0ZvbnQoIGZvbnRTcmMgKSB7XG5cdHJldHVybiBuZXcgRm9udCh7c3JjOiBmb250U3JjIH0pO1xufVxuXG5uZXdGb250LkZvbnQgPSBGb250O1xubmV3Rm9udC5Qb2ludCA9IFBvaW50O1xubmV3Rm9udC5Ob2RlID0gTm9kZTtcbm5ld0ZvbnQuU2VnbWVudCA9IFNlZ21lbnQ7XG5uZXdGb250LkNvbnRvdXIgPSBDb250b3VyO1xubmV3Rm9udC5HbHlwaCA9IEdseXBoO1xubmV3Rm9udC5VdGlscyA9IFV0aWxzO1xubmV3Rm9udC5vcGVudHlwZSA9IG9wZW50eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBuZXdGb250OyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==;

require(["main"]);
	//The modules for your project will be inlined above
	//this snippet. Ask almond to synchronously require the
	//module value for 'main' here and return it as the
	//value to use for the public API for the built file.
	return require('main').default;
}));
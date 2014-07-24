'use strict';

var path = require('path'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	replace = require('gulp-replace'),
	header = require('gulp-header'),
	footer = require('gulp-footer'),
	concat = require('gulp-concat'),
	cached = require('gulp-cached'),
	remember = require('gulp-remember'),
	merge = require('merge-stream');

var paths = {
	components: ['./app/_typeface/default/components/*.js', './app/_typeface/default/glyphs/*.js'],
	typeface: './app/_typeface/default/*.js'
};

gulp.task('build-typeface', function() {
	return merge(
		gulp.src(paths.components)
		.pipe(cached('components'))

		// add tabulations to non-empty newlines
		.pipe(replace(/(?:^|\r\n?|\n)(?![\r\n])/g, '\n\t\t\t'))
		// replace points[X] with points(X), same for skeletons and contours
		.pipe(replace(/(points|skeletons|contours)\[(\d+)\](\()?/g, function($0, $1, $2, $3) {
			return $3 ?
				$1 + '(' + $2 + ')._(':
				$1 + '(' + $2 + ')';
		}))
		.pipe(jshint({
			lookup: false,
			undef: true,
			globals: {
				skeletons: false,
				contours: false,
				points: false,
				origin: false
			}
		}))
		// do not report linting errors right now
		.pipe(jshint.reporter(function() {}))

		// wrap all components and glyph with dependency injectors
		.pipe(header(function( file ) {
			if ( !file.jshint || !file.jshint.results ) {
				return;
			}

			var dependencies = ['origin'];

			file.jshint.results.forEach(function(result) {
				if ( result.error.code === 'W117' ) {
					dependencies.push(result.error.a);
				}
			});

			// find unique deps
			dependencies = dependencies.filter(function (e, i, arr) {
				return arr.lastIndexOf(e) === i;
			});

			var component = path.basename( file.path, '.js' );

			return '\nexports.components[\'' + component + '\'] = function(points, skeletons, contours) {' +
				'\n\treturn [' +
				'\n\t\t\'' + dependencies.join('\', \'') + '\'' +
				',\n\t\tfunction(' + dependencies.join(', ') + ') {\n';
		}))
		.pipe(footer(function() {
			return '\n\n\t\t}\n\t];\n};\n';
		}))

		.pipe(remember('components')),

		gulp.src(paths.typeface)

		// end merge
		)
		// concatenate all glyphs and components
		.pipe(concat('default.typeface.js'))
		.pipe(header(function() {
			return '// jshint ignore: start\n' +
				'(function(exports) {\n';
		}))
		.pipe(footer(function() {
			return '\n\nreturn exports;' +
				'\n\n})({glyphs: {}, components: {}, parameters: {}, presets: {}});';
		}))
		.pipe(gulp.dest('./app/_typeface/'));
});

gulp.task('watch', function () {
	var watcher = gulp.watch(paths.components, ['build-typeface']); // watch the same files in our scripts task
	watcher.on('change', function (event) {
		if (event.type === 'deleted') { // if a file is deleted, forget about it
			delete cached.caches.components[event.path]; // gulp-cached remove api
			remember.forget('components', event.path); // gulp-remember remove api
		}
	});
});
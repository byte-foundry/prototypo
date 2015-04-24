var gulp = require('gulp');
// CSS Dep
var sass = require('gulp-sass');

// BROWSERIFY Dep
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify')
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

//CSS Dep
var minifyCss = require('gulp-minify-css');

//Utils
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var assign = require('lodash.assign');

// Browserify setup
/* What we want right now :
 * - babelify experimental
 * - watchified bundle generation
 */

var customBrowserifyOpts = {
	entries: ['./app/scripts/main.js'],
	debug: gutil.env.type == 'prod' ? false : true
}

var opts = assign({}, watchify.args, customBrowserifyOpts);


gulp.task('css-app', function() {
	gulp.src('./app/styles/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(concat('app.css'))
		.pipe(sourcemaps.write())
		.pipe(gutil.env.type == 'prod' ? minifyCss() : gutil.noop())
		.pipe(gulp.dest('./dist/assets/'))
		.pipe(gulp.filter('**/*.css'))
		.pipe(browserSync.reload({stream:true}));
});

function bundle() {
	return b.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps:true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'))
}

var bBase = browserify(opts)
				.transform(babelify.configure({
					stage: 0 //enabling that es7 goodness
				}));
var b = watchify(bBase);
b.on('update',bundle);
b.on('log',gutil.log);

gulp.task('browserify', bundle);

gulp.task('build', [], function() {

})

gulp.task('serve', ['css-app', 'browserify'], function() {
	browserSync.init({
		server:'./dist'
	});

	gulp.watch('./app/styles/*.scss',['css-app']);
	gulp.watch('./dist/bundle.js',browserSync.reload);
});

gulp.task('default',['serve']);

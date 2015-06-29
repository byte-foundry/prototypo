var Promise = (global || window).Promise = require('bluebird'); //Bluebird promise are way better than native
var fs = Promise.promisifyAll(require('fs')); //We just want promise seriously
var path = require('path');

var gulp = require('gulp');
// CSS Dep
var sass = require('gulp-sass');

// BROWSERIFY Dep
var browserify = require('browserify');
var shim = require('browserify-shim');
var babelify = require('babelify');
var watchify = require('watchify');
var envify = require('envify/custom');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

//CSS Dep
var minifyCss = require('gulp-minify-css');

//Utils
var del = require('del');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var assign = require('lodash.assign');
var filter = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var through = require('through');

// Browserify setup
/* What we want right now :
 * - babelify experimental
 * - watchified bundle generation
 */

 customBrowserifyOpts = {
	entries: ['./app/scripts/main.js'],
	debug: true,//gutil.env.type == 'prod' ? false : true,
	extensions: ['.jsx'],
	noParse: [
		path.resolve('node_modules/prototypo.js/dist/prototypo.js'),
		path.resolve('node_modules/prototypo-canvas/dist/prototypo-canvas.js')
	]
}

var opts = assign({}, watchify.args, customBrowserifyOpts);

gulp.task('images', function() {
	gulp.src('./app/images/*.*')
		.pipe(gulp.dest('./dist/assets/images/'));
});

gulp.task('cp-prototypo.js', function() {
	gulp.src('./node_modules/prototypo.js/dist/prototypo.js')
		.pipe(gulp.dest('./dist/prototypo.js/dist/'));
});

gulp.task('cp-genese', function() {
	gulp.src('./node_modules/genese.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/genese.ptf/dist/'));
});

gulp.task('cp-static', function() {
	gulp.src(['./app/index.html','./app/robots.txt','./app/favicon.ico','404.html'])
		.pipe(gulp.dest('./dist/'));
});

gulp.task('cp-scripts', function() {
	gulp.src(['./app/scripts/**/*.*'])
		.pipe(gulp.dest('./dist/app/scripts'));

})

gulp.task('css-vendor', function() {
	//This is a bit hackish but right now i don't care
	gulp.src(['./node_modules/normalize.css/normalize.css','./node_modules/please-wait/build/please-wait.css'])
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('./dist/assets/'));
})


gulp.task('css-app', function() {
	gulp.src('./app/styles/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(concat('app.css'))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write())
		//.pipe(gutil.env.type == 'prod' ? minifyCss() : gutil.noop())
		.pipe(gulp.dest('./dist/assets/'))
		.pipe(filter('**/*.css'))
		.pipe(browserSync.reload({stream:true}));
});

function bundle() {
	return b.then(function(b) {

		return b.bundle()
			.on('error', gutil.log.bind(gutil, 'Browserify Error'))
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps:true}))
			.pipe(sourcemaps.write('./'))
//			.pipe(gutil.env.type == 'prod' ? uglify() :gutil.noop())
			.pipe(gulp.dest('dist'))
	})
}

var readPrelude = fs.readFileAsync('./__prelude.js');

var bBase = readPrelude.then(function(prelude) {
	return browserify(opts)
		// adds __prelude.js to all files in app/scripts
		.transform(function(file) {
			if (file.indexOf('prototypo/app/scripts') != -1) {
				var data = prelude;
				return through(write, end);

				function write(buf) { data += buf }

				function end() {
					this.queue(data);
					this.queue(null);
				}
			} else {
				return through(function write(data) {
					this.queue(data);
				}, function end() {
					this.queue(null);
				});
			}
		})
		.transform(babelify.configure({
			stage: 0, //enabling that es7 goodness
			extensions:['.jsx','.js']
		}))
		.transform(envify({
			NODE_ENV: gutil.env.type === 'prod' ? 'production' : 'development',
			__SHOW_RENDER__: gutil.env.type === 'debug' ? true : false
		}));
});

var b = bBase.then(function(browserify) {
	var b = gutil.env.type == 'prod' ? browserify : watchify(browserify);
	b.on('update',bundle);
	b.on('log',gutil.log);
	return b;
});

gulp.task('clean',function() {
	del.sync(['dist']);
})

gulp.task('browserify', bundle);

gulp.task('build', ['images','css-vendor','css-app','browserify','cp-prototypo.js','cp-genese','cp-static','cp-scripts']);

gulp.task('serve', ['images','css-vendor','css-app', 'browserify','cp-static'], function() {
	browserSync.init({
		server:['./dist','./node_modules'],
		port:9000,
		ghostMode:false
	});

	gulp.watch('./app/styles/**/*.scss',['css-app']);
	gulp.watch('./dist/bundle.js',browserSync.reload);
});

gulp.task('test-serve', function() {
	browserSync.init({
		server:['./dist','./node_modules'],
		port:9000,
		ghostMode:false
	});

	gulp.watch('./app/styles/**/*.scss',['css-app']);
	gulp.watch('./dist/bundle.js',browserSync.reload);

})

gulp.task('default',['serve']);

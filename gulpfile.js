var Promise         = require('bluebird'); //Bluebird promise are way better than native
var fs              = Promise.promisifyAll(require('fs')); //We just want promise seriously

var gulp            = require('gulp');

//webpack Dep
var webpack			= require('webpack');
var WebpackDevServer= require('webpack-dev-server');

//CSS Dep
var sass            = require('gulp-sass');
var cssnano       = require('gulp-cssnano');

//Utils
var del             = require('del');
var concat          = require('gulp-concat');
var sourcemaps      = require('gulp-sourcemaps');
var filter          = require('gulp-filter');
var autoprefixer    = require('gulp-autoprefixer');
var gutil			= require('gulp-util');

//Tests
var nightwatch		= require('gulp-nightwatch');

gulp.task('images', function() {
	gulp.src(['./app/images/*.*', './app/images/**/*.*'])
		.pipe(gulp.dest('./dist/assets/images/'));
	gulp.src('./app/fonts/*.*')
		.pipe(gulp.dest('./dist/assets/fonts/'));
});

gulp.task('cp-prototypo.js', function() {
	gulp.src('./node_modules/prototypo.js/dist/prototypo.js')
		.pipe(gulp.dest('./dist/prototypo.js/dist/'));
	gulp.src('./node_modules/prototypo-canvas/src/worker.js')
		.pipe(gulp.dest('./dist/prototypo-canvas/src/'));
});

gulp.task('cp-genese', function() {
	gulp.src('./node_modules/john-fell.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/john-fell.ptf/dist/'));
	gulp.src('./node_modules/venus.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/venus.ptf/dist/'));
	gulp.src('./node_modules/elzevir.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/elzevir.ptf/dist/'));
	gulp.src('./node_modules/antique.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/antique.ptf/dist/'));
});

gulp.task('cp-static', function() {
	gulp.src(['./app/index.html', './app/iframe.html','./app/robots.txt','./app/favicon.ico','./app/404.html','./app/scripts/jquery.js','./app/hoodie/*.js'])
		.pipe(gulp.dest('./dist/'));
});

gulp.task('css-vendor', function() {
	//This is a bit hackish but right now i don't care
	gulp.src(['./node_modules/normalize.css/normalize.css',
		'./node_modules/please-wait/build/please-wait.css'])
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
		.pipe(gulp.dest('./dist/assets/'))
		.pipe(filter('**/*.css'));
});

gulp.task('clean',function() {
	del.sync(['dist']);
});

gulp.task('build', ['clean', 'images','css-vendor','css-app','cp-prototypo.js','cp-genese','cp-static'],  function(callback) {
	// run webpack
	var webpackConfig	= require('./prod.config.js');
	var prototypoConfig = Object.create(webpackConfig);
	webpack(prototypoConfig,
		function(err, stats) {
			if(err) throw new gutil.PluginError("webpack", err);
			gutil.log("[webpack]", stats.toString({
			// output options
			}));
			callback();
		}
	);
});

gulp.task('clean:dll', function(cb) {
	del.sync(['dll']);
});

gulp.task('webpack:dll', function(callback) {
	var dllWebpackConfig   = require('./dll.config.js');
	var prototypoConfig = Object.create(dllWebpackConfig);
	webpack(prototypoConfig, function(err, stats) {
		if (err) return new gutil.PluginError("webpack", err);

		gutil.log('[webpack]', stats.toString({
		}));

		callback();
	});
});

gulp.task('watch-font', function() {
	return gulp.watch(['./node_modules/john-fell.ptf/dist/font.json','./node_modules/venus.ptf/dist/font.json','./node_modules/elzevir.ptf/dist/font.json','./node_modules/antique.ptf/dist/font.json'], ['cp-genese']);
});

gulp.task('watch-prototypojs', function() {
	return gulp.watch(['./node_modules/prototypo.js/dist/prototypo.js','./node_modules/prototypo-canvas/src/worker.js'], ['cp-prototypo.js']);
});

gulp.task('serve',['clean', 'images','cp-prototypo.js','cp-genese','cp-static','watch-font', 'watch-prototypojs','webpack:dll'], function(callback) {
	var webpackConfig	= require('./webpack.config.js');
	// Start a webpack-dev-server
	var prototypoConfig = Object.create(webpackConfig);
	prototypoConfig.debug = true;
	var compiler = webpack(prototypoConfig);

	new WebpackDevServer(compiler, {
		publicPath: webpackConfig.output.publicPath,
		hot: true,
		contentBase: 'dist/',
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000,
		},
	}).listen(9000, "0.0.0.0", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		// Server listening
		gutil.log("[webpack-dev-server]", "http://localhost:9000/webpack-dev-server/index.html");

		// keep the server alive or continue?
	});
});

gulp.task('debug', ['clean', 'images','cp-prototypo.js','cp-genese','cp-static','webpack:dll'], function(callback) {
	var webpackConfig	= require('./debug.config.js');
	// Start a webpack-dev-server
	var prototypoConfig = Object.create(webpackConfig);
	prototypoConfig.debug = true;
	var compiler = webpack(prototypoConfig);

	new WebpackDevServer(compiler, {
		publicPath: webpackConfig.output.publicPath,
		hot: true,
		contentBase: 'dist/',
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000,
		},
	}).listen(9000, "0.0.0.0", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		// Server listening
		gutil.log("[webpack-dev-server]", "http://localhost:9000/webpack-dev-server/index.html");

		// keep the server alive or continue?
	});
});


gulp.task('test', function(callback) {
	return gulp.src('')
	.pipe(nightwatch({
		cliArgs: {
			env: 'default,chrome_win8,chrome_win7,firefox_win7,chrome_mac,firefox_mac'
		}
	}));
});

gulp.task('test:basic', function(callback) {
	return gulp.src('')
	.pipe(nightwatch());
});

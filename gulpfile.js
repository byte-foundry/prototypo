var Promise         = require('bluebird'); //Bluebird promise are way better than native
var fs              = Promise.promisifyAll(require('fs')); //We just want promise seriously

var gulp            = require('gulp');

//webpack Dep
var webpack			= require('webpack');
var WebpackDevServer= require('webpack-dev-server');
var webpackConfig	= require('./webpack.config.js');

//CSS Dep
var sass            = require('gulp-sass');
var minifyCss       = require('gulp-minify-css');

//Utils
var del             = require('del');
var concat          = require('gulp-concat');
var sourcemaps      = require('gulp-sourcemaps');
var filter          = require('gulp-filter');
var autoprefixer    = require('gulp-autoprefixer');
var gutil			= require('gulp-util');

gulp.task('images', function() {
	gulp.src('./app/images/*.*')
		.pipe(gulp.dest('./dist/assets/images/'));
	gulp.src('./app/fonts/*.*')
		.pipe(gulp.dest('./dist/assets/fonts/'));
});

gulp.task('cp-prototypo.js', function() {
	gulp.src('./node_modules/prototypo.js/dist/prototypo.js')
		.pipe(gulp.dest('./dist/prototypo.js/dist/'));
});

gulp.task('cp-genese', function() {
	gulp.src('./node_modules/john-fell.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/john-fell.ptf/dist/'));
	gulp.src('./node_modules/venus.ptf/dist/font.json')
		.pipe(gulp.dest('./dist/venus.ptf/dist/'));
});

gulp.task('cp-static', function() {
	gulp.src(['./app/index.html','./app/robots.txt','./app/favicon.ico','404.html'])
		.pipe(gulp.dest('./dist/'));
});

gulp.task('css-vendor', function() {
	//This is a bit hackish but right now i don't care
	gulp.src(['./node_modules/normalize.css/normalize.css',
		'./node_modules/please-wait/build/please-wait.css',
		'./node_modules/react-gemini-scrollbar/node_modules/gemini-scrollbar/gemini-scrollbar.css'])
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

gulp.task('webpack', function(callback) {
	// run webpack
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

gulp.task("webpack-dev-server",['clean', 'images','css-vendor','css-app','cp-prototypo.js','cp-genese','cp-static'], function(callback) {
	// Start a webpack-dev-server
	var prototypoConfig = Object.create(webpackConfig);
	prototypoConfig.devtool = 'eval';
	prototypoConfig.debug = true;
	var compiler = webpack(prototypoConfig);

	new WebpackDevServer(compiler, {
		publicPath: webpackConfig.output.publicPath,
		hot: true,
		contentBase: 'dist/',
	}).listen(9000, "0.0.0.0", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		// Server listening
		gutil.log("[webpack-dev-server]", "http://localhost:9000/webpack-dev-server/index.html");

		// keep the server alive or continue?
		// callback();
	});
});

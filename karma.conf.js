// Karma configuration
// Generated on Mon Jan 18 2016 15:54:12 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
	  basePath: '',
	  urlRoot: '__karma__',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
	files: [
		'test/test.webpack.js',
		{pattern:'dist/*.js', included: false},
		{pattern:'dist/**/*.js', included: false},
		{pattern:'dist/**/*.svg', included: false},
		{pattern:'dist/**/*.png', included: false},
		{pattern:'dist/**/*.otf', included: false},
		{pattern:'dist/**/*.css', included: false},
		'app/index.html',
    ],


    // list of files to exclude
    exclude: [
	],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
		'test/test.webpack.js': ['webpack'],
		'**/*.html': ['html2js'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress'],

	browserStack: {
		username: process.env.BROWSERSTACK_USERNAME,
		accessKey: process.env.BROWSERSTACK_KEY
	},

	customLaunchers: {
		bs_firefox_mac: {
			base: 'BrowserStack',
			browser: 'firefox',
			browser_version: '21.0',
			os: 'OS X',
			os_version: 'Mountain Lion'
		},
		bs_chrome_mac: {
			base: 'BrowserStack',
			browser: 'firefox',
			browser_version: '21.0',
			os: 'OS X',
			os_version: 'Mountain Lion'
		},
		bs_chrome_win: {
			base: 'BrowserStack',
			browser: 'Chrome',
			browser_version: '47.0',
			os: 'Windows',
			os_version: '8',
		},	
		bs_firefox_win: {
			base: 'BrowserStack',
			browser: 'firefox',
			browser_version: '43.0',
			os: 'Windows',
			os_version: '8',
		},	
	},

	webpack: {
		devtool: 'eval',
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loaders: ['babel-loader'],
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loaders: ['babel-loader'],
				},
			],
		},
		resolve: {
			extensions: ['', '.js', '.jsx'],
		}
	},

	proxies: {
		'/__karma__/assets/': '/__karma__/base/dist/assets/',
	},

	//browsers: ['bs_firefox_mac', 'bs_chrome_mac', 'bs_chrome_win', 'bs_firefox_win'],
	browsers: ['bs_firefox_win'],
	//browsers: ['Chrome'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
	concurrency: Infinity
  })
}

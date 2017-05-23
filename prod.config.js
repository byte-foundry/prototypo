var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

module.exports = {
	cache: true,
	'if-loader': 'prod',
	entry: {
		bundle: [
			'whatwg-fetch',
			'babel-polyfill',
			'./app/scripts/main',
		],
		'web-import': [
			'whatwg-fetch',
			'babel-polyfill',
			'./app/scripts/web-import.js',
		],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '',
		filename: '[name].js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['transform/cacheable?envify', 'babel-loader?cacheDirectory', 'if-loader'],
				include: [
					path.join(__dirname, 'app'),
				],
			},
			{
				test: /prototypo\-canvas/,
				loaders: [ 'babel-loader?cacheDirectory'],
				include: [
					fs.realpathSync(__dirname + '/node_modules/prototypo-canvas'),
				],
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass'],
				include: [
					path.join(__dirname, 'app/styles'),
				],
			},
			{
				test: /\.css$/,
				loaders: ['style', 'css'],
			},
			{
				test: /\.json$/, loader: 'json',
			},
			{
				test: /\.(jpg|otf)$/,
				loaders: ['file'],
			},
			{
				test: /\.(svg|png|jpg|gif)$/,
				loader: 'url-loader?limit=100000',
				exclude: path.join(__dirname, 'app/images/icons'),
			},
			{
				test: /\.svg$/,
				loader: 'svg-sprite-loader?extract=false!svgo-loader',
				include: path.join(__dirname, 'app/images/icons'),
			},
		],
		noParse: /(levelup|dist\/prototypo-canvas)/,
	},
	externals: [{
		'./node/window': true,
		'./node/extend': true,
	}],
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				conditionals: false
			}
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
		new webpack.ProvidePlugin({
			_: 'lodash',
		}),
	],
	resolve: {
		extensions: ['', '.js', '.jsx'],
	},
};

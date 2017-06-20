var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var SpritePlugin = require('svg-sprite-loader/plugin');

module.exports = {
	'if-loader': 'prod',
	entry: {
		bundle: [
			'babel-polyfill',
			'./app/scripts/main',
		],
		'web-import': [
			'babel-polyfill',
			'./app/scripts/web-import',
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
				test: /prototypo-canvas/,
				loaders: ['babel-loader?cacheDirectory'],
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
				loader: 'svg-sprite-loader?extract=true!svgo-loader',
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
		new webpack.ProvidePlugin({
			_: 'lodash',
		}),
		new SpritePlugin(),
	],
	resolve: {
		extensions: ['', '.js', '.jsx'],
	},
};

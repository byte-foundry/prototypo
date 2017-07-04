const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');

const base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	'if-loader': 'prod',
	entry: {
		bundle: ['whatwg-fetch'],
		'web-import': ['whatwg-fetch'],
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [
					{
						loader: 'transform/cacheable-loader',

						options: {
							envify: true,
						},
					},
					{
						loader: 'babel-loader',

						options: {
							cacheDirectory: true,
						},
					},
					'if-loader',
				],
				include: [path.join(__dirname, 'app')],
			},
		],
	},
	externals: [
		{
			'prototypo.js': 'prototypo',
		},
	],
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production'),
			},
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				conditionals: false,
			},

			sourceMap: true,
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		// TODO: deprecated option, https://webpack.js.org/guides/migrating/#uglifyjsplugin-minimize-loaders
		new webpack.optimize.LoaderOptionsPlugin({
			minimize: true,
		}),
	],
	resolve: {
		fallback: path.join(__dirname, 'node_modules'),
	},
});

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');

const base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	entry: {
		bundle: ['whatwg-fetch'],
		'web-import': ['whatwg-fetch'],
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [
					// {
					// 	loader: 'transform/cacheable-loader',
					//
					// 	options: {
					// 		envify: true,
					// 	},
					// },
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
				// TODO: deprecated option, https://webpack.js.org/guides/migrating/#uglifyjsplugin-minimize-loadersminimize: true,
				minimize: true,
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
	],
});

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');

const base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	devtool: 'source-map',
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
			},
		}),
	],
});

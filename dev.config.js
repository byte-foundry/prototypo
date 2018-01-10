const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	devtool: 'source-map',
	entry: {
		index: ['whatwg-fetch'],
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [
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
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development'),
				TESTING_FONT: false,
			},
		}),
		new UglifyJsPlugin({
			sourceMap: true,
			include: __dirname,
			extractComments: true,
		}),
	],
	output: merge(base.output, {
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	}),
});

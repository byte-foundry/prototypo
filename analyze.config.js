const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');

const base = require('./base.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;

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
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new BundleAnalyzerPlugin({
			analyzerHost: '0.0.0.0',
			analyzerPort: 8000,
			defaultSizes: 'gzip',
			generateStatsFile: false,
		}),
	],
});

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const merge = require('webpack-merge');

const base = require('./prod.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;

module.exports = merge(base, {
	cache: true,
	devtool: 'source-map',
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new BundleAnalyzerPlugin({
			analyzerHost: '0.0.0.0',
			analyzerPort: 8000,
		}),
	],
});

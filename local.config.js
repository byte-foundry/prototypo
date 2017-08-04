var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var merge = require('webpack-merge');

var base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	devtool: 'cheap-module-source-map',
	entry: {
		bundle: [
			'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
			'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		],
		'web-import': [
			'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
			'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		],
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['react-hot-loader', 'babel-loader?cacheDirectory', 'if-loader'],
				exclude: /node_modules/,
				include: [
					path.join(__dirname, 'app'),
				],
			},
		],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: require('./dist/dll/libs-manifest'),
			sourceType: 'this',
		}),
	],
});

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const base = require('./base.config');

module.exports = merge(base, {
	cache: true,
	devtool: 'cheap-module-source-map',
	entry: {
		index: [
			'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
			'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		],
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['babel-loader?cacheDirectory', 'if-loader'],
				exclude: /node_modules/,
				include: [path.join(__dirname, 'app')],
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
		new webpack.DefinePlugin({
			'process.env': {
				TESTING_FONT: JSON.stringify('yes'),
				MERGE: JSON.stringify(process.env.MERGE),
			},
		}),
	],
	output: merge(base.output, {
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	}),
});

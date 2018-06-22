const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		library: ['./app/scripts/prototypo.js/index.js'],
	},
	output: {
		path: path.join(__dirname, 'app/scripts/prototypo.js/dist'),
		publicPath: '',
		chunkFilename: '[name].bundle.js',
		filename: '[name].js',
		libraryTarget: 'umd',
		library: 'Ptypo',
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.jsx?$/,
				use: [
					{loader: 'babel-loader', options: {cacheDirectory: true}},
					'if-loader',
				],
				include: [path.join(__dirname, 'app')],
			},
		],
		noParse: /(levelup)/,
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new webpack.DefinePlugin({
			'process.env': {
				LIBRARY: true,
			},
		}),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	resolve: {
		extensions: ['.js', '.jsx'],
	},
};

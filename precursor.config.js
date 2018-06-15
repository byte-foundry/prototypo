const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		library: ['./app/scripts/prototypo.js/precursor/index.js'],
	},
	output: {
		path: path.join(__dirname, 'app/scripts/prototypo.js/precursor/dist'),
		publicPath: '',
		filename: 'precursor.js',
		libraryTarget: 'umd',
		library: 'FontPrecursor',
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
	],
	resolve: {
		extensions: ['.js', '.jsx'],
	},
};

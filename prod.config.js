var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
	'if-loader': 'prod',
	entry: [
		'babel-polyfill',
		'./app/scripts/main'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{ 
				test: /\.jsx?$/,
				loaders: ['transform/cacheable?envify', 'babel-loader?cacheDirectory', 'prelude-loader', 'if-loader'],
				include: [
					path.join(__dirname, 'app')
				]
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass'],
				include: [
					path.join(__dirname, 'app/styles'),
				],
			},
			{
				test: /\.css$/,
				loaders: ['style', 'css'],
			},
			{
				test: /\.(svg|json|png|jpg|otf)$/,
				loaders: ['file'],
			},
		],
		noParse:/(dist\/prototypo-canvas|levelup)/
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': "'production'",
		}), 
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
	],
	resolve: {
		extensions: ['','.js', '.jsx']
	}
};

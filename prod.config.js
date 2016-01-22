var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
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
				loaders: ['prelude-loader','react-hot-loader', 'babel-loader?cacheDirectory'],
				include: [
					path.join(__dirname, 'app')
				]
			}
		],
		noParse:/(dist\/prototypo-canvas|levelup)/
	},
	plugins: [
	],
	resolve: {
		extensions: ['','.js', '.jsx']
	}
}

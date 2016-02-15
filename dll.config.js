var path = require('path');
var webpack = require('webpack');
var node_modules = path.resolve(__dirname, 'node_modules');

module.exports = {
	entry: {
		libs: [
			'react',
			'react-dom',
			'react-addons-create-fragment',
			'moment',
			'babel-polyfill',
			'lifespan',
			'nexus-flux',
			'remutable',
			'bluebird',
			'react-router',
			'jszip',
			'xxhashjs',
			'pouchdb',
			'pouchdb-hoodie-api',
			'react-json-pretty',
		],
	},
	module: {
		noParse: [
			/(levelup)/
		]
	},
	output: {
		path: path.join(__dirname, 'dist/dll/'),
		filename: '[name].dll.js',
		library: '[name]_[hash]',
		libraryTarget: 'this'
	},
	plugins: [
		new webpack.DllPlugin({
			path: path.join(__dirname, 'dist/dll/', '[name]-manifest.json'),
			name: '[name]_[hash]',
		})
	],
}

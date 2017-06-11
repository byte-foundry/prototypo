var path = require('path');
var webpack = require('webpack');
var node_modules = path.resolve(__dirname, 'node_modules');

module.exports = {
	entry: {
		libs: [
			'react',
			'react-dom',
			'react-addons-css-transition-group',
			'react-addons-pure-render-mixin',
			'react-draggable',
			'react-joyride',
			'react-json-pretty',
			'react-router',
			'react-scrollbar/dist/no-css',
			'react-select',
			'moment',
			'babel-polyfill',
			'lifespan',
			'nexus-flux',
			'remutable',
			'bluebird',
			'jszip',
			'xxhashjs',
			'pouchdb',
			'pouchdb-hoodie-api',
			'slug',
			'lodash',
			'diff'
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
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': "'production'",
		}),
		new webpack.DllPlugin({
			path: path.join(__dirname, 'dist/dll/', '[name]-manifest.json'),
			name: '[name]_[hash]',
		})
	],
}

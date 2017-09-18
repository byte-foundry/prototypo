const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SpritePlugin = require('svg-sprite-loader/plugin');

const extractSass = new ExtractTextPlugin({
	filename: 'styles.css',
	disable: process.env.NODE_ENV !== 'production',
});

const extractCss = new ExtractTextPlugin({
	filename: 'vendors.css',
	disable: process.env.NODE_ENV !== 'production',
});

module.exports = {
	entry: {
		bundle: ['react-hot-loader/patch', './app/scripts/main'],
		'web-import': ['react-hot-loader/patch', './app/scripts/web-import'],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		pathinfo: true,
		publicPath: '',
		filename: '[name].js',
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
				include: path.join(__dirname, 'app'),
			},
			{
				test: /prototypo-canvas/,
				use: [{loader: 'babel-loader', options: {cacheDirectory: true}}],
				include: [fs.realpathSync(`${__dirname}/node_modules/prototypo-canvas`)],
			},
			{
				test: /\.scss$/,
				use: extractSass.extract({
					use: ['css-loader', 'sass-loader'],
					fallback: 'style-loader',
				}),
				include: [path.join(__dirname, 'app/styles')],
			},
			{
				test: /\.css$/,
				use: extractCss.extract({
					use: 'css-loader',
					fallback: 'style-loader',
				}),
			},
			{
				test: /\.(jpg|otf)$/,
				use: ['file-loader'],
			},
			{
				test: /\.(svg|png|jpg|gif)$/,
				use: [
					{
						loader: 'url-loader',

						options: {
							limit: 100000,
						},
					},
				],
				exclude: path.join(__dirname, 'app/images/icons'),
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'svg-sprite-loader',

						options: {
							extract: true,
						},
					},
					'svgo-loader',
				],
				include: path.join(__dirname, 'app/images/icons'),
			},
		],
		noParse: /(levelup|dist\/prototypo-canvas)/,
	},
	externals: [
		{
			'./node/window': true,
			'./node/extend': true,
		},
	],
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': 'prod',
			},
		}),
		new webpack.ProvidePlugin({
			_: 'lodash',
		}),
		extractCss,
		extractSass,
		new SpritePlugin(),
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

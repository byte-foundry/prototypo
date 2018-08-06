const path = require('path');
const webpack = require('webpack');
const SpritePlugin = require('svg-sprite-loader/plugin');

module.exports = {
	entry: {
		index: ['./app/scripts/main'],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		pathinfo: true,
		publicPath: '',
		filename: '[name].bundle.js',
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
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
				include: [path.join(__dirname, 'app/styles')],
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
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
			{
				test: /\.md$/,
				loader: 'raw-loader',
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
		alias: {
			'lodash-es': 'lodash',
			'lodash.assign': 'lodash/assign',
			'lodash.camelcase': 'lodash/camelcase',
			'lodash.clone': 'lodash/clone',
			'lodash.clonedeep': 'lodash/clonedeep',
			'lodash.cond': 'lodash/cond',
			'lodash.create': 'lodash/create',
			'lodash.debounce': 'lodash/debounce',
			'lodash.deburr': 'lodash/deburr',
			'lodash.defaultsdeep': 'lodash/defaultsdeep',
			'lodash.escape': 'lodash/escape',
			'lodash.flattendeep': 'lodash/flattendeep',
			'lodash.isarguments': 'lodash/isarguments',
			'lodash.isarray': 'lodash/isarray',
			'lodash.isplainobject': 'lodash/isPlainObject',
			'lodash.isstring': 'lodash/isstring',
			'lodash.keys': 'lodash/keys',
			'lodash.mapvalues': 'lodash/mapvalues',
			'lodash.memoize': 'lodash/memoize',
			'lodash.merge': 'lodash/merge',
			'lodash.mergewith': 'lodash/mergewith',
			'lodash.pick': 'lodash/pick',
			'lodash.restparam': 'lodash/restparam',
			'lodash.some': 'lodash/some',
			'lodash.sortby': 'lodash/sortby',
			'lodash.template': 'lodash/template',
			'lodash.templatesettings': 'lodash/templatesettings',
			'lodash.toarray': 'lodash/toarray',
			'lodash.uniq': 'lodash/uniq',
			'lodash.words': 'lodash/words',
		},
	},
};

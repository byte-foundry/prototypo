var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
	devtool: 'source-map',
	'if-loader': 'prod',
	entry: {
		bundle: [
			'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
			'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
			'babel-polyfill',
			'./app/scripts/main',
		],
		'web-import': [
			'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
			'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
			'babel-polyfill',
			'./app/scripts/web-import.js',
		],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '',
		filename: '[name].js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['react-hot-loader', 'babel-loader?cacheDirectory', 'prelude-loader', 'if-loader'],
				include: [
					path.join(__dirname, 'app'),
				],
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
				// loaders: ['style', 'css'],
				loader: 'style-loader!css-loader',
			},
			{
				test: /\.(json|otf)$/,
				loaders: ['file'],
			},
			{
				test: /\.(svg|png|jpg)$/,
				loader: 'url-loader?limit=100000',
			},
		],
		noParse: /(dist\/prototypo-canvas)/,
	},
	plugins: [
		/*new webpack.DefinePlugin({
			'process.env.__SHOW_RENDER__': "true",
			'process.env.__SHOW_ACTION__': "true",
			}),*/
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: require('./dist/dll/libs-manifest'),
			sourceType: 'this',
		}),
	],
	resolve: {
		extensions: ['', '.js', '.jsx'],
	},
};

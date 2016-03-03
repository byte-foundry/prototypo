var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
	devtool: 'source-map',
	'if-loader': 'prod',
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		'babel-polyfill',
		'./app/scripts/main',
	],
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '',
		filename: 'bundle.js',
	},
	module: {
		loaders: [
			{ 
				test: /\.jsx?$/,
				loaders: ['react-hot-loader', 'babel-loader?cacheDirectory', 'prelude-loader', 'if-loader'],
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
		noParse: /(dist\/prototypo-canvas)/,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: require('./dist/dll/libs-manifest'),
			sourceType: 'this',
		}),
	],
	resolve: {
		extensions: ['','.js', '.jsx'],
	},
};

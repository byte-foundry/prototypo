var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
	devtool: 'cheap-module-eval-source-map',
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors 
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
		noParse:/(dist\/prototypo-canvas)/
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
		extensions: ['','.js', '.jsx']
	}
}

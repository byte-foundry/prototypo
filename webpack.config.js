var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors 
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
				preloaders: ['prelude-loader'],
				loaders: ['react-hot-loader', 'babel-loader'],
				include: [
					path.join(__dirname, 'app'),
					path.join(__dirname, '/node_modules/nexus-flux'),
					path.join(__dirname, '/node_modules/remutable'),
					path.join(__dirname, '/node_modules/lifespan')
				]
			}
		],
		noParse:/(levelup)|(prototypo-canvas)/
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
	resolve: {
		extensions: ['','.js', '.jsx']
	}
}

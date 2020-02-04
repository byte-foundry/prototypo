// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add addional webpack configurations.
// For more information refer the docs: https://getstorybook.io/docs/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const path = require('path');
var merge = require('webpack-merge');

const base = require('../base.config');

const genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');

module.exports = (baseConfig, env) => {
	const config = genDefaultConfig(baseConfig, env);

	config.entry.manager.unshift('core-js/stable');
	config.entry.manager.unshift('regenerator-runtime/runtime');
	config.entry.preview.unshift('core-js/stable');
	config.entry.preview.unshift('regenerator-runtime/runtime');

	config.module.rules[3].exclude = path.join(__dirname, '../app/images/icons');

	config.module.rules.push({
		test: /\.scss$/,
		use: ['style-loader', 'css-loader', 'sass-loader'],
		include: [path.join(__dirname, '../app/styles')],
	});
	config.module.rules.push({
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
		include: path.join(__dirname, '../app/images/icons'),
	});
	config.plugins = config.plugins.concat(base.plugins);

	return config;
};

var config = require('./webpack.config.js');

config['if-loader'] = 'offline';

module.exports = config;

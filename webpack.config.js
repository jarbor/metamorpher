const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		'metamorpher': './src/metamorpher.js',
		'metamorpher.min': './src/metamorpher.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname),
		library: 'metamorpher',
		libraryTarget: 'umd'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
		}]
	},
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};
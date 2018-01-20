const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackPluginIndex = new HtmlWebpackPlugin({
    template: './src/frontend/index.html',
    filename: 'index.html',
    inject: 'body',
    chunks: ['index']
});

const HtmlWebpackPluginVideo = new HtmlWebpackPlugin({
    template: './src/frontend/video.html',
    filename: 'video.html',
    inject: 'body',
    chunks: ['video']
});

module.exports = {
    entry: {
        index: './src/frontend/index.js',
        video: './src/frontend/video.js'
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ],
        rules: [
            { test: /jsmpeg\.min\.js$/, use: ['script-loader']},
            { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] }
        ]
    },
    plugins: [
        HtmlWebpackPluginIndex,
        HtmlWebpackPluginVideo
    ]
};
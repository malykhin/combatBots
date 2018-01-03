const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
    template: './src/frontend/index.html',
    filename: 'index.html',
    inject: 'body'
});

module.exports = {
    entry: './src/frontend/index.js',
    output: {
        path: path.resolve('dist'),
        filename: 'bundle.js'
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
        HtmlWebpackPluginConfig
    ]
};
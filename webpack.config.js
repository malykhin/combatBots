const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
    template: './src/frontend/index.html',
    filename: 'index.html',
    inject: 'body'
});

const CopyWebpackPluginConfig = new CopyWebpackPlugin([{
    from: './src/frontend/assets',
    to: './'
}]);

module.exports = {
    entry: './src/frontend/index.js',
    output: {
        path: path.resolve('dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
    plugins: [
        HtmlWebpackPluginConfig,
        CopyWebpackPluginConfig
    ]
};
var path = require('path');

module.exports = {
    cache: true,
    target: 'atom',
    // devtool: 'source-map',
    // entry: {
    //     main: './src/js/main',
    // },
    entry: ['babel-polyfill', './src/js/main'],
    output: {
        path: path.join(__dirname, 'app'),
        filename: '[name].js',
        chunkFilename: '[chunkhash].js',
        sourceMapFilename: '[name].map'
    },
    module: {
        loaders: [
            {
                test: /\.js|\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-0','react']
                }
            },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.json?$/, loader: 'json-loader'}
        ]
    }
};
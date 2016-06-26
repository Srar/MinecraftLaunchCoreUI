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


// module.exports = {
//     cache: true,
//     target: 'atom',
//     //devtool: 'source-map',
//     entry: {
//         main: './src/js/main',
//         //settings: './src/js/settings',
//     },
//     output: {
//         path: path.join(__dirname, 'app'),
//         filename: '[name].js',
//         chunkFilename: '[chunkhash].js',
//         //sourceMapFilename: '[name].map'
//     },
//     module: {
//         loaders: [
//             {
//                 loader: 'babel-loader',
//                 include: [
//                     path.resolve(__dirname, 'src/js'),
//                 ],
//
//                 // Only run `.js` and `.jsx` files through Babel
//                 test: /\.js|\.jsx?$/,
//
//                 // Options to configure babel with
//                 query: {
//                     presets: ['es2015', 'react'],
//                 }
//             },
//             {
//                 loader: 'json-loader',
//                 test: /\.json?$/,
//             }
//         ]
//     },
//     plugins: [
//         new webpack.optimize.DedupePlugin(),
//         new webpack.optimize.UglifyJsPlugin({comments: false}),
//     ]
// };

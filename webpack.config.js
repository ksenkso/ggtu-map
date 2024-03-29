const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'ggtu-map.js',
        library: 'ggtuMap',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                ]
            },
            {
                test: /\.sass/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: 'svg-inline-loader'
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'cheap-eval-source-map',
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    watchOptions: {
        ignored: [
            /node_modules/,
            /dist/
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    ecma: 8
                }
            })
        ]
    }
};

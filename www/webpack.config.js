const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./bootstrap.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bootstrap.js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm']
    },
    mode: "development",
    plugins: [
        new CopyWebpackPlugin([
          'index.html',
          'tachyons.min.css',
          'favicon-32x32.png',
          'favicon-16x16.png',
        ])
    ],
};

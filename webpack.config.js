const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
    entry: {
        index: "./public/index.js"
    },
    output: {
        path: __dirname + "/public/dist",
        filename: "[name].bundle.js"
    },
    mode: "development",
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                },
            },
        },
        ],
    },
    plugins: [
        new WebpackPwaManifest({
        fingerprints: false,
        name: 'Budget Tracker PWA',
        short_name: 'HW-18',
        background_color: '#01579b',
        theme_color: '#ffffff',
        'theme-color': '#ffffff',
        start_url: '/',
        icons: [
            {
            src: path.resolve('public/icons/icon-192x192.png'),
            sizes: [192, 512],
            destination: path.join('assets', 'icons'),
            },
        ],
        }),
    ],
};

module.exports = config;
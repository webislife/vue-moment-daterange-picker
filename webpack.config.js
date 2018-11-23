/**
 * Main builder dependies
 */
const
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
    path = require('path'),
    webpack = require('webpack'),
    appConf = {
        WATCH: 0,
        NODE_ENV: 'development'
    },
    sassLoader = [
        'vue-style-loader',
        'css-loader',
        {
            loader: 'sass-loader'
        }
    ],
    webpackPlugins = [
        new VueLoaderPlugin()
    ];

if (appConf.WATCH === '0' && appConf.NODE_ENV === 'production') {
    webpackPlugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'webpack-report.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: 'webpack-stats.json'
        })
    );
}
const webpackconfig = {
    mode: appConf.NODE_ENV,
    watch: appConf.WATCH === '1',
    watchOptions: {
        aggregateTimeout: 250,
        ignored: /node_modules/
    },
    entry: {
        app: './src/app.js'
    },
    output: {
        filename: '[name].js',
        chunkFilename: "[name].js?[chunkhash]",
        path: path.resolve(__dirname, './dist'),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            js: [
                                'babel-loader'
                            ],
                            scss: sassLoader
                        }
                    }
                }
            },
            {
                test: /\.scss$/,
                use: sassLoader
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: 'babel-loader'
            }
        ]
    },
    optimization: {
        runtimeChunk: false,
    },
    stats: {
        colors: true,
        hash: false,
        timings: true,
        assets: false,
        chunks: true,
        chunkModules: false,
        modules: false,
        children: false,
        cached: false,
        depth: true,
        usedExports: true,
        source: false
    },
    plugins: webpackPlugins
};

module.exports = webpackconfig;

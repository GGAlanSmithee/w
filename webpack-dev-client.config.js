const path    = require('path')
const webpack = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const DEBUG = !process.argv.includes('--release')

const GLOBALS = {
    'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
    __DEV__: DEBUG
}

const appConfig = {
    entry: {
        app: [
            'babel-polyfill',
            'webpack/hot/only-dev-server',
            'webpack-hot-middleware/client?reload=true',
            path.resolve(__dirname, 'src/polyfill/index.js'),
            path.resolve(__dirname, 'src/index.js')
        ]
    },
    output: {
        pathinfo: true,
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    plugins: [
        new BrowserSyncPlugin({
            host: process.env.IP || 'localhost',
            port: process.env.PORT || 8080,
            server: {
                baseDir: ['./', './public']
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin(GLOBALS),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [
            {test: /\.js?$/,  include: path.join(__dirname, 'src'), loader: 'babel-loader'},
            {test: /\.json$/, include: path.join(__dirname, 'src'), loader: 'json-loader'},
            {test: /three\.js/, use: ['expose-loader?THREE']}
        ]
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    externals: {
        three: 'THREE',
        recast: 'recast'
    }
}

module.exports = appConfig
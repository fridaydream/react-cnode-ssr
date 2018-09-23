
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const baseConfig = require('./webpack.base')
const isDev = process.env.NODE_ENV === 'development'
const config = webpackMerge(baseConfig, {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js'
  },
  plugins: [
    new HTMLPlugin({
        template: path.join(__dirname, '../client/template.html')
    }),
    new HTMLPlugin({
      template: '!!ejs-compiled-loader!' + path.join(__dirname, '../client/server.template.ejs'),
      filename: 'server.ejs'
    })
  ]
})

if(isDev) {
  config.devtool = '#cheap-module-eval-source-map'
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: '8889',
    compress: true,
    // contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      index: '/public/index.html'
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3333/',
        changeOrigin: true
        // pathRewrite: {'^/api': ''}
      }
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.devtool = false
  config.entry = {
    app: path.join(__dirname, '../client/app.js'),
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'mobx',
      'mobx-react',
      'axios',
      'query-string',
      'dateformat',
      'marked'
    ]
  }
  config.output = {
    publicPath: 'https://iuap-tenat-market.oss-cn-beijing.aliyuncs.com/',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  }

  config.optimization = {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true
        },
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      },
    },
    namedModules: true,
    // minimizer: [new UglifyJsPlugin({})],
    runtimeChunk: {
      name: "manifest"
    }
  }
  config.performance = {
    hints: false
  }
}

module.exports = config

const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const webpack = require('webpack')
module.exports = {
  mode: isDev ? 'development': 'production',
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: /(node_modules)/
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV':  isDev ? '"development"': '"production"'
    }
  })]
}

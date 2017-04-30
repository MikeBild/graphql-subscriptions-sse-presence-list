const  webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./src/App.js'],
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['es2015', 'stage-0', 'react']}},
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        GRAPHQL_URL: JSON.stringify('https://graphql-subscriptions-sse-server.services.dropstack.run'),
      },
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ]
};
const path = require('path');
const { ProvidePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const StaticSiteWebpackPlugin = require('../index');

const { NODE_ENV = 'development' } = process.env;
const prod = NODE_ENV === 'production';

/** @type {import('webpack').Configuration} */
const config = {
  mode: prod ? 'production' : 'development',

  devtool: 'source-map',

  entry: prod ? './src/index.tsx' : './src/index.dev.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  plugins: [
    new ProvidePlugin({ React: 'react' }),

    new MiniCssExtractPlugin({ filename: 'styles/[name].[fullhash].css' }),

    new StaticSiteWebpackPlugin({
      __filename,
      entry: './src/index.ssr.tsx',
      paths: ['/', '/counter', '/not-found'],
    }),

    new CopyWebpackPlugin({
      patterns: [{ from: './static' }],
    }),
  ],

  devServer: {
    host: '0.0.0.0',
    port: '8000',
  },
};

module.exports = config;

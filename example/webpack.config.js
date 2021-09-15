const path = require('path');
const { ProvidePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const StaticSiteWebpackPlugin = require('../static-site-webpack-plugin');

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'development',
  // target: 'node',
  devtool: 'source-map',

  entry: './src/index.tsx',

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

      {
        test: /\.woff2?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]',
        },
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
};

module.exports = config;

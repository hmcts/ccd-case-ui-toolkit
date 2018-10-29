const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  devtool: 'source-map',
  mode: 'development',
  entry: {
    polyfills: path.resolve(__dirname, 'src', 'polyfills.browser.ts'),
    main: path.resolve(__dirname, 'src', 'main-jit.ts')
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.ts', '.json']
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'jit'),
    filename: '[name].js'
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: ['awesome-typescript-loader', 'angular2-template-loader'],
      },
      {
        test: /\.html$/, 
        loader: 'raw-loader'
      },
      {
        test: /\.scss$/,
        use: [{
              loader: "style-loader"
          }, {
              loader: "css-loader"
          }, {
              loader: "sass-loader"
        }],
      }
    ]
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       none_vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         chunks: "all",
  //         priority: 1
  //       }
  //     }
  //   }
  // }, 
  plugins: [
    new webpack.ProgressPlugin(),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.ejs'),
      title: 'Angular Library Starter',
      inject: 'body'
    }),

    /**
     * Plugin: ContextReplacementPlugin
     * Description: Provides context to Angular's use of System.import
     *
     * @see: https://github.com/angular/angular/issues/11580
     */
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.resolve(__dirname, 'src'),
      {}
    ),
    new ExtractTextPlugin({filename: 'src/app/app.scss'})
  ],

  devServer: {
    port: 8000,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    contentBase: path.join(__dirname, 'dist')
  },
};

module.exports = config;

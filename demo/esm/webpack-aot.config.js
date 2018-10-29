const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  devtool: 'source-map',
  entry: {
    polyfills: path.resolve(__dirname, 'dist', 'esm', 'src', 'polyfills.browser.js'),
    main: path.resolve(__dirname, 'dist', 'esm', 'src', 'main-aot.js')
  },
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'aot'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: path.resolve(__dirname, 'tsconfig-aot.json')
            }
          }
        ],
        exclude: [/node_modules/]
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
    )
  ]
};

module.exports = config;

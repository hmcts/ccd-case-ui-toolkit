const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const angularExternals = require('webpack-angular-externals');
const rxjsExternals = require('webpack-rxjs-externals');
const webpack = require('webpack');
const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

module.exports = {
  mode: 'production',
  entry: {
    'index.umd': './src/index.ts',
    'index.umd.min': './src/index.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'case-ui-toolkit'
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ]
  },
  externals: [
    angularExternals(),
    rxjsExternals()
  ],
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin ({
      terserOptions: {
        sourceMap: true,
        compress: true
      },
      include: /\.min\.js$/,
    })]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
          {
            loader: 'angular2-template-loader'
          }
        ],
        exclude: [
          /node_modules/,
          /\.(spec|e2e)\.ts$/
        ]
      },

      {
        test: /\.json$/,
        use: 'json-loader'
      },

      {
        test: /\.css$/,
        use: ['to-string-loader', 'css-loader']
      },

      {
        test: /\.scss$/,
        use: ['to-string-loader', 'css-loader', 'sass-loader']
      },

      {
        test: /\.html$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.join(__dirname, 'src')
    ),
    new webpack.BannerPlugin({
      banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */
      `.trim(),
      raw: true,
      entryOnly: true
    })

  ]
};

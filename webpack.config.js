const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // Entry point: where Webpack starts bundling
  // Uses the index.js file from the src directory
  entry: {
    main: './src/index.js'
  },

  // Output configuration: where the bundled file goes
  output: {
    // The bundled file will be named 'main.js'
    filename: 'main.js',
    // The output directory will be 'dist'
    path: path.resolve(__dirname, 'dist'),
    // Clean the output directory before each build
    clean: true,
    chunkFilename: 'chunk.js'
  },

  // Development server configuration
  devServer: {
    // Serve content from the 'dist' directory
    static: './dist',
    // Hot module replacement for faster development updates
    hot: true,
  },

  // Module rules (e.g., for CSS, images, Babel)
  module: {
    rules: [
      // JavaScript loader
      {
        test: /\.js$/,
        exclude: /node_modules/, 
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // CSS loader
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'postcss-preset-env'
                ]
              }
            }
          }
        ]
      },
      // HTML loader
      {
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          sources: {
            list: [
              { tag: 'img', attribute: 'src', type: 'src' },
              { tag: 'img', attribute: 'srcset', type: 'srcset' },
              { tag: 'link', attribute: 'href', type: 'href' }
            ]
          }
        }
      },
      // Images and fonts loader
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB limit for data URLs
          }
        }
      }
    ]
  },

  // Plugins configuration
  plugins: [
    // Automatically generates an index.html file in the dist folder
    // or updates an existing one based on a template.
    new HtmlWebpackPlugin({
      // Title for the generated HTML page
      title: 'Odin Todo List',
      // Use the existing src/index.html as the template
      // This ensures our Tailwind CDN link and basic structure are preserved.
      template: './src/index.html',
      // Inject the bundled script ('main.js') into the body
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    })
  ],

  // Optimization settings (more relevant for production builds)
  optimization: {
    // Helps with debugging by making module IDs more readable
    moduleIds: 'deterministic',
    // Separates runtime code into a separate chunk (good practice)
    runtimeChunk: 'single',
    // Splits vendor code (from node_modules) into a separate chunk
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};

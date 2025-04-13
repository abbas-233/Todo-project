const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point: where Webpack starts bundling
  // Uses the index.js file from the src directory
  entry: './src/index.js',

  // Output configuration: where the bundled file goes
  output: {
    // The bundled file will be named 'main.js'
    filename: 'main.js',
    // The output directory will be 'dist'
    path: path.resolve(__dirname, 'dist'),
    // Clean the output directory before each build
    clean: true,
  },

  // Development server configuration
  devServer: {
    // Serve content from the 'dist' directory
    static: './dist',
    // Hot module replacement for faster development updates
    hot: true,
  },

  // Module rules (e.g., for CSS, images, Babel)
  // We don't need specific loaders right now as CSS is via CDN
  // and we're using modern JS features supported by current browsers.
  module: {
    rules: [
      // Add loaders here if needed in the future (e.g., for CSS files, images)
      // {
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader'],
      // },
      // {
      //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
      //   type: 'asset/resource',
      // },
    ],
  },

  // Plugins configuration
  plugins: [
    // Automatically generates an index.html file in the dist folder
    // or updates an existing one based on a template.
    new HtmlWebpackPlugin({
      // Title for the generated HTML page
      title: 'Odin Todo List',
      // Use the existing dist/index.html as the template
      // This ensures our Tailwind CDN link and basic structure are preserved.
      template: './dist/index.html',
      // Inject the bundled script ('main.js') into the body
      inject: 'body',
    }),
  ],

  // Mode: 'development' or 'production'
  // Set via scripts in package.json ('--mode development' or '--mode production')
  // mode: 'development', // Default mode if not set by script

  // Source maps for easier debugging (maps bundled code back to original source)
  // 'inline-source-map' is good for development. Production might use 'source-map'.
  devtool: 'inline-source-map', // Change to 'source-map' for production if needed

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
          chunks: 'all',
        },
      },
    },
  },
};

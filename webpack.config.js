const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [
    nodeExternals({
      modulesFromFile: true,
    }),
    /*
    nodeExternals({
      modulesDir: path.resolve(__dirname, './node_modules'),
      whitelist: ['@hirightnow/shared']
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
    })
    */
  ],
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
  resolve: {
    alias: {
      '@hirightnow/shared': path.resolve(
        '../../node_modules/@hirightnow/shared',
      ),
      shared: path.resolve('../../node_modules/@hirightnow/shared'),
    },
  },
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        include: __dirname,
        exclude: [path.join(__dirname, 'src/tests')],
        // exclude: /node_modules/,
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  stats: {
    maxModules: Infinity,
    exclude: undefined,
  },
}

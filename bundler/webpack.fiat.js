const path = require('path')

const mode =
  process.argv.includes('--mode') && process.argv[process.argv.indexOf('--mode') + 1]
    ? process.argv[process.argv.indexOf('--mode') + 1]
    : 'development'

module.exports = {
  entry: path.resolve(__dirname, '../src/fiat-entry.js'),
  output: {
    path: path.resolve(__dirname, '../js'),
    filename: 'fiat.bundle.js',
    publicPath: '/',
    clean: false,
  },
  mode: mode === 'production' ? 'production' : 'development',
  devtool: mode === 'production' ? 'source-map' : 'eval-source-map',
  resolve: {
    fullySpecified: false,
  },
  module: {
    rules: [
      {
        test: /\.(vert|frag|glsl)$/,
        type: 'asset/source',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  performance: {
    maxAssetSize: 50000000,
    maxEntrypointSize: 50000000,
  },
}

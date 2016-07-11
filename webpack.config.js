const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Merge = require('webpack-merge');
const Validate = require('webpack-validator');

const Parts = require('./libs/parts');
const Pkg = require('./package.json');


const PATHS = {
  app: path.join(__dirname, 'app'),
  style: path.join(__dirname, 'app', 'main.scss'),
  build: path.join(__dirname, 'build')
};


const common = {
  entry: {
    app: PATHS.app,
    style: PATHS.style,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = Merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      Parts.clean(PATHS.build),
      Parts.minify(),
      Parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      Parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(Pkg.dependencies)
      }),
      Parts.extractCSS(PATHS.style)
    );
    break;
  default:
    config = Merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      Parts.setupCSS(PATHS.style),
      Parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = Validate(config, {
  quiet: true
});
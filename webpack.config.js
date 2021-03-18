const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const {
  version,
  description,
  shortName,
  homepage
} = require('./package.json')
const development = 'development'
const mode = process.env.NODE_ENV || development

const config = {
  mode,
  context: __dirname,
  entry: {
    background: path.resolve(__dirname, './packages/background/index.js'),
    inpage: path.resolve(__dirname, './packages/inpage/index.js'),
    content: path.resolve(__dirname, './packages/content/index.js'),
    popup: path.resolve(__dirname, './src/main.js'),
  },
  devtool: mode === development ? 'source-map' : false,
  target: 'web',
  watch: mode === development,
  node: {
    fs: 'empty', net: 'empty', tls: 'empty'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      lib: path.resolve(__dirname, './lib/'),
      packages: path.resolve(__dirname, './packages/'),
      config: path.resolve(__dirname, './config/'),
      '@': path.resolve(__dirname, './src/')
    }
  },
  module: {
    rules: [...getRules()]
  },
  performance: {
    hints: false
  },
  plugins: [...getPlugins()]
}

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      }
    })
  ])
}

function getPlugins() {
  return [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),
    new webpack.DefinePlugin({
      WebAssembly: null,
      ENVIRONMENT: JSON.stringify(mode)
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      ignoreOrder: false
    }),

    new CopyWebpackPlugin([
      { from: 'public/popup.html', to: 'popup.html' },
      { from: 'public/icons', to: 'icons' },
      { from: 'public/fonts', to: 'fonts' },
      { from: 'public/localisation.json', to: 'localisation.json' },
      { from: 'public/schema.json', to: 'schema.json' },
      { from: 'public/spinner.css', to: 'spinner.css' },
      { from: 'public/phishing.html', to: 'phishing.html'},
      {
        from: 'public/manifest.json',
        to: 'manifest.json',
        transform: content => {
          const jsonContent = JSON.parse(content)

          jsonContent.version = version
          jsonContent.short_name = shortName
          jsonContent.description = description
          jsonContent.author = homepage

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] = 'script-src \'self\' \'unsafe-eval\'; object-src \'self\''
          }

          return JSON.stringify(jsonContent, null, 2)
        }
      }
    ])
  ]
}

function getRules() {
  return [
    {
      test: /\.vue$/,
      loaders: 'vue-loader'
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    },
    {
      test: /\.scss$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
    },
    {
      test: /\.(png|jpg|gif|svg|ico)$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?emitFile=false',
      }
    }
  ]
}

module.exports = config

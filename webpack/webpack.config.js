const webpack = require('webpack')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const path = require('path')
const development = 'development'
const mode = process.env.NODE_ENV || development
const manifest = new WebpackAssetsManifest({
  output: path.resolve(__dirname, '../dist/manifest.json'),
  merge: true
})
const {
  version,
  description,
  shortName,
  homepage
} = require('../package.json')

const defaultManifest = {
  name: 'ZilPay',
  short_name: shortName,
  version: version,
  description: description,
  author: homepage,
  manifest_version: 2,
  // applications: {
  //   gecko: {
  //       id: '@zilpay'
  //   }
  // },
  icons: {
    128: 'icon128.png',
    96: 'icon96.png',
    48: 'icon48.png',
    38: 'icon38.png',
    39: 'icon39.png',
    19: 'icon19.png',
    16: 'icon16.png'
  },
  storage: {
    managed_schema: 'schema.json'
  },
  permissions: [
    'storage',
    'notifications',
    'https://api.coingecko.com/api/v3/simple/price',
    'https://api.zilliqa.com/',
    'https://dev-api.zilliqa.com/',
    'https://zilpay.xyz/*',
    'http://127.0.0.1/*'
  ],
  content_scripts: [
    {
      matches: [
        '*://*/*'
      ],
      js: ['extension/content.js'],
      run_at: 'document_start',
      all_frames: true
    }
  ],
  web_accessible_resources: [
    'extension/inpage.js'
  ],
  browser_action: {
    default_icon: {
      19: 'icon19.png',
      38: 'icon38.png'
    },
    default_title: 'ZilPay',
    default_popup: 'index.html'
  },
  background: {
    scripts: [
      'extension/background.js'
    ]
  },
  content_security_policy: mode === development ? 'script-src \'self\' \'unsafe-eval\'; object-src \'self\'' : undefined
}

manifest.hooks.transform.tap('packages', () => {
  return defaultManifest
})

module.exports = {
  entry: {
    background: path.resolve(__dirname, '../packages/background/index.js'),
    inpage: path.resolve(__dirname, '../packages/inpage/index.js'),
    content: path.resolve(__dirname, '../packages/content/index.js')
  },
  devtool: mode === development ? 'source-map' : false,
  target: 'web',
  watch: mode === development,
  module: {
    rules: [
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
      }
    ]
  },
  performance: {
    hints: false
  },
  resolve: {
    modules: ['./node_modules'],
    alias: {
      lib: path.resolve(__dirname, '../lib/'),
      packages: path.resolve(__dirname, '../packages/'),
      config: path.resolve(__dirname, '../config/')
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist/extension')
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      ENVIRONMENT: JSON.stringify(mode)
    }),
    manifest
  ],
  mode
}

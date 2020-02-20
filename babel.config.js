module.exports = {
  presets: [
    '@babel/preset-env',
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'babel-plugin-root-import',
      {
        rootPathPrefix: '#/'
      }
    ]
  ]
}

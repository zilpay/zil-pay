module.exports = {
  presets: [
    '@babel/preset-env',
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'babel-plugin-root-import',
      {
        paths: [
          {
            rootPathSuffix: './lib',
            rootPathPrefix: 'lib'
          },
          {
            rootPathSuffix: './config',
            rootPathPrefix: 'config'
          },
          {
            rootPathSuffix: './packages',
            rootPathPrefix: 'packages'
          }
        ]
      }
    ]
  ]
}

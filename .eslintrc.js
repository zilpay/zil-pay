module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    'strongloop'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: [
      'error',
      2
    ],
    'max-len': ['error', { code: 120 }],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    'no-new': 0,
    'comma-dangle': 0,
    'no-return-assign': 0,
    'no-extend-native': 0,
    semi: [
      'error',
      'never'
    ]
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  }
}

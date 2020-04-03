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
    'no-empty': 2,
    'no-empty-character-class': 2,
    'no-empty-pattern': 2,
    'no-new': 0,
    'comma-dangle': 0,
    'no-return-assign': 0,
    'no-extend-native': 0,
    'no-eval': 2,
    'no-implied-eval': 2,
    'no-implicit-globals': 2,
    semi: [
      'error',
      'never'
    ]
  },
  parserOptions: {
    ecmaVersion: 11,
    parser: 'babel-eslint',
    sourceType: 'module'
  }
}

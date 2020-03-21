module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  bail: true,
  verbose: true,
  notify: false,
  roots: ['<rootDir>'],
  modulePaths: [''],
  moduleNameMapper: {
    '^config(.*)$': '<rootDir>/config$1',
    '^lib(.*)$': '<rootDir>/lib$1'
  }
}

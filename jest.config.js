module.exports = {
  bail: 1,
  verbose: true,
  notify: true,
  globals: {
    storage: {
      local: null
    }
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/']
};

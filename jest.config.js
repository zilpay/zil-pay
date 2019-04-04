var storage = require('./test-wallet.json');

module.exports = {
  bail: 1,
  verbose: true,
  notify: true,
  globals: {
    storage: {
      local: storage
    }
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/']
};

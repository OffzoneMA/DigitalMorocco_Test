const { browser } = require('./config/config');

exports.config = {
  runner: 'local',
  specs: ['./tests/**/*.test.js'],
  framework: 'mocha',
  reporters: ['spec'],  
  capabilities: [{
    maxInstances: 1,
    browserName: browser || 'chrome',
    acceptInsecureCerts: true,
  }],
  logLevel: 'info',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};

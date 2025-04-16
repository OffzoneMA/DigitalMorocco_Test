const uniqueId = Date.now().toString();

exports.config = {
  runner: 'local',
  specs: ['./tests/**/*.test.js'],
  framework: 'mocha',
  reporters: ['spec'],
  
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=/tmp/chrome-data-${uniqueId}`
      ]
    }
  }],
  
  maxInstances: 1,
  
  logLevel: 'info',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  services: ['chromedriver'],
};
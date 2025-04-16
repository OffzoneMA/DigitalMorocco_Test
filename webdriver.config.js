const uniqueId = Date.now().toString();

const testSpec = process.env.TEST_SPEC 
  ? `./tests/${process.env.TEST_SPEC}`
  : './tests/**/*.test.js';

exports.config = {
  runner: 'local',
  specs: [testSpec],
  framework: 'mocha',
  reporters: ['spec'],
  
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.HEADLESS === 'false' 
        ? ['--no-sandbox', '--disable-dev-shm-usage', `--user-data-dir=/tmp/chrome-data-${uniqueId}`]
        : [
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
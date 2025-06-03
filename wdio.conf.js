const { Reporter } = require('@reportportal/agent-js-webdriverio');
const config = require('./config/config');


const getTestName = () => {
  const specArgIndex = process.argv.findIndex(arg => arg === '--spec');
  if (specArgIndex !== -1 && process.argv[specArgIndex + 1]) {
    const specPath = process.argv[specArgIndex + 1];
    const fileName = specPath.split('/').pop().replace('.test.js', '');
    return `TEST_${fileName.toUpperCase()}`;
  }
  return 'DIGITAL_MOROCOOTESTING'; 
};

const reportPortalConfig = {
  apiKey:config.reportApi,
  endpoint:config.endpoint,
  project:config.projectReport,
  launch: getTestName(),
  restClientConfig: {
    timeout: 90000
  }
};

exports.config = {
  runner: 'local',
  specs: [
    './tests/**/*.js'
  ],
  exclude: [
   
  ],
  maxInstances: 10,
  capabilities: [{
    maxInstances: 5,
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
     ]
    }
  }],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: [
    'spec',
    [Reporter, reportPortalConfig]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 180000
  },
  
}
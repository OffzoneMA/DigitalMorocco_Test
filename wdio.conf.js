const { Reporter } = require('@reportportal/agent-js-webdriverio');
const config = require('./config/config');

const getTestName = (specFile) => {
  if (specFile && typeof specFile === 'string') {
    const fileName = specFile.split('/').pop().replace('.test.js', '');
    return `TEST_${fileName.toUpperCase()}`;
  }
  return 'DIGITAL_MOROCOOTESTING';
};

const reportPortalConfig = {
  apiKey: config.reportApi,
  endpoint: config.endpoint,
  project: config.projectReport,
  launch: 'DIGITAL_MOROCOOTESTING', // Valeur par défaut, sera mise à jour
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
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
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
  connectionRetryTimeout: 180000,
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
  
  beforeSession: function (config, capabilities, specs) {
    if (specs && specs.length > 0) {
      const currentSpec = specs[0];
      const testName = getTestName(currentSpec);
      
      // Stocker le nom du test actuel globalement
      global.currentTestName = testName;
      
      // Mettre à jour directement la configuration ReportPortal
      const rpReporter = config.reporters.find(reporter => 
        Array.isArray(reporter) && reporter[0] === Reporter
      );
      
      if (rpReporter && rpReporter[1]) {
        rpReporter[1].launch = testName;
        console.log(`Configuration ReportPortal mise à jour - Launch: ${testName}`);
      }
      
      console.log(` Démarrage du test: ${testName} pour le fichier: ${currentSpec}`);
    }
  },
  
  // Hook appelé au début de chaque suite de tests
  beforeSuite: function (suite) {
    if (global.currentTestName) {
      console.log(`Suite de tests: ${suite.title} - Launch: ${global.currentTestName}`);
    }
  },
  
  // Hook appelé avant chaque test
  beforeTest: function (test, context) {
    console.log(` Exécution du test: ${test.title}`);
  },
  
  // Hook appelé après chaque test
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} Test: ${test.title} (${duration}ms)`);
    
    if (error) {
      console.log(` Erreur: ${error.message}`);
    }
  },
  
  // Hook appelé à la fin de chaque suite
  afterSuite: function (suite) {
    console.log(` Fin de la suite: ${suite.title}`);
  },
  
  // Hook appelé après chaque session
  afterSession: function (config, capabilities, specs) {
    if (global.currentTestName) {
      console.log(`Fin de session pour: ${global.currentTestName}`);
    }
  }
}
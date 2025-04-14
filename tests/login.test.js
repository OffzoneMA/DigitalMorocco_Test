const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const chrome = require('selenium-webdriver/chrome');


describe('Tests de connexion', function () {
  let driver;
  let loginPage;

beforeEach(async function() {
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments(`--user-data-dir=/tmp/chrome-data-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  await driver.manage().window().maximize();
  loginPage = new LoginPage(driver);
   });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });


  it('Connexion réussie avec des identifiants valides', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 15000);
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('Dashboard')) {
        logResult('Test OK : Connexion réussie');
      } else {
        logResult(`Test KO : Redirection inattendue vers ${currentUrl}`);
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

  it('Connexion échouée avec un email incorrect', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.invalidEmail, config.validPassword);
      
      try {
        const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
        const text = await errorMessage.getText();
        logResult(`Test OK : Connexion échouée avec un email incorrect. Message: ${text}`);
      } catch (err) {
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('Dashboard')) {
          logResult('Test OK : Connexion échouée avec un email incorrect');
        } else {
          logResult('Test KO : La connexion a réussi malgré un email incorrect');
        }
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

  it('Connexion échouée avec un mot de passe incorrect', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.invalidPassword);
      
      try {
        const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
        const text = await errorMessage.getText();
        logResult(`Test OK : Connexion échouée avec un mot de passe incorrect. Message: ${text}`);
      } catch (err) {
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('Dashboard_Investor')) {
          logResult('Test OK : Connexion échouée avec un mot de passe incorrect');
        } else {
          logResult('Test KO : La connexion a réussi malgré un mot de passe incorrect');
        }
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

  it('Réinitialisation du mot de passe', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.clickForgotPassword();
      const currentUrl = await driver.getCurrentUrl();
      await loginPage.enterEmailForReset(config.validEmail);
      await loginPage.submitResetRequest();
      await loginPage.waitForConfirmationPage();
      logResult('Test OK : Demande de réinitialisation de mot de passe envoyée');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  })})



 
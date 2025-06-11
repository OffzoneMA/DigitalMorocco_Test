const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const testInfo = require('../utils/testInfo');


describe('Tests de connexion', function () {
  let driver;
  let loginPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
  });

  afterEach(async function() {
     if (this.currentTest && this.currentTest.state === 'failed') {
      console.log(`Le test "${this.currentTest.title}" a échoué!`);
      
      if (!global.ticketCreatedForTest) {
        global.ticketCreatedForTest = {};
      }
      if (global.ticketCreatedForTest[this.currentTest.title]) {
        console.log(`Un ticket a déjà été créé pour le test "${this.currentTest.title}". Éviter la duplication.`);
      } else {
        let errorMessage = 'Erreur inconnue';
        
        if (this.currentTest.err) {
          errorMessage = this.currentTest.err.message;
          console.log("Message d'erreur détecté:", errorMessage);
        }
        if (global.lastTestError) {
          errorMessage = global.lastTestError;
          console.log("Utilisation du message d'erreur global:", errorMessage);
        }
        const testSpecificInfo = testInfo[this.currentTest.title] || {};
        const stepsInfo = {
          stepsPerformed: testSpecificInfo.stepsPerformed || "Étapes non spécifiées",
          actualResult: errorMessage,
          expectedResult: testSpecificInfo.expectedResult || "Résultat attendu non spécifié"
        };
        
        const ticketKey = await createBugTicket(
          this.currentTest.title,
          errorMessage,
          stepsInfo,
          driver
        );
        
        if (ticketKey) {
          global.ticketCreatedForTest[this.currentTest.title] = ticketKey;
        }
      }
    }
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
        const errorMessage =`Redirection inattendue vers ${currentUrl}`;
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;

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
          const errorMessage =' La connexion a réussi malgré un email incorrect';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;

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
          const errorMessage ='La connexion a réussi malgré un mot de passe incorrect';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;

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
      const errorMessage =' Demande de réinitialisation de mot de passe a échoué';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
    }
  })})



 
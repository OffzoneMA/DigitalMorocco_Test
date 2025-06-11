const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const NotificationPage = require('../pages/notification.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const { createBugTicket } = require('../utils/jiraUtils');
const testInfo = require('../utils/testInfo');



describe('Tests de notification', function () {
  let driver;
  let loginPage;
  let notificationPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    notificationPage = new NotificationPage(driver);
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

  it('Clic sur l\'icône de notification et navigation vers la page', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const dashboardUrl = await driver.getCurrentUrl();
      if (dashboardUrl.includes('Dashboard')) {
        logResult('Étape 1 OK : Connexion réussie');
      } else {
        logResult(`Étape 1 KO : Redirection inattendue vers ${dashboardUrl}`);
        throw new Error('Échec de connexion');
      }      
      const clickSuccess = await notificationPage.clickNotificationIcon();
      if (clickSuccess) {
        logResult('Étape 2 OK : Clic sur l\'icône de notification réussi');
      } else {
        logResult('Étape 2 KO : Échec du clic sur l\'icône de notification');
        throw new Error('Échec du clic sur l\'icône de notification');
      }
      const navigationSuccess = await notificationPage.waitForNotificationPage();
      if (navigationSuccess) {
        logResult('Étape 3 OK : Navigation vers la page de notifications réussie');
      } else {
        logResult('Étape 3 KO : Échec de navigation vers la page de notifications');
        throw new Error('Échec de navigation vers la page de notifications');
      }
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.toLowerCase().includes('notification')) {
        logResult('Test OK : Navigation vers la page de notifications réussie');
      } else {
        logResult(`Test KO : Redirection inattendue vers ${currentUrl}`);
        throw new Error(`URL inattendue: ${currentUrl}`);
      }
    } catch (error) {
      const errorMessage = error.message ||'Échec de Navigation vers la page de notifications';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

 

  

  
});
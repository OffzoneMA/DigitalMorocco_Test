const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const NotificationPage = require('../pages/notification.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

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
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

 

  

  
});
const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const DocumentPage = require('../pages/Document.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const assert = require('assert');


describe('Tests d\'ajout  d\'un document juridique ', function () {
  let driver;
  let loginPage;
  let documentPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    documentPage = new DocumentPage(driver);
});

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  }); 

  it('Création d\'un document ', async function() {
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
          const navigateSuccess = await documentPage.navigateToDocuments();
          if (navigateSuccess) {
            logResult('Étape 2 OK : Navigation vers la page des documents juridiques réussie');
          } else {
            logResult('Étape 2 KO : Échec de navigation vers la page des documents juridiques');
            throw new Error('Échec de navigation vers la page des documents juridiques');
          }
         const createDocumentSuccess = await documentPage.clickCreateDocument();
          if (createDocumentSuccess) {
            logResult('Étape 3 OK : Alerte affichée pour l\'ajout d\'un document juridique');
          } else {
            logResult('Étape 3 KO : Échec de l\'affichage de l\'alerte');
            throw new Error('Échec de l\'affichage de l\'alerte');
          }
         logResult('Test OK : Ajout d\'un nouveau document juridique réussie ');
        } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
        }
      })
})
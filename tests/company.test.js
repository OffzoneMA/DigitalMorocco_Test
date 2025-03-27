const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const CompanyPage = require('../pages/company.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');

describe('Tests de création de projet', function () {
  let driver;
  let loginPage;
  let companyPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    companyPage = new CompanyPage(driver);
});

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });  

  it('Création d\'une entreprise', async function() {
    try {
      const companyData = {
        name: 'Company Test ',
        legalName: 'Company Legal',
        details: 'Description détaillée ',
        website: 'https://www.example.com',
        contactEmail: 'contact@example.com',
        address: 'Adresse 1 ',
        funding: '1000 ', 
        totalRaised: '5000', 
      };
  
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
      
      const navigateSuccess = await companyPage.navigateToCompany();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des entreprises réussie');
      } else {
        logResult('Étape 2 KO : Échec de navigation vers la page des entreprises');
        throw new Error('Échec de navigation vers la page des entreprises');
      }
     
      const formFillSuccess = await companyPage.fillCompanyForm(companyData);
      if (formFillSuccess) {
        logResult('Étape 4 OK : Formulaire de l\'entreprise rempli avec succès');
      } else {
        logResult('Étape 4 KO : Échec du remplissage du formulaire de l\'entreprise');
        throw new Error('Échec du remplissage du formulaire des entreprises');
      }
  
      const submitSuccess = await companyPage.submitCompanyForm();
      if (submitSuccess) {
        logResult('Étape 5 OK : Soumission du formulaire réussie');
      } else {
        logResult('Étape 5 KO : Échec de soumission du formulaire ');
        throw new Error('Échec de soumission du formulaire ');
      }
      
      logResult('Test OK : Création de l\'entreprise réussie ');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  })
  

});
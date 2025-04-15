const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const CompanyPage = require('../pages/company.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const { createUniqueBrowser } = require('../helpers/browser.helper');


describe('Tests de création de projet', function () {
  let driver;
  let loginPage;
  let companyPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
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
        website: config.website,
        contactEmail: config.mail,
        address: 'Adresse 1 ',
        funding: config.funding, 
        totalRaised: config.raised, 
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

  it('Echec de modification - Champs obligatoires vides', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const navigateSuccess = await companyPage.navigateToCompany();
      if (!navigateSuccess) {
        throw new Error('Échec de navigation vers la page des entreprises');
      }
      const nameField = await driver.wait(until.elementLocated(By.css("input[name='companyName']")),10000,  'Champ Nom de l\'entreprise non trouvé' );
      await nameField.clear();
      const legalNameField = await driver.wait( until.elementLocated(By.css("input[name='legalName']")),  10000, 'Champ Nom légal non trouvé' );
      await legalNameField.clear();
      await companyPage.submitCompanyForm();
      const nameFieldWithError = await driver.findElement(By.css("input[name='companyName'].shadow-inputBsError") );
      const legalNameFieldWithError = await driver.findElement( By.css("input[name='legalName'].shadow-inputBsError"));
      if (!nameFieldWithError || !legalNameFieldWithError) {
        throw new Error('Les champs ne contiennent pas la classe d\'erreur shadow-inputBsError');
      }
      
      logResult('Test OK : Echec de modification - champs obligatoires vides');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  })

  it('Echec de modification - Format Email invalide', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const navigateSuccess = await companyPage.navigateToCompany();
      if (!navigateSuccess) {
        throw new Error('Échec de navigation vers la page des entreprises');
      }
      const contactEmailField = await driver.wait( until.elementLocated(By.css("input[name='contactEmail']")), 10000, 'Champ "Email de contact" non trouvé');
      await contactEmailField.clear();
      await contactEmailField.sendKeys('example')
      await companyPage.submitCompanyForm();
      const emailFieldWithError = await driver.findElement(By.css("input[name='contactEmail'].shadow-inputBsError"));
      if (!emailFieldWithError) {
        throw new Error('Les champs ne contiennent pas la classe d\'erreur shadow-inputBsError');
      }
      
      logResult('Test OK : Echec de modification - Format Email invalide');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  })

  
    it('Echec de modification - Numéro d\'identification fiscale invalide', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        const navigateSuccess = await companyPage.navigateToCompany();
        if (!navigateSuccess) {
          throw new Error('Échec de navigation vers la page des entreprises');
        }
        const taxIdentifierField = await driver.wait(until.elementLocated(By.css("input[name='taxIdentfier']")),10000,'Champ "Tax Identifier" non trouvé' );
        await taxIdentifierField.clear();
        await taxIdentifierField.sendKeys('AB');
        const valueAfterLetters = await taxIdentifierField.getAttribute('value');
        if (valueAfterLetters !== '') {
          throw new Error('Le champ devrait être vide après la saisie de lettres');
        }
         await taxIdentifierField.clear();
        await taxIdentifierField.sendKeys('!@#');
       const valueAfterSpecialChars = await taxIdentifierField.getAttribute('value');
        if (valueAfterSpecialChars !== '') {
          throw new Error('Le champ devrait être vide après la saisie de caractères spéciaux');
        }
        logResult('Test OK : Validation du champ numéro d\'identification fiscale - Seuls les nombres sont acceptés');
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

    it('Echec de modification - Numéro d\'identification de l\'entreprise invalide', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        const navigateSuccess = await companyPage.navigateToCompany();
        if (!navigateSuccess) {
          throw new Error('Échec de navigation vers la page des entreprises');
        }
        const corporateIdentifierField = await driver.wait(until.elementLocated(By.css("input[name='corporateIdentfier']")),10000,  'Champ "corporate Identifier" non trouvé'   );
        await corporateIdentifierField.clear();
        await corporateIdentifierField.sendKeys('AB');
        
        const valueAfterLetters = await corporateIdentifierField.getAttribute('value');
        if (valueAfterLetters !== '') {
          throw new Error('Le champ devrait être vide après la saisie de lettres');
        }
        await corporateIdentifierField.clear();
        await corporateIdentifierField.sendKeys('!@#');
        
        const valueAfterSpecialChars = await corporateIdentifierField.getAttribute('value');
        if (valueAfterSpecialChars !== '') {
          throw new Error('Le champ devrait être vide après la saisie de caractères spéciaux');
        }
        
        
        logResult('Test OK : Validation du champ numéro d\'identification de l\'entreprise - Seuls les nombres sont acceptés');
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });
  
  

});
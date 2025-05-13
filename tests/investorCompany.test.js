const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const InvestorCompanyPage = require('../pages/investorCompany.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

describe('Tests du profil entreprise investisseur', function () {
  let driver;
  let loginPage;
  let investorCompanyPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    investorCompanyPage = new InvestorCompanyPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('Création réussie du profil entreprise investisseur', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('Dashboard_Investor')) {
        throw new Error(`Échec de la connexion, redirection vers ${currentUrl}`);
      }
      await driver.sleep(5000);
      const navigateSuccess = await investorCompanyPage.navigateToCompany();
      if (!navigateSuccess) {
        throw new Error("Échec de la navigation vers la page du profil entreprise");
      }
      const companyData = {
        name: "Capital Innovation Partners",
        legalName: "Capital Innovation Partners SARL",
        details: "Société d'investissement spécialisée dans les technologies innovantes, avec un focus sur les startups en phase de croissance dans les secteurs des énergies renouvelables et de la technologie financière.",
        website: "https://www.capitalinnovation-partners.com",
        contactEmail: "contact@capitalinnovation.com",
        address: "123 Avenue Mohammed V, Casablanca",
        companyLocation: "Maroc",
        sector: "AdTech",
        funding: "12345678",
        totalRaised: "RC123456"
      };
      
      const fillSuccess = await investorCompanyPage.fillCompanyForm(companyData);
      if (!fillSuccess) {
        throw new Error("Échec du remplissage du formulaire entreprise");
      }
      const submitSuccess = await investorCompanyPage.submitCompanyForm();
      if (!submitSuccess) {
        logResult('Test KO : Échec de la soumission du formulaire entreprise');
        throw new Error("Échec de la soumission du formulaire entreprise");
      }
      await driver.sleep(3000); 
      logResult('Test OK : Création du profil entreprise investisseur réussie');
      
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });


});
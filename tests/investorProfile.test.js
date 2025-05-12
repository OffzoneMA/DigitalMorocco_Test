const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const InvestorPage = require('../pages/investorProfile.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

describe('Tests du profil investisseur', function () {
  let driver;
  let loginPage;
  let investorPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    investorPage = new InvestorPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('Remplissage et soumission du formulaire investisseur', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('Dashboard_Investor')) {
        throw new Error(`Échec de la connexion, redirection vers ${currentUrl}`);
      }
      await driver.sleep(5000);
      const navigateSuccess = await investorPage.navigateToInvestor();
      if (!navigateSuccess) {
        throw new Error("Échec de la navigation vers la page du profil investisseur");
      }
      const investorData = {
        name: "Capital Innovation ",
        legal: "Capital Innovation",
        companyType: "Investisseurs stratégiques",
        description: "Nous sommes une société d'investissement spécialisée dans les startups innovantes en phase précoce.",
        website: "https://www.example.com",
        companyLocation: "Maroc",
        investmentSectors: "AdTech (Technologies publicitaires)",
        contactEmail: "contact@capitalinnovation.fr",
        phone: "+212123456789",
        investmentCapacity: "5000000",
        numberOfExits: "12",
        fund: "25000000",
        acquisitions: "8",
        publicationType: "Série A"
      };
      const fillSuccess = await investorPage.fillInvestorForm(investorData);
      if (!fillSuccess) {
        throw new Error("Échec du remplissage du formulaire investisseur");
      }
      const submitSuccess = await investorPage.submitInvestorForm();
      if (!submitSuccess) {
        throw new Error("Échec de la soumission du formulaire investisseur");
      }
      try {
        await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Profil mis à jour avec succès') or contains(text(), 'Enregistré avec succès')]")),10000,'Message de confirmation non trouvé' );
        logResult('Test OK : Formulaire investisseur soumis avec succès');
      } catch (confirmError) {
        logResult('Test KO : Pas de confirmation après soumission du formulaire');
        throw confirmError;
      }
      
    } catch (error) {
      logResult('Test KO : ' + error.message);
      await createBugTicket("Échec du test de remplissage du formulaire investisseur", error.message, await driver.takeScreenshot());
      throw error;
    }
  });
})
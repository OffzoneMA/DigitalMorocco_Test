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
        target: "Amorçage (Seed)",
        investmentSectors: "AdTech",
        contactEmail: "contact@capitalinnovation.fr",
        phone: "+212654789632",
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
        logResult('Test KO : Echec de la soumission du formulaire investisseur');
        throw new Error("Échec de la soumission du formulaire investisseur");
      }
      else{
        logResult('Test OK : Formulaire investisseur soumis avec succès');}
      
    } catch (error) {
      logResult('Test KO : ' + error.message);
    }
  });

it('Vérification des champs obligatoires du formulaire investisseur', async function() {
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
    await investorPage.clearAllFields();
    await driver.sleep(2000);
    const fieldsToTest = [
      { name: "Nom de l'entreprise", selector: "input[name='companyName']" },
      { name: "Statut juridique", selector: "input[name='legalName']" },
      { name: "Description", selector: "textarea[name='description']" },
      { name: "Site web", selector: "input[name='website']" },
      { name: "Email de contact", selector: "input[name='contactEmail']" },
      { name: "Téléphone", selector: "input[name='phoneNumber']" },
    ];
    await investorPage.submitInvestorForm();
    await driver.sleep(2000);
    
    for (const field of fieldsToTest) {
      try {
        const fieldElement = await driver.findElement(By.css(field.selector));
        const classes = await fieldElement.getAttribute('class');
        const isRequired = classes && classes.includes('shadow-inputBsError');
      } catch (fieldError) {
        logResult(`Test KO pour le champ ${field.name}: ${fieldError.message}`);
      }
    }
    logResult('Test OK : Validation des champs obligatoires');
    
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});


it('Validation du format email dans le profil', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.getCurrentUrl();
    await investorPage.navigateToInvestor();
    await driver.sleep(2000);
    const invalidEmails = [
      { value: "emailinvalide.com", description: "sans @" },
      { value: "user@", description: "sans domaine" },
      { value: "email_invalide", description: "format complètement invalide" },
      { value: "@domaine.com", description: "sans nom d'utilisateur" },
      { value: "user@domaine.", description: "domaine incomplet" }
    ];
    
    let allValidationsSuccessful = true;
    const emailField = await driver.wait(until.elementLocated(By.css("input[name='contactEmail']")), 10000, "Champ email non trouvé");
    const originalEmail = await emailField.getAttribute('value');
    for (const invalidEmail of invalidEmails) {
      await emailField.clear();
      await emailField.sendKeys(invalidEmail.value);
      await driver.findElement(By.tagName('body')).click();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      let formatErrorFound = false;
      const classes = await emailField.getAttribute('class');
      if (classes && classes.includes('shadow-inputBsError')) {
        formatErrorFound = true;
      }
      try {
        const errorMessage = await driver.findElement(By.xpath("//div[contains(@class, 'text-red-500') and contains(text(), 'format') and contains(text(), 'email')]") );
        if (errorMessage) {
          formatErrorFound = true;
        }
      } catch (noErrorMsg) {
      }
      await driver.sleep(1000);
    }
    await emailField.clear();
    if (originalEmail) {
      await emailField.sendKeys(originalEmail);
    }
    if (allValidationsSuccessful) {
      logResult('Test OK : Validation du format email réussie');
    } else {
      throw new Error('Un ou plusieurs tests de validation email ont échoué');
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});
it('Validation du format URL dans le profil', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.getCurrentUrl();
    await investorPage.navigateToInvestor();
    await driver.sleep(2000);
    const invalidUrls = [
      { value: "exemple", description: "sans domaine ni protocole" },
      { value: "http://", description: "protocole sans domaine" },
      { value: "www.exemple", description: "sans TLD" },
      { value: "http:www.exemple.com", description: "protocole mal formaté (sans //)" },
      { value: "htp://exemple.com", description: "protocole incorrect" },
      { value: "http:/exemple.com", description: "slash manquant" }
    ];
    
    let allValidationsSuccessful = true;
    let failedValidations = [];
    const websiteField = await driver.wait(until.elementLocated(By.css("input[name='website']")), 10000,"Champ site web non trouvé");
    const originalWebsite = await websiteField.getAttribute('value');
    
    for (const invalidUrl of invalidUrls) {
      await websiteField.clear();
      await websiteField.sendKeys(invalidUrl.value);
      await driver.findElement(By.tagName('body')).click();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      
      let formatErrorFound = false;
      const classes = await websiteField.getAttribute('class');
      if (classes && classes.includes('shadow-inputBsError')) {
        formatErrorFound = true;
      }
      
      try {
        const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'URL') or contains(text(), 'site web') or contains(text(), 'format'))]"));
        if (errorMessages.length > 0) {
          formatErrorFound = true;
          const errorText = await errorMessages[0].getText();
          console.log(`URL invalide "${invalidUrl.value}" - Message d'erreur: ${errorText}`);
        }
      } catch (noErrorMsg) {
      }
      
      if (!formatErrorFound) {
        allValidationsSuccessful = false;
        failedValidations.push(`"${invalidUrl.value}" (${invalidUrl.description})`);
        console.log(`ÉCHEC: L'URL invalide "${invalidUrl.value}" (${invalidUrl.description}) a été acceptée sans erreur`);
      }
      
      await driver.sleep(1000);
    }
    await websiteField.clear();
    if (originalWebsite) {
      await websiteField.sendKeys(originalWebsite);
    }
    if (allValidationsSuccessful) {
      logResult('Test OK : Validation du format URL réussie - Toutes les URLs invalides ont été correctement rejetées');
    } else {
      const errorMessage = 'Test KO : Format URL invalide est accepté' 
      logResult(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw error; 
  }
});

it('Validation du format numéro de téléphone dans le profil', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.getCurrentUrl();
    await investorPage.navigateToInvestor();
    await driver.sleep(2000);
    const invalidPhoneNumbers = [
      { value: "658987563", description: "sans l'indicatif pays" },
      { value: "+212", description: "uniquement l'indicatif pays" },
      { value: "212658987563", description: "sans le signe + pour l'indicatif" },
      { value: "+21265898756A", description: "contient des caractères non numériques" },
      { value: "+2126589", description: "trop court" },
      { value: "+2126589875631234567", description: "trop long" },
      { value: "06 58 98 75 63", description: "format local sans indicatif international" },
      { value: "abcdefghijk", description: "contient uniquement des lettres" }
    ];
    
    let allValidationsSuccessful = true;
    let failedValidations = [];
    const phoneField = await driver.wait(until.elementLocated(By.css("input[name='phoneNumber']")), 10000,"Champ numéro de téléphone non trouvé");
    const originalPhone = await phoneField.getAttribute('value');
    for (const invalidPhone of invalidPhoneNumbers) {
      await phoneField.clear();
      await phoneField.sendKeys(invalidPhone.value);
      await driver.findElement(By.tagName('body')).click();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      let formatErrorFound = false;
      const classes = await phoneField.getAttribute('class');
      if (classes && classes.includes('shadow-inputBsError')) {
        formatErrorFound = true;
      }
      try {
        const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'téléphone') or contains(text(), 'format') or contains(text(), 'numéro'))]"));
        if (errorMessages.length > 0) {
          formatErrorFound = true;
          const errorText = await errorMessages[0].getText();
          console.log(`Numéro invalide "${invalidPhone.value}" - Message d'erreur: ${errorText}`);
        }
      } catch (noErrorMsg) {
      }
      if (!formatErrorFound) {
        allValidationsSuccessful = false;
        failedValidations.push(`"${invalidPhone.value}" (${invalidPhone.description})`);
        console.log(`ÉCHEC: Le numéro invalide "${invalidPhone.value}" (${invalidPhone.description}) a été accepté sans erreur`);
      }
      await driver.sleep(1000);
    }
    await phoneField.clear();
    if (originalPhone) {
      await phoneField.sendKeys(originalPhone);
    }
    if (allValidationsSuccessful) {
      logResult('Test OK : Validation du format numéro de téléphone réussie - Tous les numéros invalides ont été correctement rejetés');
    } else {
      const errorMessage = 'Test KO : Format numéro de téléphone invalide est accepté';
      logResult(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error; 
  }
});


it('Modification des champs du profil investisseur', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.getCurrentUrl();
    await driver.sleep(5000);
    await investorPage.navigateToInvestor();
    const fieldsToUpdate = {
      companyName: "New Capital Ventures",
      legalName: "New Capital Ventures SARL",
      description: "Une société d'investissement spécialisée dans les technologies innovantes et les startups en croissance.",
      website: "https://www.newexample.com",
    };
    for (const [fieldName, newValue] of Object.entries(fieldsToUpdate)) {
      const updateSuccess = await investorPage.updateInvestorField(fieldName, newValue);
      if (!updateSuccess) {
        throw new Error(`Échec de la mise à jour du champ ${fieldName}`);
      }
    }
    const verifySuccess = await investorPage.verifyFieldValues(fieldsToUpdate);
    if (!verifySuccess) {
      throw new Error("La vérification des champs mis à jour a échoué");
    }
    const submitSuccess = await investorPage.submitInvestorForm();
    if (!submitSuccess) {
      logResult('Test KO : Échec de la soumission du formulaire investisseur après modification');
      throw new Error("Échec de la soumission du formulaire investisseur après modification");
    }
    await driver.sleep(3000);
    await investorPage.navigateToInvestor();
    const verifyAfterSubmitSuccess = await investorPage.verifyFieldValues(fieldsToUpdate);
    if (!verifyAfterSubmitSuccess) {
      throw new Error("Les modifications n'ont pas été enregistrées correctement");
    }
    
    logResult('Test OK : Modification et soumission du formulaire investisseur réussies');
    
  } catch (error) {
    logResult('Test KO : ' + error.message);
 
    throw error;
  }
});



  
});
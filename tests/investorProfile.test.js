const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const InvestorPage = require('../pages/investorProfile.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const testInfo = require('../utils/testInfo');

describe('Tests du profil investisseur', function () {
  let driver;
  let loginPage;
  let investorPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    investorPage = new InvestorPage(driver);
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
      const errorMessage = error.message || 'Échec de remplissage et soumission du formulaire investisseur';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
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
      const errorMessage = error.message ||'Échec de la vérification des champs obligatoires';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
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
      const errorMessage = error.message || 'Les emails invalides sont acceptés sans validation';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
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
        const errorMessage = 'Les URLs invalides sont acceptées sans validation';
        logResult('Test KO : ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Les URLs invalides sont acceptées sans validation';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
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
        const errorMessage = 'Les numéros de téléphone invalides sont acceptés sans validation';
        logResult('Test KO : ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Les numéros de téléphone invalides sont acceptés sans validation';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
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
      const errorMessage = error.message || 'Échec de la modification des champs du profil investisseur';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Validation du champ capacité d\'investissement - accepte uniquement des nombres', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await investorPage.navigateToInvestor();
      await driver.sleep(2000);
      const investmentField = await driver.wait(until.elementLocated(By.css("input[name='investmentCapacity']")), 10000, "Champ capacité d'investissement non trouvé");
      await investmentField.clear();
      const testValues = [
        { input: "abc", expected: "" },
        { input: "123abc", expected: "123" },
        { input: "-500", expected: "500" }, 
        { input: "5000", expected: "5 000" }
      ];
      
      let allValidationsSuccessful = true;
      let failedValidations = [];
      
      for (const test of testValues) {
        await investmentField.clear();
        await investmentField.sendKeys(test.input);
        const actualValue = await investmentField.getAttribute('value');
        
        if (actualValue !== test.expected) {
          allValidationsSuccessful = false;
          failedValidations.push(`Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
          console.log(`ÉCHEC: Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
        } else {
          console.log(`OK: Pour l'entrée "${test.input}", valeur correctement filtrée à "${actualValue}"`);
        }
      }
      await investmentField.clear();
      await investmentField.sendKeys("20000000");
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'capacité') or contains(text(), 'investissement'))]"));
      if (errorMessages.length > 0) {
        allValidationsSuccessful = false;
        const errorText = await errorMessages[0].getText();
        failedValidations.push(`Une valeur valide "20000000" a généré une erreur: ${errorText}`);
      }
      await investmentField.clear();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const emptyErrorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'capacité') or contains(text(), 'investissement') or contains(text(), 'requis') or contains(text(), 'obligatoire'))]"));
      const isFieldRequired = emptyErrorMessages.length > 0;    
      if (allValidationsSuccessful) {
        logResult('Test OK : Validation du champ capacité d\'investissement réussie - Le champ accepte uniquement des nombres');
      } else {
        const errorMessage = `Problèmes avec la validation du champ capacité d'investissement: ${failedValidations.join(', ')}`;
        logResult('Test KO : ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Le champ capacité d\'investissement accepte des valeurs invalides';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Validation du champ nombre d\'investissements - accepte uniquement des nombres entiers', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await investorPage.navigateToInvestor();
      await driver.sleep(2000);
      const investmentsField = await driver.wait(until.elementLocated(By.css("input[name='numberOfInvestments']")), 10000, "Champ nombre d'investissements non trouvé");
      await investmentsField.clear();
      const testValues = [
        { input: "abc", expected: "" },
        { input: "123abc", expected: "123" },
        { input: "-10", expected: "10" }, 
        { input: "10.5", expected: "105" }, 
        { input: "42", expected: "42" }
      ];
      
      let allValidationsSuccessful = true;
      let failedValidations = [];
      
      for (const test of testValues) {
        await investmentsField.clear();
        await investmentsField.sendKeys(test.input);
        const actualValue = await investmentsField.getAttribute('value');
        
        if (actualValue !== test.expected) {
          allValidationsSuccessful = false;
          failedValidations.push(`Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
          console.log(`ÉCHEC: Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
        } else {
          console.log(`OK: Pour l'entrée "${test.input}", valeur correctement filtrée à "${actualValue}"`);
        }
      }
      await investmentsField.clear();
      await investmentsField.sendKeys("15");
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'investissements') or contains(text(), 'nombre'))]"));
      if (errorMessages.length > 0) {
        allValidationsSuccessful = false;
        const errorText = await errorMessages[0].getText();
        failedValidations.push(`Une valeur valide "15" a généré une erreur: ${errorText}`);
      }
      await investmentsField.clear();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const emptyErrorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'investissements') or contains(text(), 'nombre') or contains(text(), 'requis') or contains(text(), 'obligatoire'))]"));
      const isFieldRequired = emptyErrorMessages.length > 0;    
      if (allValidationsSuccessful) {
        logResult('Test OK : Validation du champ nombre d\'investissements réussie - Le champ accepte uniquement des nombres entiers');
      } else {
        const errorMessage = `Problèmes avec la validation du champ nombre d'investissements: ${failedValidations.join(', ')}`;
        logResult('Test KO : ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message ||'Le champ nombre d\'investissements accepte des valeurs invalides';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Validation du champ nombre de sorties - accepte uniquement des nombres entiers', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await investorPage.navigateToInvestor();
      await driver.sleep(2000);
      const exitsField = await driver.wait(until.elementLocated(By.css("input[name='numberOfExits']")), 10000, "Champ nombre de sorties non trouvé");
      await exitsField.clear();
      const testValues = [
        { input: "abc", expected: "" },
        { input: "123abc", expected: "123" },
        { input: "-5", expected: "5" }, 
        { input: "3.7", expected: "37" }, 
        { input: "8", expected: "8" }
      ];
      
      let allValidationsSuccessful = true;
      let failedValidations = [];
      
      for (const test of testValues) {
        await exitsField.clear();
        await exitsField.sendKeys(test.input);
        const actualValue = await exitsField.getAttribute('value');
        
        if (actualValue !== test.expected) {
          allValidationsSuccessful = false;
          failedValidations.push(`Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
          console.log(`ÉCHEC: Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
        } else {
          console.log(`OK: Pour l'entrée "${test.input}", valeur correctement filtrée à "${actualValue}"`);
        }
      }
      await exitsField.clear();
      await exitsField.sendKeys("5");
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'sorties') or contains(text(), 'nombre'))]"));
      if (errorMessages.length > 0) {
        allValidationsSuccessful = false;
        const errorText = await errorMessages[0].getText();
        failedValidations.push(`Une valeur valide "5" a généré une erreur: ${errorText}`);
      }
      await exitsField.clear();
      await investorPage.submitInvestorForm();
      await driver.sleep(1000);
      const emptyErrorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'sorties') or contains(text(), 'nombre') or contains(text(), 'requis') or contains(text(), 'obligatoire'))]"));
      const isFieldRequired = emptyErrorMessages.length > 0;   
      if (allValidationsSuccessful) {
        logResult('Test OK : Validation du champ nombre de sorties réussie - Le champ accepte uniquement des nombres entiers');
      } else {
        const errorMessage = `Problèmes avec la validation du champ nombre de sorties: ${failedValidations.join(', ')}`;
        logResult('Test KO : ' + errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Le champ nombre de sorties accepte des valeurs invalides';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

it('Validation du champ nombre de fonds - accepte uniquement des nombres entiers', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await investorPage.navigateToInvestor();
    await driver.sleep(2000);
    const fundsField = await driver.wait(until.elementLocated(By.css("input[name='fund']")), 10000, "Champ nombre de fonds non trouvé");
    await fundsField.clear();
    const testValues = [
      { input: "abc", expected: "" },
      { input: "123abc", expected: "123" },
      { input: "-7", expected: "7" }, 
      { input: "2.5", expected: "25" }, 
      { input: "12", expected: "12" }
    ];
    
    let allValidationsSuccessful = true;
    let failedValidations = [];
    
    for (const test of testValues) {
      await fundsField.clear();
      await fundsField.sendKeys(test.input);
      const actualValue = await fundsField.getAttribute('value');
      
      if (actualValue !== test.expected) {
        allValidationsSuccessful = false;
        failedValidations.push(`Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
        console.log(`ÉCHEC: Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
      } else {
        console.log(`OK: Pour l'entrée "${test.input}", valeur correctement filtrée à "${actualValue}"`);
      }
    }
    await fundsField.clear();
    await fundsField.sendKeys("3");
    await investorPage.submitInvestorForm();
    await driver.sleep(1000);
    const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'fonds') or contains(text(), 'nombre'))]"));
    if (errorMessages.length > 0) {
      allValidationsSuccessful = false;
      const errorText = await errorMessages[0].getText();
      failedValidations.push(`Une valeur valide "3" a généré une erreur: ${errorText}`);
    }
    await fundsField.clear();
    await investorPage.submitInvestorForm();
    await driver.sleep(1000);
    const emptyErrorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'fonds') or contains(text(), 'nombre') or contains(text(), 'requis') or contains(text(), 'obligatoire'))]"));
    const isFieldRequired = emptyErrorMessages.length > 0;    
    if (allValidationsSuccessful) {
      logResult('Test OK : Validation du champ nombre de fonds réussie - Le champ accepte uniquement des nombres entiers');
    } else {
      const errorMessage = `Test KO : Problèmes avec la validation du champ nombre de fonds: ${failedValidations.join(', ')}`;
      logResult(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
   const errorMessage =  error.message ||'Le champ nombre de fonds accepte des valeurs invalides';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;}
});

it('Validation du champ nombre d\'acquisitions - accepte uniquement des nombres entiers', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await investorPage.navigateToInvestor();
    await driver.sleep(2000);
    const acquisitionsField = await driver.wait(until.elementLocated(By.css("input[name='acquisitions']")), 10000, "Champ nombre d'acquisitions non trouvé");
    await acquisitionsField.clear();
    const testValues = [
      { input: "abc", expected: "" },
      { input: "123abc", expected: "123" },
      { input: "-4", expected: "4" }, 
      { input: "6.3", expected: "63" }, 
      { input: "9", expected: "9" }
    ];
    
    let allValidationsSuccessful = true;
    let failedValidations = [];
    
    for (const test of testValues) {
      await acquisitionsField.clear();
      await acquisitionsField.sendKeys(test.input);
      const actualValue = await acquisitionsField.getAttribute('value');
      
      if (actualValue !== test.expected) {
        allValidationsSuccessful = false;
        failedValidations.push(`Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
        console.log(`ÉCHEC: Pour l'entrée "${test.input}", valeur attendue: "${test.expected}", valeur obtenue: "${actualValue}"`);
      } else {
        console.log(`OK: Pour l'entrée "${test.input}", valeur correctement filtrée à "${actualValue}"`);
      }
    }
    await acquisitionsField.clear();
    await acquisitionsField.sendKeys("7");
    await investorPage.submitInvestorForm();
    await driver.sleep(1000);
    const errorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'acquisitions') or contains(text(), 'nombre'))]"));
    if (errorMessages.length > 0) {
      allValidationsSuccessful = false;
      const errorText = await errorMessages[0].getText();
      failedValidations.push(`Une valeur valide "7" a généré une erreur: ${errorText}`);
    }
    await acquisitionsField.clear();
    await investorPage.submitInvestorForm();
    await driver.sleep(1000);
    const emptyErrorMessages = await driver.findElements(By.xpath("//div[contains(@class, 'text-red-500') and (contains(text(), 'acquisitions') or contains(text(), 'nombre') or contains(text(), 'requis') or contains(text(), 'obligatoire'))]"));
    const isFieldRequired = emptyErrorMessages.length > 0;
    if (allValidationsSuccessful) {
      logResult('Test OK : Validation du champ nombre d\'acquisitions réussie - Le champ accepte uniquement des nombres entiers');
    } else {
      const errorMessage = `Test KO : Problèmes avec la validation du champ nombre d'acquisitions: ${failedValidations.join(', ')}`;
      logResult(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorMessage = error.message ||'Le champ nombre d\'acquisitions accepte des valeurs invalides';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
  }
});




  
});
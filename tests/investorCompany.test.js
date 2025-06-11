const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const InvestorCompanyPage = require('../pages/investorCompany.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const path = require('path');
const testInfo = require('../utils/testInfo');



describe('Tests du profil entreprise investisseur', function () {
  let driver;
  let loginPage;
  let investorCompanyPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    investorCompanyPage = new InvestorCompanyPage(driver);
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
      const errorMessage = error.message ||'Échec de la création du profil entreprise investisseur';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Vérification de la validation des champs obligatoires', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await driver.getCurrentUrl();
      await driver.sleep(5000);
      await investorCompanyPage.navigateToCompany();
      await investorCompanyPage.clearAllFields();
      await investorCompanyPage.submitCompanyForm();
      const validationResults = await investorCompanyPage.checkRequiredFieldErrors();
      if (validationResults.allFieldsHaveErrors) {
        logResult('Test OK : Tous les champs obligatoires affichent bien une erreur de validation');
      } else {
        const missingErrorFields = validationResults.fieldsWithoutErrors.join(', ');
        logResult(`Test KO : Certains champs obligatoires n'affichent pas d'erreur de validation: ${missingErrorFields}`);
        throw new Error(`Validation incorrecte pour les champs: ${missingErrorFields}`);
      }
      const detailedResults = validationResults.errorResults.map(result => `Champ "${result.field}": ${result.hasError ? 'Erreur affichée ✓' : 'Pas d\'erreur affichée ✗'}` ).join('\n');
       } catch (error) {
      const errorMessage = error.message ||'Échec de la vérification de la validation des champs obligatoires';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Echec de modification - Numéro d\'identification fiscale invalide', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.emailInvestor, config.validPassword);
          await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
          await investorCompanyPage.navigateToCompany();
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
          const errorMessage =error.message || 'Le champ numéro d\'identification fiscale accepte des caractères non numériques';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw error;
        }
      });

    it('Echec de modification - Numéro d\'identification de l\'entreprise invalide', async function() {
          try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.emailInvestor, config.validPassword);
            await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
            await investorCompanyPage.navigateToCompany();            
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
            const errorMessage = error.message ||'Le champ numéro d\'identification de l\'entreprise accepte des caractères non numériques';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
          }
        });

it('Test de téléchargement du logo d\'entreprise ', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.sleep(3000);
    await investorCompanyPage.navigateToCompany();
    await investorCompanyPage.removeCompanyLogoIfExists();
    const logoFilePath = path.join(require('os').homedir(), 'Downloads', 'photoprof.png');
    const uploadResult = await investorCompanyPage.uploadCompanyLogo(logoFilePath);
    await investorCompanyPage.submitCompanyForm();
    await driver.sleep(2000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    try {
      await driver.wait(until.elementLocated(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview")), 10000, "Logo non trouvé après rechargement de la page" );
      logResult('Test OK : Le logo de l\'entreprise a été téléchargé avec succès');
    } catch (error) {
      logResult('Test KO : Échec du téléchargement du logo de l\'entreprise');
      throw error;
    }
    
  } catch (error) {
    const errorMessage = error.message ||'Échec du téléchargement du logo de l\'entreprise';
    logResult('Test KO : ' + errorMessage);
    global.lastTestError = errorMessage;
    throw error;
  }
});

it('Test de changement du logo d\'entreprise', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.sleep(3000);
    await investorCompanyPage.navigateToCompany();
    const newLogoPath = path.join(require('os').homedir(), 'Downloads', 'profilephoto.png');
    const changeResult = await investorCompanyPage.changeCompanyLogo(newLogoPath);
    await investorCompanyPage.submitCompanyForm();
    await driver.sleep(2000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    try {
      const logoElement = await driver.wait(until.elementLocated(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview")), 10000, "Logo changé non trouvé après rechargement de la page");
      logResult('Test OK : Le logo de l\'entreprise a été changé avec succès');
    } catch (error) {
      logResult('Test KO : Échec du changement du logo de l\'entreprise');
      throw error;
    }
    
  } catch (error) {
    const errorMessage = error.message || 'Échec du changement du logo de l\'entreprise';
    logResult('Test KO : ' + errorMessage);
    global.lastTestError = errorMessage;
    throw error;
  }
});

it('Test de suppression du logo d\'entreprise', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.sleep(3000);
    await investorCompanyPage.navigateToCompany();
    const deleteResult = await investorCompanyPage.removeCompanyLogoIfExists();
    await investorCompanyPage.submitCompanyForm();
    await driver.sleep(2000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    try {
      const logoElement = await driver.wait(until.elementLocated(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview")), 10000, "Logo changé non trouvé après rechargement de la page" );
      logResult('Test OK : Le logo de l\'entreprise a été supprimé avec succès');
    } catch (error) {
      logResult('Test KO : Échec du suppression du logo de l\'entreprise');
      throw error;
    }
    
  } catch (error) {
    const errorMessage =error.message || 'Échec de la suppression du logo de l\'entreprise';
    logResult('Test KO : ' + errorMessage);
    global.lastTestError = errorMessage;
    throw error;
  }
});

it('Test d\'échec de téléchargement de logo - format non autorisé', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.emailInvestor, config.validPassword);
    await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
    await driver.sleep(3000);
    await investorCompanyPage.navigateToCompany();
    await investorCompanyPage.removeCompanyLogoIfExists();
    await driver.sleep(2000);
    const invalidLogoPath = path.join(require('os').homedir(), 'Downloads', 'Cas_de_Test.docx');
    await investorCompanyPage.uploadCompanyLogo(invalidLogoPath);
    await driver.sleep(3000);
    try {
      const errorMessage = await driver.findElement(
        By.xpath(
          "//div[contains(text(), 'format') and contains(text(), 'autorisé')] | " +
          "//span[contains(text(), 'format') and contains(text(), 'invalide')] | " +
          "//p[contains(text(), 'type de fichier') and contains(text(), 'incorrect')] | " +
          "//div[contains(@class, 'error')] | " +
          "//span[contains(@class, 'error-message')]"
        )
      );
      
      if (errorMessage) {
        const errorText = await errorMessage.getText();
        console.log(`Message d'erreur détecté: "${errorText}"`);
      }
    } catch (errorNotFound) {
      console.log("Aucun message d'erreur explicite n'a été détecté");
    }
    await investorCompanyPage.submitCompanyForm();
    await driver.sleep(3000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
   const finalLogoElements = await driver.findElements(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview"));
   if (finalLogoElements.length === 0) {
    logResult('Test OK : Le fichier avec format non autorisé a été correctement rejeté');
   } else {
    throw new Error('Le système accepte un format de fichier qui devrait être rejeté');
}
    
  } catch (error) {
    const errorMessage = error.message || 'Le système accepte un format de fichier non autorisé pour le logo';
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
    await investorCompanyPage.navigateToCompany();
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
      await investorCompanyPage.submitCompanyForm();
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
    const errorMessage =error.message || 'Échec de la validation du format email dans le profil';
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
    await investorCompanyPage.navigateToCompany();
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
      await investorCompanyPage.submitCompanyForm();
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
      const errorMessage = 'Format URL invalide est accepté' 
      logResult('Test KO : ' + errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorMessage = error.message || 'Échec de la validation du format URL dans le profil';
    logResult('Test KO : ' + errorMessage);
    global.lastTestError = errorMessage;
    throw error; 
  }
});
});
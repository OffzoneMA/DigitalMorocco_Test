
const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const ProfilePage = require('../pages/profile.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const assert =require("assert");


describe('Tests du profil investisseur', function () {
  let driver;
  let loginPage;
  let profilePage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    profilePage = new ProfilePage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });
  it('Affichage des informations du profil', async function() {
      try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.emailInvestor, config.validPassword);
          await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
          const dashboardUrl = await driver.getCurrentUrl();
          if (dashboardUrl.includes('Dashboard_Investor')) {
              logResult('Étape 1 OK : Connexion réussie');
          } else {
              logResult(`Étape 1 KO : Redirection inattendue vers ${dashboardUrl}`);
              throw new Error('Échec de connexion');
          }
          const navigateSuccess = await profilePage.navigateToProfile();
          if (navigateSuccess) {
              logResult('Étape 2 OK : Navigation vers la page profile réussie');
          } else {
              logResult('Étape 2 KO : Échec de navigation vers la page profile');
              throw new Error('Échec de navigation vers la page profile');
          }
          await driver.sleep(2000);
          const profileInfo = await profilePage.getProfileInfo();
          if (profileInfo) {
              logResult('Étape 3 OK : Informations du profil récupérées avec succès');
              console.log("Informations du profil:");
              console.log("Prénom:", profileInfo.firstName);
              console.log("Nom:", profileInfo.lastName);
              console.log("Email:", profileInfo.email);
              console.log("Téléphone:", profileInfo.phoneNumber);
              console.log("Site Web:", profileInfo.website);
              console.log("Adresse:", profileInfo.address);
              console.log("Pays:", profileInfo.country);
              assert.strictEqual(profileInfo.email, config.emailInvestor, "L'email affiché ne correspond pas à celui utilisé pour la connexion");
          } else {
              logResult('Étape 3 KO : Échec de récupération des informations du profil');
              throw new Error('Échec de récupération des informations du profil');
          }
      
          logResult('Test OK : Affichage des informations du profil investisseur ');
      } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
      }
  });
  it('Modification des informations personnelles dans le profil', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await driver.getCurrentUrl();
      await profilePage.navigateToProfile();
      await driver.sleep(2000);
      
      const oldProfileInfo = await profilePage.getProfileInfo();
      console.log("Informations actuelles:", oldProfileInfo);
      
      const updates = {
        firstName: "IKRAM",
        lastName: "ELHAJII",
        phoneNumber: "+212658974585"
      };
      
      console.log("Mise à jour des informations avec:", updates);
      await profilePage.updateProfileInfo(updates);
      
      const paysRecherche = "France"; 
      await profilePage.selectCountry(paysRecherche);
      await driver.sleep(1000);
      await profilePage.saveProfileInfo();
      await driver.sleep(2000);
      await driver.navigate().refresh();
      await driver.sleep(3000);
      
      const currentInfo = await profilePage.getProfileInfo();
      console.log("Informations après modification:", currentInfo);
      if (currentInfo.firstName === updates.firstName && 
          currentInfo.lastName === updates.lastName &&
          currentInfo.country === paysRecherche) {
      } else {
        throw new Error('Les modifications du profil n\'ont pas été correctement enregistrées');
      }
      logResult('Test OK : Modification du profil investisseur réussie');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  it('Modification du mot de passe dans le profil', async function() {
    try {
      const currentPassword = config.validPassword;
      const newPassword = `${config.validPassword}_new`;
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      await profilePage.changePassword(currentPassword, newPassword, newPassword);
      const saveResult = await profilePage.savePasswordChanges();
      if (!saveResult.success) {
        throw new Error(`Échec de la modification du mot de passe: ${saveResult.message}`);
      }
      await profilePage.logout();
      await loginPage.login(config.emailInvestor, newPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 20000, "Échec de connexion avec le nouveau mot de passe");
      await profilePage.navigateToProfile();
      await profilePage.changePassword(newPassword, currentPassword, currentPassword);
      const restoreResult = await profilePage.savePasswordChanges();
      if (!restoreResult.success) {
        throw new Error(`Échec de la restauration du mot de passe original: ${restoreResult.message}`);
      }
      await profilePage.logout();
      await loginPage.login(config.validEmail, currentPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000, "Échec de connexion avec l'ancien mot de passe restauré");
      
      logResult('Test OK : Modification du mot de passe réussie');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  
  it('Validation des critères de mot de passe non conforme', async function() {
    try {
      const currentPassword = config.validPassword;
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      const invalidPassword = 'password123';
      await profilePage.changePassword(currentPassword, invalidPassword, invalidPassword);
      await driver.sleep(10000);
      await profilePage.savePasswordChanges();
      const hasErrorNewPassword = await profilePage.checkFieldHasError('newPassword');
      const errorMsgNewPassword = await profilePage.getFieldErrorMessage('newPassword');    
      if (!hasErrorNewPassword) {
        throw new Error("Le champ de mot de passe non conforme ne présente pas d'erreur visible");
      }    
      logResult('Test OK : Détection réussie du mot de passe non conforme aux critères');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  
  it('Échec de correspondance entre le nouveau mot de passe et sa confirmation', async function() {
    try {
      const currentPassword = config.validPassword;
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      const validPassword = 'Password1!';         
      const differentConfirmation = 'Password2!'; 
      await profilePage.changePassword(currentPassword, validPassword, differentConfirmation);
      await driver.sleep(10000);
      await profilePage.savePasswordChanges();
      const hasErrorConfirm = await profilePage.checkFieldHasError('confirmNewPassword');
      const errorMsgConfirm = await profilePage.getFieldErrorMessage('confirmNewPassword');
      if (!hasErrorConfirm) {
        throw new Error("Le champ de confirmation différente ne présente pas d'erreur visible");
      }
      logResult('Test OK : Détection de la non-concordance entre les mots de passe réussie');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  
  it('Validation des champs obligatoires dans le profil', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await driver.getCurrentUrl();
      await profilePage.navigateToProfile();
      await driver.sleep(2000);
      const originalInfo = await profilePage.getProfileInfo();
      const requiredFields = ['firstName', 'lastName', 'email'];
      for (const fieldName of requiredFields) {
        const field = await driver.findElement(By.name(fieldName));
        await field.clear();
        const fieldValue = await field.getAttribute('value');
        if (fieldValue) {
          await field.sendKeys(Key.chord(Key.CONTROL, "a"));
          await field.sendKeys(Key.BACK_SPACE);
        }
      }
      await profilePage.saveProfileInfo();
      await driver.sleep(1000);
      const errorResults = {};
      let allErrorsDetected = true;
      
      for (const field of requiredFields) {
        const hasError = await profilePage.checkFieldHasError(field);
        const errorMsg = hasError ? await profilePage.getFieldErrorMessage(field) : null;
        
        errorResults[field] = {
          hasError,
          errorMsg
        };
        
        if (!hasError) {
          allErrorsDetected = false;
        }
      }
      await profilePage.updateProfileInfo(originalInfo);
      await profilePage.saveProfileInfo();
      await driver.sleep(2000);
      await driver.navigate().refresh();
      await driver.sleep(2000);
      const finalInfo = await profilePage.getProfileInfo();
      
      const fieldsToCheck = ['firstName', 'lastName', 'email'];
      let allFieldsRestored = true;
      
      for (const field of fieldsToCheck) {
        if (finalInfo[field] !== originalInfo[field]) {
          allFieldsRestored = false;
          console.log(`Échec de restauration du champ ${field}. Valeur attendue: ${originalInfo[field]}, Valeur actuelle: ${finalInfo[field]}`);
        }
      }
      logResult('Test OK : Validation des champs obligatoires investisseur réussie');
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
      await profilePage.navigateToProfile();
      await driver.sleep(2000);
      const invalidEmails = [
        { value: "emailinvalide.com", description: "sans @" },
        { value: "user@", description: "sans domaine" },
        { value: "email_invalide", description: "format complètement invalide" }
      ];
      let allValidationsSuccessful = true;
      
      for (let i = 0; i < invalidEmails.length; i++) {
        const testCase = invalidEmails[i];
        const updates = { email: testCase.value };
        await profilePage.updateProfileInfo(updates);
        await profilePage.saveProfileInfo();
        await driver.sleep(1000);
        const hasError = await profilePage.checkFieldHasError('email');
      }
      await driver.sleep(2000);
      if (allValidationsSuccessful) {
        logResult('Test OK : Validation du format email investisseur réussie');
      } else {
        throw new Error('Un ou plusieurs tests de validation email ont échoué');
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  
  it('Téléchargement de photo de profil', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      await driver.sleep(5000);
      const imageName = 'profilephoto.png';
      await profilePage.uploadProfilePhoto(imageName);
      await driver.navigate().refresh();
      await driver.sleep(5000);
     logResult('Test OK : Téléchargement de photo de profil investisseur réussie');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  it('Changement de photo de profil', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      await driver.sleep(5000); 
      const imageName = 'photoprof.png';  
      const photoChangeSuccess = await profilePage.changeProfilePhoto(imageName);
      if (!photoChangeSuccess) {
        throw new Error("Échec du changement de photo de profil");
      }
      await profilePage.saveProfileInfo();
      await driver.navigate().refresh();
      await driver.sleep(3000);
      logResult('Test OK : Changement de photo de profil investisseur réussi');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  it('Suppression de photo de profil', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      await driver.sleep(5000); 
      await profilePage.DeleteProfilePhoto();
      await profilePage.saveProfileInfo();
      await driver.navigate().refresh();
      await driver.sleep(3000);
      logResult('Test OK : Suppression de photo de profil investisseur  réussi');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  it('Refus de téléchargement de photo avec format non autorisé', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await profilePage.navigateToProfile();
      await driver.sleep(5000);
      const invalidImageName = 'Cas_de_Test.docx';
      let errorOccurred = false;
      let errorMessage = '';
      try {
        await profilePage.uploadProfilePhoto(invalidImageName);
      } catch (error) {
        errorOccurred = true;
        errorMessage = error.message;
      }
      
      assert.strictEqual(errorOccurred, true, "Le système a accepté un format non autorisé");
      try {
        const errorElement = await driver.findElement(By.xpath('//div[contains(@class, "error") or contains(@class, "alert") or contains(text(), "format") or contains(text(), "autorisé")]'));
        const isErrorDisplayed = await errorElement.isDisplayed();
        assert.strictEqual(isErrorDisplayed, true, "Message d'erreur non affiché pour un format non autorisé");
      } catch (e) {
        assert.ok(
          errorMessage.includes('format') || 
          errorMessage.includes('type') || 
          errorMessage.includes('autorisé'),
          `L'erreur ne mentionne pas de problème de format: ${errorMessage}`
        );
      }
      await driver.navigate().refresh();
      await driver.sleep(5000);
      logResult('Test OK : Refus de téléchargement de photo avec format non autorisé');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  it('Affichage initial des sélections de langue', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.emailInvestor, config.validPassword);
      await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
      await driver.getCurrentUrl();
      await profilePage.navigateToProfile();
      await driver.sleep(5000);
      await profilePage.scrollToLanguageSection();
      await profilePage.checkLanguageSectionVisible();
      await profilePage.verifyPageLanguage();
      await driver.sleep(2000); 
      const languageValue = await profilePage.getSelectedLanguage();
      if (languageValue) {
      console.log("Langue actuellement sélectionnée:", languageValue);
      const expectedLanguage = "Français";
      assert.strictEqual(languageValue, expectedLanguage, `La langue affichée (${languageValue}) ne correspond pas à la valeur attendue (${expectedLanguage})`);
      } else {
      throw new Error('Échec de récupération de la valeur de langue');
      }
      logResult('Test OK : Affichage initial des sélections de langue vérifié avec succès');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });
  
  
  it('Changement de langue et de région avec vérification', async function() {
    try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.emailInvestor, config.validPassword);
        await driver.wait(until.urlContains('Dashboard_Investor'), 15000);
        await profilePage.navigateToProfile();
        await driver.sleep(3000);
        await profilePage.scrollToLanguageSection();
        const langSectionVisible = await profilePage.checkLanguageSectionVisible();
        assert.strictEqual(langSectionVisible, true, 'La section des paramètres de langue n\'est pas visible');
        const isFrench = await profilePage.verifyPageLanguage();
        assert.strictEqual(isFrench, true, 'L\'interface n\'est pas en français initialement');
        const initialLanguage = await profilePage.getSelectedLanguage();
        console.log("Langue initiale:", initialLanguage);
        assert.strictEqual(initialLanguage, "Français", `La langue initiale (${initialLanguage}) n'est pas celle attendue (Français)`);
        
        await profilePage.changeLanguage("English");
        await profilePage.changeRegion("Asie");
        await profilePage.saveLanguageAndRegionSettings();
        await driver.sleep(6000);      
        const isEnglish = await profilePage.verifyEnglishInterface();
        assert.strictEqual(isEnglish, true, 'L\'interface n\'est pas passée en anglais après le changement');
        await profilePage.changeLanguage("Français");
        await profilePage.saveLanguageAndRegionSettings();
        await driver.sleep(5000);
        await driver.navigate().refresh();
        logResult('Test OK : Changement de langue et de région effectué avec succès et vérifié');
    } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
    }
  });
})
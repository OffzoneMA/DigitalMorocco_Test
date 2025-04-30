const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const ProfilePage = require('../pages/profile.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const assert =require("assert");
const { createUniqueBrowser } = require('../helpers/browser.helper');




describe('Test Profile', function () {
  let driver;
  let loginPage;
  let profilePage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build(); // <== navigateur précisé ici
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
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        const dashboardUrl = await driver.getCurrentUrl();
        if (dashboardUrl.includes('Dashboard')) {
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
            assert.strictEqual(profileInfo.email, config.validEmail, "L'email affiché ne correspond pas à celui utilisé pour la connexion");
        } else {
            logResult('Étape 3 KO : Échec de récupération des informations du profil');
            throw new Error('Échec de récupération des informations du profil');
        }
    
        logResult('Test OK : Affichage des informations du profil ');
    } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
    }
})

it('Modification des informations personnelles dans le profil', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 20000);
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
      logResult('Étape 6 OK : Les modifications du profil ont été correctement enregistrées');
      console.log(`Prénom modifié: ${oldProfileInfo.firstName} -> ${currentInfo.firstName}`);
      console.log(`Nom modifié: ${oldProfileInfo.lastName} -> ${currentInfo.lastName}`);
      console.log(`Pays modifié: ${oldProfileInfo.country || 'Non défini'} -> ${currentInfo.country}`);
    } else {
      logResult('Étape 6 KO : Les modifications du profil n\'ont pas été correctement enregistrées');
      console.log(`Échec pour prénom: Attendu "${updates.firstName}", Obtenu "${currentInfo.firstName}"`);
      console.log(`Échec pour nom: Attendu "${updates.lastName}", Obtenu "${currentInfo.lastName}"`);
      console.log(`Échec pour pays: Attendu "${paysRecherche}", Obtenu "${currentInfo.country}"`);
      throw new Error('Les modifications du profil n\'ont pas été correctement enregistrées');
    }
    logResult('Test OK : Modification du profil réussie');
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
    await loginPage.login(config.validEmail, currentPassword);
    await driver.wait(until.urlContains('Dashboard'), 20000);
    await profilePage.navigateToProfile();
    await profilePage.changePassword(currentPassword, newPassword, newPassword);
    await profilePage.savePasswordChanges();
    logResult('Test OK : Modification du mot de passe réussie et restauration effectuée');
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});
});
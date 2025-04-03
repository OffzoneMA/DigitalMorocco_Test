const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const JuridiquePage = require('../pages/juridique.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const assert = require('assert');


describe('Tests d\'ajout  d\'un document juridique ', function () {
  let driver;
  let loginPage;
  let juridiquePage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    juridiquePage = new JuridiquePage(driver);
});

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  }); 
  
  it('Création d\'un document juridique', async function() {
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
        const navigateSuccess = await juridiquePage.navigateToJuridique();
        if (navigateSuccess) {
          logResult('Étape 2 OK : Navigation vers la page des documents juridiques réussie');
        } else {
          logResult('Étape 2 KO : Échec de navigation vers la page des documents juridiques');
          throw new Error('Échec de navigation vers la page des documents juridiques');
        }
       const createDocumentSuccess = await juridiquePage.clickCreateDocument();
        if (createDocumentSuccess) {
          logResult('Étape 3 OK : Alerte affichée pour l\'ajout d\'un document juridique');
        } else {
          logResult('Étape 3 KO : Échec de l\'affichage de l\'alerte');
          throw new Error('Échec de l\'affichage de l\'alerte');
        }
       const formFillSuccess = await juridiquePage.fillFormDocument('Document test','Document.pdf');
        if (formFillSuccess) {
          logResult('Étape 4 OK : Formulaire de l\'ajout du document juridique rempli avec succès');
        } else {
          logResult('Étape 4 KO : Échec du remplissage du formulaire de l\'ajout du document juridique');
          throw new Error('Échec du remplissage du formulaire des employés');
        }
       logResult('Test OK : Ajout d\'un nouveau document juridique réussie ');
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    })

     it('Echec de création d\'un document juridique - champs obligatoires vides', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await juridiquePage.navigateToJuridique();
            const createDocumentButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Ajouter un nouveau document')]]") ), 10000);
            await driver.executeScript("arguments[0].click();", createDocumentButton);
            const modalForm = await driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Ajouter un nouveau document')]]]")  ), 5000);
            try {
                const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
                await titleInput.clear();
            } catch (e) {
                console.log("Pas pu trouver ou effacer le champ titre:", e.message);
            }
            const submitButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]") );
            await driver.executeScript("arguments[0].click();", submitButton);
            await driver.sleep(1000);
            const errorElements = await driver.findElements(By.xpath( "//div[contains(@class, 'shadow-inputBsError') or contains(@class, 'border-errorColor')]" ));
            const errorMessages = await driver.findElements(By.xpath(  "//*[contains(text(), 'obligatoire') or contains(text(), 'requis') or contains(@class, 'text-red')]" ));            
           if (errorElements.length > 0 || errorMessages.length > 0) {
                logResult('Test OK : Echec de création d\'un document juridique - champs obligatoires vides.');
            } else {
                logResult('Test KO : Aucune erreur de validation n\'est affichée.');
                throw new Error('Échec de la validation des champs obligatoires.');
            }
        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });


    it('Modification du nom d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        await juridiquePage.clickEditFirstJuridique();
       try{ 
        const newDocumentName = "Document juridique modifié " ;
        const nameInput = await driver.wait(until.elementLocated(By.name('title')), 5000);
        await nameInput.clear();
        await nameInput.sendKeys(newDocumentName);
        const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier le document')]")),5000, 'Bouton "Modifier le document" non trouvé' );
        await driver.executeScript("arguments[0].click();", submitButton);
        logResult('Test OK : Modification du nom du document juridique réussie');
        } catch (error) {
          logResult('Test KO : Le nom modifié n\'apparaît pas dans la liste');
          throw new Error('Échec de la modification du nom du document');
        }
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

    it('Mise à jour du fichier d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        await juridiquePage.clickEditFirstJuridique();
        await juridiquePage.clickUpdateDocumentButton('Document (1).pdf');
       try {
          const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier le document')]")),5000,'Bouton "Modifier le document" non trouvé' );
          await driver.executeScript("arguments[0].click();", submitButton);
          await juridiquePage.waitForPageLoad();
          logResult('Test OK : Modification - mise à jour du fichier du document juridique réussie');
        } catch (error) {
          logResult('Test KO : Modification - mise à jour du document juridique a échouée'); }
         } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

   it('Test du bouton Annuler lors de la modification du nom d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        await juridiquePage.clickEditFirstJuridique();
        try { 
          const newDocumentName = "Document  modifié";
          const nameInput = await driver.wait(until.elementLocated(By.name('title')), 5000);
          await nameInput.clear();
          await nameInput.sendKeys(newDocumentName);
          const cancelButton = await driver.wait(  until.elementLocated(By.xpath("//button[contains(@class, 'bg-[#E4E7EC]') and contains(text(), 'Annuler')]")),   5000, 'Bouton "Annuler" non trouvé'  );
          await driver.executeScript("arguments[0].click();", cancelButton);
          logResult('Test OK : bouton Annuler lors de la modification du document juridique');
        } catch (error) {
          logResult('Test KO : Le bouton Annuler ne fonctionne pas correctement');
          throw new Error('Échec du test du bouton Annuler: ' + error.message);
        }
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

    it('Suppression d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        try{
          await juridiquePage.clickDeleteFirstJuridique();
          logResult('Test OK : suppression d\'un document juridique réussie');
      }catch{
        logResult('Test KO : suppression d\'un document juridique a échoué'); }
  } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

  

  
    

});
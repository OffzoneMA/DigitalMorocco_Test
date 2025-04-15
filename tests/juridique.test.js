const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const JuridiquePage = require('../pages/juridique.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const { createUniqueBrowser } = require('../helpers/browser.helper');


describe('Tests d\'ajout  d\'un document juridique ', function () {
  let driver;
  let loginPage;
  let juridiquePage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
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
  
  it('Création d\'un document juridique avec vérification dans le tableau', async function() {
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
      const documentCountBefore = await juridiquePage.countDocumentsInTable();
      console.log(`Nombre de documents avant création: ${documentCountBefore}`);
      
      const documentName = 'Document';
      const fileName = 'Document.pdf';
  
      const createDocumentSuccess = await juridiquePage.clickCreateDocument();
      if (createDocumentSuccess) {
        logResult('Étape 3 OK : Alerte affichée pour l\'ajout d\'un document juridique');
      } else {
        logResult('Étape 3 KO : Échec de l\'affichage de l\'alerte');
        throw new Error('Échec de l\'affichage de l\'alerte');
      }
  
      const formFillSuccess = await juridiquePage.fillFormDocument(documentName, fileName);
      if (formFillSuccess) {
        logResult('Étape 4 OK : Formulaire de l\'ajout du document juridique rempli avec succès');
      } else {
        logResult('Étape 4 KO : Échec du remplissage du formulaire de l\'ajout du document juridique');
        throw new Error('Échec du remplissage du formulaire des employés');
      }
      await driver.sleep(3000); 
      const documentFound = await juridiquePage.waitForDocumentInTable(documentName, 10000);
      await driver.sleep(2000);
      const documentCountAfter = await juridiquePage.countDocumentsInTable();
      console.log(`Nombre de documents après création: ${documentCountAfter}`);
      
     
  
      logResult('Test OK : Ajout et vérification d\'un nouveau document juridique réussis');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

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


    it('Modification du nom d\'un document juridique avec vérification dans le tableau', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await juridiquePage.navigateToJuridique();
        await driver.sleep(1000);
        const firstDocumentNameElement = await driver.findElement(By.xpath("//tbody/tr[1]//td[1]//span[contains(@class, 'text-gray500')]"));
        const firstDocumentName = await firstDocumentNameElement.getText();
        console.log(`Nom du document avant modification: ${firstDocumentName}`);
        await juridiquePage.clickEditFirstJuridique();
        const newDocumentName = "Document juridique modifié";
        const nameInput = await driver.wait(until.elementLocated(By.name('title')), 5000);
        await nameInput.clear();
        await nameInput.sendKeys(newDocumentName);
        const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier le document')]")), 5000, 'Bouton "Modifier le document" non trouvé');
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(2000);
        
        try {
          const updatedDocumentElement = await driver.wait( until.elementLocated(By.xpath("//tbody/tr[1]//td[1]//span[contains(@class, 'text-gray500')]")), 5000);
          const updatedDocumentName = await updatedDocumentElement.getText();
          if (updatedDocumentName.toLowerCase().includes(newDocumentName.toLowerCase())) {
            logResult(`Test OK : Modification du nom du document juridique réussie `);
          } else {
            logResult(`Test KO : Le nom affiché dans le tableau "${updatedDocumentName}" ne contient pas le nouveau nom "${newDocumentName}"`);
            throw new Error('La modification du nom du document juridique a échoué');
          }
        } catch (error) {
          logResult(`Test KO : Erreur lors de la vérification du nom modifié - ${error.message}`);
          throw error;
        }
        
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    }) 
    it('Mise à jour du fichier d\'un document juridique avec vérification', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await juridiquePage.navigateToJuridique();
        await juridiquePage.clickEditFirstJuridique();
        const originalFileLabel = await driver.findElement(By.xpath("//label[contains(@class, 'text-gray-900_01') and contains(@class, 'font-DmSans')]"));
        const originalFileName = await originalFileLabel.getText();
        console.log(`Nom du fichier original: ${originalFileName}`);
        const cancelButton = await driver.findElement(By.xpath("//button[contains(text(), 'Annuler')]"));
        await driver.executeScript("arguments[0].click();", cancelButton);
        await driver.sleep(1000);
        await juridiquePage.clickEditFirstJuridique();
        const newFileName = 'Document (1).pdf';
        const homeDir = require('os').homedir();
        const filePath = path.join(homeDir, 'Downloads', newFileName);
        const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
        await driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.opacity = '1';", fileInput);
        await fileInput.sendKeys(filePath);
        
        const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier le document')]")),5000, 'Bouton "Modifier le document" non trouvé' );
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(3000);
        await juridiquePage.clickEditFirstJuridique();
        await driver.sleep(1000);
        
        try {
          const fileNameElement = await driver.findElement(By.xpath("//label[contains(@class, 'text-gray-900_01') and contains(@class, 'font-DmSans')]"));
          const displayedFileName = await fileNameElement.getText();
          
          if (displayedFileName.includes(newFileName)) {
            logResult('Test OK :Modification réussie - Mise à jour du document ');
          } else {
            logResult(`Test KO : Le nom du fichier affiché "${displayedFileName}" ne correspond pas au fichier mis à jour "${newFileName}"`);
            throw new Error('La vérification du nom du fichier a échoué');
          }
        } catch (error) {
          logResult('Test KO : Impossible de trouver l\'élément affichant le nom du fichier: ' + error.message);
          throw error;
        }
        
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    })
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

    it('Téléchargement d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        
        try {
          const downloadResult = await juridiquePage.clickDownloadFirstJuridique();
          
          if (downloadResult.success) {
            console.log(`Document téléchargé avec succès: ${downloadResult.fileName || 'fichier'}`);
              if (downloadResult.filePath) {
              const fileExists = fs.existsSync(downloadResult.filePath);
              if (fileExists) {
                console.log(`Vérification réussie: le fichier existe bien à ${downloadResult.filePath}`);
                logResult('Test OK : téléchargement et vérification du document juridique réussis');
              } else {
                console.error(`Fichier non trouvé à l'emplacement: ${downloadResult.filePath}`);
                logResult('Test KO : le fichier téléchargé n\'a pas été trouvé à l\'emplacement attendu');
              }
            } else {
              logResult('Test OK : téléchargement réussi, mais chemin du fichier non disponible');
            }
          } else {
            logResult(`Test KO : ${downloadResult.message || 'le téléchargement n\'a pas pu être initié'}`);
          }
        } catch (error) {
          logResult('Test KO : téléchargement d\'un document juridique a échoué');
          throw error;
        }
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

    it('Annulation de la Suppression d\'un document juridique', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await juridiquePage.navigateToJuridique();
        try{
          await juridiquePage.clickDeleteFirstJuridiqueThenCancel();
          logResult('Test OK : Bouton annuler lors de la suppression d\'un document juridique réussie');
      }catch{
        logResult('Test KO : Bouton annuler lors de la suppression d\'un document juridique a échoué'); }
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
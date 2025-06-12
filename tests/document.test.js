const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const DocumentPage = require('../pages/Document.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const assert = require('assert');
const { createBugTicket } = require('../utils/jiraUtils');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const testInfo = require('../utils/testInfo');





describe('Tests d\'ajout  d\'un document juridique ', function () {
  let driver;
  let loginPage;
  let documentPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    documentPage = new DocumentPage(driver);
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

 it('Création d\'un document avec vérification dans le tableau', async function() {
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
      const navigateSuccess = await documentPage.navigateToDocuments();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des documents réussie');
      } else {
        logResult('Étape 2 KO : Échec de navigation vers la page des documents');
        throw new Error('Échec de navigation vers la page des documents');
      }
      const documentCountBefore = await documentPage.countDocumentsInTable();
      const documentName = 'Document Test';
      const createDocumentSuccess = await documentPage.clickCreateDocument();
      await driver.sleep(2000)
      if (createDocumentSuccess) {
        logResult('Étape 3 OK : Alerte affichée pour l\'ajout d\'un document');
      } else {
        logResult('Étape 3 KO : Échec de l\'affichage de l\'alerte');
        throw new Error('Échec de l\'affichage de l\'alerte');
      }
      await driver.sleep(2000); 
      const documentFound = await documentPage.waitForDocumentInTable(documentName, 10000);
      const documentCountAfter = await documentPage.countDocumentsInTable();
      logResult('Test OK : Ajout d\'un nouveau document réussi');
    } catch (error) {
    const errorMessage =error.message ||'Ajout d\'un nouveau document a échoué';
    logResult('Test KO : ' + errorMessage);
    global.lastTestError = errorMessage;      
    throw error;
    }
  })

    it('Echec de création d\'un document - champs obligatoires vides', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await documentPage.navigateToDocuments();
            const createDocumentButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Télécharger un nouveau document')]]") ), 10000);
            await driver.executeScript("arguments[0].click();", createDocumentButton);
            const modalForm = await driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Télécharger un nouveau document')]]]")  ), 5000);
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
                logResult('Test OK : Echec de création d\'un document  - champs obligatoires vides.');
            } else {
              const errorMessage =error.message ||'Aucune erreur de validation n\'est affichée.';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
            }
        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

    it('Modification du nom d\'un document ', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await documentPage.navigateToDocuments();
        await driver.sleep(1000);
        const firstDocumentName = await driver.findElement(By.xpath("//tbody/tr[1]//td[2]//span")).getText();
        await documentPage.clickEditFirstDocument();
        const newDocumentName = "Document modifié ";
        const nameInput = await driver.wait(until.elementLocated(By.name('title')), 5000);
        await nameInput.clear();
        await nameInput.sendKeys(newDocumentName);
        const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier')]")), 5000, 'Bouton "Modifier" non trouvé' );
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(2000);
        const documentFound = await documentPage.waitForDocumentInTable(newDocumentName, 10000);
        await driver.sleep(2000);
        
        if (documentFound) {
          logResult(`Test OK : Modification du nom du document réussie`);
        } else {
          const oldNameStillExists = await documentPage.isDocumentInTable(firstDocumentName);
          if (oldNameStillExists) {
            const errorMessage =' Le document porte toujours l\'ancien nom';
            logResult('Test KO : ' + errorMessage);
         
            } else {
            logResult(`Test KO : Ni l'ancien nom "${firstDocumentName}" ni le nouveau nom "${newDocumentName}" n'ont été trouvés dans le tableau`);
          }
          throw new Error('La modification du nom du document a échoué');
        }
        
      } catch (error) {
        const errorMessage = error.message;
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;      
        throw error;
      }
    })
     
       it('Mise à jour du fichier d\'un document avec vérification', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          await documentPage.navigateToDocuments();
          await documentPage.clickEditFirstDocument();
          const newFileName = 'Document (1).pdf';
          const homeDir = require('os').homedir();
          const filePath = path.join(homeDir, 'Downloads', newFileName);
          const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
          await driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.opacity = '1';", fileInput);
          await fileInput.sendKeys(filePath);
          const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Modifier')]")), 5000, 'Bouton "Modifier" non trouvé');
          await driver.executeScript("arguments[0].click();", submitButton);
          await documentPage.waitForPageLoad();
          await driver.sleep(3000);
          await documentPage.clickEditFirstDocument();
          await driver.sleep(1000); 
          try {
            const fileNameElement = await driver.findElement(By.xpath("//label[contains(@class, 'text-gray-900_01') and contains(@class, 'font-DmSans')]"));
            const displayedFileName = await fileNameElement.getText();
            
            if (displayedFileName.includes(newFileName)) {
              logResult('Test OK : Modification du document - mise à jour du fichier vérifiée');
            } else {
              const errorMessage =error.message ||'Modification échoué - Mis à jour du fichier a échoué';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
           
            }
          } catch (error) {
            logResult('Test KO : Impossible de trouver l\'élément affichant le nom du fichier');
          }
          
         } catch (error) {
           logResult('Test KO : Modification échoué - Mis à jour du fichier a échoué');

          throw error;
        }
      });

      it('Désélection d\'un membre depuis un document existant', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          await documentPage.navigateToDocuments();
          await driver.sleep(1000);
          const sharedWithCellBefore = await driver.findElement(By.xpath("//tbody/tr[1]/td[4]"));
          const sharedWithTextBefore = await sharedWithCellBefore.getText();
          const memberToDeselect = "Ikram EL HAJI";
          await documentPage.clickEditFirstDocument();
          await driver.sleep(1000);
          const selectInputWrapper = await driver.findElement(By.xpath("//input[@name='target']/parent::div"));
          await driver.executeScript("arguments[0].click();", selectInputWrapper);
          await driver.sleep(1000);
          const checkboxLabel = await driver.wait( until.elementLocated(By.xpath(`//label[contains(text(), '${memberToDeselect}')]`)), 5000, "Label du membre non trouvée"  );
          await driver.executeScript("arguments[0].click();", checkboxLabel);
          await driver.sleep(1000);
          const submitButton = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Modifier')]")),  5000 );
          await driver.executeScript("arguments[0].click();", submitButton);
          await driver.wait( until.stalenessOf(submitButton), 10000, "La page ne s'est pas rechargée après soumission" );
          await driver.sleep(2000);
          const sharedWithCell = await driver.wait(until.elementLocated(By.xpath("//tbody/tr[1]/td[4]")),10000,"Colonne 'Partagé avec' non trouvée après rechargement"  );
          const sharedWithText = await sharedWithCell.getText();
          if (sharedWithText.includes(memberToDeselect)) {
            logResult(`Test KO : Le membre "${memberToDeselect}" apparaît toujours dans "Partagé avec"`);
            throw new Error(`Désélection du membre "${memberToDeselect}" non appliquée`);
          } else {
            logResult(`Test OK : Modification réussie - Désélection d'un membre`);
          }
        } catch (error) {
           const errorMessage =error.message ||'Déselection d\'un membre a échoué';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;      
          throw error;
           
        }
      });
      
      it('Test du bouton Annuler lors de la modification du nom d\'un document ', async function() {
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              await driver.getCurrentUrl();
              await documentPage.navigateToDocuments();
              await documentPage.clickEditFirstDocument();
              try { 
                const newDocumentName = "Document ";
                const nameInput = await driver.wait(until.elementLocated(By.name('title')), 5000);
                await nameInput.clear();
                await nameInput.sendKeys(newDocumentName);
                const cancelButton = await driver.wait(  until.elementLocated(By.xpath("//button[contains(@class, 'bg-[#E4E7EC]') and contains(text(), 'Annuler')]")),   5000, 'Bouton "Annuler" non trouvé'  );
                await driver.executeScript("arguments[0].click();", cancelButton);
                logResult('Test OK : bouton Annuler lors de la modification du document');
              } catch (error) {
                logResult('Test KO : Le bouton Annuler ne fonctionne pas correctement');
                throw new Error('Échec du test du bouton Annuler: ' + error.message);
              }
            } catch (error) {
              const errorMessage =error.message ||'Le bouton Annuler ne fonctionne pas comme prévenu';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
           
            }
          });

          it('Tentative de partage sans sélection de membre', async function() {
            let testPassed = null;
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              await documentPage.navigateToDocuments();
              const shareIconClicked = await documentPage.clickShareIcon();
              if (!shareIconClicked) {
                throw new Error('Impossible de cliquer sur l\'icône de partage');
              }
              const shareButton = await driver.findElement(By.xpath("//button[contains(text(), 'Partager avec les membres sélectionnés')]"));
              const isButtonEnabled = await shareButton.isEnabled();
              if (!isButtonEnabled) {
                testPassed = true;
              } else {
                await shareButton.click();
                await driver.sleep(2000);
                try {
                  const successMessage = await driver.findElement(By.xpath("//div[contains(@class, 'bg-white-A700') and .//label[contains(text(), 'Votre document a été partagé avec succès')]]") );
                  testPassed = false;
                } catch (noSuccessMessage) {
                  testPassed = true;
                }
              }
            } catch (error) {
              testPassed = false;
              console.error('Erreur inattendue :', error.message);
            }
            if (testPassed === true) {
              logResult("Test OK : Le système n'autorise pas le partage sans sélection de membre");
            } else {
              const errorMessage =error.message ||'Le bouton de partage n\'est pas désactivé ou un message de partage avec succès est affiché sans sélection de membre';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
            }
          });


          it('Partage de document avec un membre spécifique', async function() {
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              await documentPage.navigateToDocuments();
              
              const shareIconClicked = await documentPage.clickShareIcon();
              if (!shareIconClicked) {
                logResult('Test KO : Impossible de cliquer sur l\'icône de partage');
                throw new Error('Échec du clic sur l\'icône de partage');
              }
              
              const memberName = 'Ikram Imzi';
              const memberSelected = await documentPage.selectMemberToShare(memberName);
              if (!memberSelected) {
                logResult('Test KO : Impossible de sélectionner le membre et de partager');
                throw new Error('Échec de la sélection du membre');
              }
              await driver.sleep(1000);
              try {
                const successAlert = await driver.wait(until.elementLocated(
                  By.xpath("//div[contains(@class, 'bg-white-A700') and .//label[contains(text(), 'Votre document a été partagé avec succès')]]")
                ), 5000);
                const closeButton = await successAlert.findElement(
                  By.xpath(".//div[contains(@class, 'hover:bg-gray-201') and contains(@class, 'rounded-full')]")
                );
                await driver.executeScript("arguments[0].click();", closeButton);
                await driver.wait(until.stalenessOf(successAlert), 5000);
                logResult('Information : Alerte de succès fermée');
              } catch (alertError) {
                logResult('Avertissement : Alerte de succès non trouvée ou impossible à fermer : ' + alertError.message);
              }
                await driver.sleep(2000);
                const memberInTableXPath = `//td[contains(@class, 'px-[18px]') and contains(@class, 'py-4') and contains(@class, 'text-gray500') and contains(text(), '${memberName}')]`;
              try {
                const memberElement = await driver.wait(until.elementLocated(By.xpath(memberInTableXPath)), 5000);
                const memberText = await memberElement.getText();
                if (memberText.includes(memberName)) {
                  logResult('Test OK : Document partagé avec succès avec un membre');
                } else {
                  logResult(`Test KO : ${memberName} n'apparaît pas correctement dans le tableau`);
                  throw new Error('Le membre partagé n\'est pas visible dans le tableau');
                }
              } catch (error) {
                logResult(`Test KO : Impossible de trouver ${memberName} dans le tableau après partage : ${error.message}`);
                throw new Error('Le membre partagé n\'est pas visible dans le tableau');
              }
              
            } catch (error) {
               const errorMessage =error.message ||'Partage de document avec un membre a échoué';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
            }
          });
        
        it('Annulation de la Suppression d\'un document ', async function() {
              try {
                await driver.get(config.baseUrl);
                await loginPage.login(config.validEmail, config.validPassword);
                await driver.wait(until.urlContains('Dashboard'), 20000);
                await driver.getCurrentUrl();
                await documentPage.navigateToDocuments();
                try{
                  await documentPage.clickDeleteFirstDocumentThenCancel();
                  logResult('Test OK : Bouton annuler lors de la suppression d\'un document réussie');
              }catch{
                 const errorMessage =error.message ||'Bouton annuler lors de la suppression d\'un document a échoué';
              logResult('Test KO : ' + errorMessage);
              global.lastTestError = errorMessage;      
              throw error;
                }
              } catch (error) {
                logResult('Test KO : ' + error.message);
                throw error;
              }
            });
        
          it('Suppression d\'un document', async function() {
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              await documentPage.navigateToDocuments();
              await driver.sleep(1000);
              const documentNameXPath = "//tbody/tr[1]/td[2]//span";
              await driver.wait(until.elementLocated(By.xpath(documentNameXPath)), 5000);
              const documentNameElement = await driver.findElement(By.xpath(documentNameXPath));
              const documentNameToDelete = await documentNameElement.getText();
              const rowsBeforeDeletion = await driver.findElements(By.xpath("//tbody/tr"));
              const countBeforeDeletion = rowsBeforeDeletion.length;
              try {
                await documentPage.clickDeleteFirstDocument();
                await driver.sleep(3000);
                const documentStillExistsXPath = `//tbody//span[text()="${documentNameToDelete}"]`;
                
                try {
                  const remainingDocuments = await driver.findElements(By.xpath(documentStillExistsXPath));
                  if (remainingDocuments.length === 0) {
                    logResult('Test OK : Le document a bien été supprimé et n\'apparaît plus dans la liste');
                    const rowsAfterDeletion = await driver.findElements(By.xpath("//tbody/tr"));
                    const countAfterDeletion = rowsAfterDeletion.length;
                     } else {
                       const errorMessage =error.message ||' Le document est toujours présent dans la liste après suppression';
                        logResult('Test KO : ' + errorMessage);
                      global.lastTestError = errorMessage;      
                    throw error;
                
                  }
                } catch (findError) {
                  throw findError;
                }
              } catch (deleteError) {
                throw deleteError;
              }
            } catch (error) {
              throw error;
            }
          });

          it('Échec du téléchargement d\'un fichier avec format non autorisé', async function() {
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              await documentPage.navigateToDocuments();
              
              const createDocumentButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Télécharger un nouveau document')]]") ), 10000);
              await driver.executeScript("arguments[0].click();", createDocumentButton);
              
              const modalForm = await driver.wait(until.elementLocated( By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Télécharger un nouveau document')]]]")), 5000);
              
              const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
              await titleInput.clear();
              await titleInput.sendKeys("Test fichier non autorisé");
              const homeDir = require('os').homedir();
              const filePath = path.join(homeDir, 'Desktop', 'bug partage du document.mp4');
              const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
              await driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.opacity = '1';", fileInput);
              await fileInput.sendKeys(filePath);
              await driver.sleep(2000);
              const immediateErrors = await driver.findElements(By.xpath("//*[contains(text(), 'format non autorisé') or contains(text(), 'type de fichier') or contains(text(), 'extension') or contains(@class, 'text-red')]"  ));
              if (immediateErrors.length > 0) {
                logResult('Test OK : Un message d\'erreur approprié s\'affiche pour un fichier non autorisé');
              } else {
                const submitButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]"));
                await driver.executeScript("arguments[0].click();", submitButton);
                
                try {
                  const loadingButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Envoi en cours')]")), 5000);
                  logResult('Test KO : Le système a accepté un fichier non autorisé et a commencé le téléchargement');
                  
                  
                  throw new Error('Le système a tenté de télécharger un fichier avec format non autorisé');
                } catch (timeoutError) {
                  const afterSubmitErrors = await driver.findElements(By.xpath("//*[contains(text(), 'format non autorisé') or contains(text(), 'type de fichier') or contains(text(), 'extension') or contains(@class, 'text-red')]" ));
                  if (afterSubmitErrors.length > 0) {
                    logResult('Test OK : Le système a correctement rejeté le fichier non autorisé après tentative de soumission');
                  } else {
                    const errorMessage =error.message || `Aucun message d\'erreur ne s\'affiche pour un fichier non autorisé`;
                    logResult('Test KO :' + errorMessage);
                    global.lastTestError = errorMessage;
                    throw new Error('Le système n\'a pas détecté le format de fichier non autorisé');
                  }
                }
              }
              
              try {
                const cancelButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-[#E4E7EC]') and contains(text(), 'Annuler')]"));
                await driver.executeScript("arguments[0].click();", cancelButton);
              } catch (error) {
                logResult('Impossible de fermer le modal: ' + error.message);
              }
              
            } catch (error) {
              logResult('Test KO : ' + error.message);
              throw error;
            }
          });
          
         it('Échec de l\'ajout d\'un document  avec un fichier volumineux', async function() {
              try {
                await driver.get(config.baseUrl);
                await loginPage.login(config.validEmail, config.validPassword);
                await driver.wait(until.urlContains('Dashboard'), 20000);
                await documentPage.navigateToDocuments();
                
                const createDocumentButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Télécharger un nouveau document')]]")), 10000);
                await driver.executeScript("arguments[0].click();", createDocumentButton);
                
                const modalForm = await driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Télécharger un nouveau document')]]]")), 5000);
                
                const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
                await titleInput.clear();
                await titleInput.sendKeys("Test fichier ");
                
                const homeDir = require('os').homedir();
                const filePath = path.join(homeDir, 'Downloads', 'car_prices.csv');
                const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
                await driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.opacity = '1';", fileInput);
                await fileInput.sendKeys(filePath);
                await driver.sleep(2000);
                
                const immediateErrors = await driver.findElements(By.xpath("//*[contains(text(), 'volumineux') or contains(text(), 'type de fichier') or contains(text(), 'extension') or contains(@class, 'text-red')]"));
                if (immediateErrors.length > 0) {
                  logResult('Test OK : Un message d\'erreur approprié s\'affiche pour un fichier volumineux');
                } else {
                  const submitButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]"));
                  await driver.executeScript("arguments[0].click();", submitButton);
                  
                  try {
                    const loadingButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Envoi en cours')]")), 5000);
                    logResult('Test KO : Le système a accepté un fichier volumineux');
                    
                    throw new Error('Le système a tenté de télécharger un fichier volumineux');
                  } catch (timeoutError) {
                    const afterSubmitErrors = await driver.findElements(By.xpath("//*[contains(text(), 'volumineux') or contains(text(), 'type de fichier') or contains(text(), 'extension') or contains(@class, 'text-red')]"));
                    if (afterSubmitErrors.length > 0) {
                      logResult('Test OK : Le système a correctement rejeté le fichier volumineux');
                    } else {
                      const errorMessage = error.message ||`Aucun message d\'erreur ne s\'affiche pour un fichier volumineux`;
                      logResult('Test KO : ' + errorMessage);
                      global.lastTestError = errorMessage;
                      throw new Error('Le système n\'a pas détecté le fichier volumineux');
                    }
                  }
                }
                
                try {
                  const cancelButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-[#E4E7EC]') and contains(text(), 'Annuler')]"));
                  await driver.executeScript("arguments[0].click();", cancelButton);
                } catch (error) {
                  logResult('Impossible de fermer le modal: ' + error.message);
                }
                
              } catch (error) {
                logResult('Test KO : ' + error.message);
                throw error;
              }
            });
})
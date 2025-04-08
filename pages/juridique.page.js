const {By, until} = require("selenium-webdriver");
const fs = require('fs');
const path = require('path');
const os = require('os');

class JuridiquePage {
    constructor(driver) {
        this.driver = driver;
    }

    async waitForPageLoad() {
        await this.driver.wait(async () => {
          const readyState = await this.driver.executeScript('return document.readyState');
          return readyState === 'complete';
        }, 10000, 'Page n\'a pas chargé dans le délai');
        
        await this.driver.sleep(1000);
    }

    async navigateToJuridique() {
        try {
            const companyMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Entreprise')]]")), 10000, 'Menu "Entreprise" non trouvé');
            await companyMenuTrigger.click();
            await this.driver.sleep(500);
            const employeeProfileLink = await this.driver.wait(until.elementLocated(By.xpath("//li//span[contains(text(), 'Juridique')]")), 10000, 'Lien "Juridique" non trouvé');
            await employeeProfileLink.click();
            await this.driver.wait(until.urlContains('CompanyLegal'), 10000, 'Navigation vers la page des documents juridiques échouée');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des documents juridiques:', error);
            throw error;
        }
    }

    async clickCreateDocument() {
      try {
          try {
              const existingModal = await this.driver.findElement(By.xpath("//div[contains(@class, 'ReactModal__Overlay')]"));
              if (await existingModal.isDisplayed()) {
                  const closeButton = await this.driver.findElement(By.xpath("//button[contains(@aria-label, 'close') or contains(@class, 'close')]"));
                  await closeButton.click();
                  await this.driver.sleep(500);
              }
          } catch (modalError) {
          }
          
          const createDocumentButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Ajouter un nouveau document')]]")),10000, 'Bouton "Ajouter un nouveau document" non trouvé' );
          await this.driver.executeScript("arguments[0].click();", createDocumentButton);
          const modalForm = await this.driver.wait( until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Ajouter un nouveau document')]]]")), 5000, 'Modal d\'ajout de document non trouvé' );
          const isModalDisplayed = await modalForm.isDisplayed();
          if (isModalDisplayed) {
              console.log('Modal d\'ajout de document détecté');
              const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
              await titleInput.sendKeys('Document');
              const fileInput = await modalForm.findElement(By.xpath(".//input[@type='file']"));
              const submitButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]"));
              await submitButton.click();
              await this.waitForPageLoad();
              return true;
          }
          
          return false;
      } catch (error) {
          console.error('Erreur lors de l\'ajout d\'un nouveau document:', error.message);
          throw error;
      }
  }
  async fillFormDocument(title, filePath) {
    try {
        let modalForm;
        try {
            modalForm = await this.driver.findElement(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Ajouter un nouveau document')]]]"));
            if (!(await modalForm.isDisplayed())) {
                const createDocumentButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Ajouter un nouveau document')]]")),10000,'Bouton "Ajouter un nouveau document" non trouvé');
                await this.driver.executeScript("arguments[0].click();", createDocumentButton);
                modalForm = await this.driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Ajouter un nouveau document')]]]")),5000,'Modal d\'ajout de document non trouvé' );
            }
        } catch (notFoundError) {
            const createDocumentButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Ajouter un nouveau document')]]")),10000,'Bouton "Ajouter un nouveau document" non trouvé' );
            await this.driver.executeScript("arguments[0].click();", createDocumentButton);
            modalForm = await this.driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Ajouter un nouveau document')]]]")),5000,  'Modal d\'ajout de document non trouvé'  );
        }
        const isModalDisplayed = await modalForm.isDisplayed();
        if (isModalDisplayed) {
            const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
            await titleInput.clear();
            await titleInput.sendKeys(title);
            if (filePath) {
                const os = require('os');
                const path = require('path');
                let absoluteFilePath = filePath;
                if (!path.isAbsolute(filePath)) {
                    const downloadsFolder = path.join(os.homedir(), 'Downloads'); 
                    absoluteFilePath = path.join(downloadsFolder, filePath);
                }
                const fileInput = await modalForm.findElement(By.xpath(".//input[@type='file']"));
                await this.driver.executeScript(`
                    arguments[0].style.display = 'block';
                    arguments[0].style.opacity = '1';
                `, fileInput);
                
                await fileInput.sendKeys(absoluteFilePath);
                await this.driver.sleep(1000);
            }
            const submitButton = await modalForm.findElement(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]") );
            await this.driver.executeScript("arguments[0].click();", submitButton);
            await this.waitForPageLoad();
            return true;
        }
         return false;
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un nouveau document:', error.message);
        throw error;
    }
}
async clickUpdateDocumentButton(newFilePath) {
  try {
      const updateButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'cursorpointer') and contains(text(), 'Mettre à jour votre document')]")),10000,  'Bouton "Mettre à jour votre document" non trouvé' );
      await this.driver.executeScript("arguments[0].click();", updateButton);
      await this.driver.sleep(1000);
      const fileInput = await this.driver.wait(until.elementLocated(By.xpath("//input[@type='file']")),5000,'Champ de téléchargement non trouvé après clic sur "Mettre à jour votre document"'  );
      await this.driver.executeScript(`
          arguments[0].style.display = 'block';
          arguments[0].style.opacity = '1';
      `, fileInput);
      if (newFilePath) {
          const os = require('os');
          const path = require('path');
          let absoluteFilePath = newFilePath;
          if (!path.isAbsolute(newFilePath)) {
              const downloadsFolder = path.join(os.homedir(), 'Downloads');
              absoluteFilePath = path.join(downloadsFolder, newFilePath);
          }
          await fileInput.sendKeys(absoluteFilePath);
          await this.driver.sleep(1000);
          try {
              const confirmButton = await this.driver.wait( until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Confirmer') or contains(text(), 'Enregistrer') or contains(text(), 'Valider')]")), 5000  );
              await this.driver.executeScript("arguments[0].click();", confirmButton);
              await this.waitForPageLoad();
          } catch (confirmError) {
              console.log("Aucun bouton de confirmation trouvé, la mise à jour a peut-être été automatique");
          }
      }
       return true;
  } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error.message);
      throw error;
  }
}

async clickEditFirstJuridique() {
  try {
    await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
    try {
      await this.driver.wait(until.elementLocated(By.css('tbody tr')), 20000);
    } catch (timeoutErr) {
      return false;
    }
    try {
      const editButtonXPath = "//tbody/tr[1]/td[last()]//div[contains(@class, 'relative group')]//i[contains(@class, 'edit') or contains(@class, 'pencil') or contains(@class, 'modify')] | //tbody/tr[1]/td[last()]//div[contains(@class, 'relative group')]//*[name()='svg' and (contains(@class, 'edit') or contains(@class, 'pencil'))]";
      const editButtons = await this.driver.findElements(By.xpath(editButtonXPath));
      if (editButtons.length > 0) {
        await this.driver.executeScript("arguments[0].click();", editButtons[0]);
        await this.driver.sleep(500);
        try {
          await this.driver.wait(until.elementLocated(By.name('name')), 5000);
          return true;
        } catch (formErr) {
          console.log("Formulaire d'édition non trouvé après clic sur l'icône d'édition");
        }
      }
      const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
      const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
      for (let i = 0; i < actionContainers.length; i++) {
        const actions = this.driver.actions({async: true});
        await actions.move({origin: actionContainers[i]}).perform();
        await this.driver.sleep(500);
        const modifierElements = await this.driver.findElements(By.xpath("//div[contains(@class, 'text-center') and text()='Modifier']"));
        if (modifierElements.length > 0) {
          await this.driver.executeScript("arguments[0].click();", modifierElements[0]);
          await this.driver.sleep(500);
          try {
            await this.driver.wait(until.elementLocated(By.name('name')), 5000);
            return true;
          } catch (formErr) {
            console.log("Formulaire d'édition non trouvé après clic sur le texte 'Modifier'");
            continue; 
          }
        }
      }
      if (actionContainers.length >= 2) {
        const actions = this.driver.actions({async: true});
        await actions.move({origin: actionContainers[1]}).perform();
        await this.driver.sleep(500);
        const tooltipText = await this.driver.executeScript(`
          const tooltips = document.querySelectorAll('div[class*="tooltip"], div[class*="popup"], div[class*="hover"]');
          for (const tooltip of tooltips) {
            if (tooltip.innerText.includes('Modifier')) return 'Modifier';
            if (tooltip.innerText.includes('Supprimer')) return 'Supprimer';
            if (tooltip.innerText.trim()) return tooltip.innerText.trim();
          }
          return '';
        `);
        if (tooltipText === 'Modifier') {
          await this.driver.executeScript("arguments[0].click();", actionContainers[1]);
          await this.driver.sleep(500);
          
          try {
            await this.driver.wait(until.elementLocated(By.name('name')), 5000);
            return true;
          } catch (formErr) {
            console.log("Formulaire d'édition non trouvé après vérification du tooltip");
          }
        } else {
          console.log(`Ce n'est pas le bouton de modification, c'est : ${tooltipText}`);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la tentative de modification:', error);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors du clic sur le bouton d\'édition:', error);
    return false;
  }
}

async clickDeleteFirstJuridique() {
  try {
    await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
    try {
      await this.driver.wait( until.elementLocated(By.css('tbody tr')),  20000 );
    } catch (timeoutErr) {
      return false;
    }
    const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
    const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
    
    if (actionContainers.length >= 2) {
        try {
        const deleteButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][2]";
        const deleteButton = await this.driver.findElement(By.xpath(deleteButtonXPath));
        await deleteButton.click();
        const confirmButtonXPath = "//button[contains(text(), 'Supprimer maintenant')]";
        await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
        const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
        await confirmButton.click();
        await this.driver.wait(until.stalenessOf(confirmButton),5000 );
        return true;
        try {
          await this.driver.wait(until.elementLocated(By.name('name')), 5000);
          return true;
        } catch (formErr) {
          console.log("Formulaire de suppression non trouvé après clic direct");
        }
      } catch (directClickErr) {
        console.log("Échec du clic direct sur le bouton de suppression:", directClickErr);
      }
      const actions = this.driver.actions({async: true});
      try {
        const deleteContainer = actionContainers[1];
        await actions.move({origin: deleteContainer}).perform();
        await this.driver.sleep(500);
        const deleteTextXPath = "//div[contains(@class, 'text-center') and text()='Supprimer']";
        await this.driver.executeScript(`
          const deleteElement = document.evaluate(
            "${deleteTextXPath}",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          
          if (deleteElement) {
            deleteElement.click();
            return true;
          }
          return false;
        `);
        await this.driver.wait(until.elementLocated(By.name('name')), 8000);
        
        return true;
      } catch (actionsErr) {
          try {
          await this.driver.executeScript("arguments[0].click();", actionContainers[1]);
          await this.driver.sleep(500);
          await this.driver.executeScript(`
            const elements = document.querySelectorAll('div');
            for (const el of elements) {
              if (el.textContent.includes('Supprimer')) {
                el.click();
                return true;
              }
            }
            return false;
          `);
          await this.driver.wait(until.elementLocated(By.name('name')), 8000);
          
          return true;
        } catch (finalErr) {
          console.log("Toutes les tentatives ont échoué");
          return false;
        }
      }
    } else {
      console.log("Conteneurs d'actions non trouvés");
      return false;
    }
  } catch (error) {
    console.error('Erreur lors du clic sur le bouton de supprimer:', error);
    return false;
  }
}

async clickDeleteFirstJuridiqueThenCancel() {
  try {
    await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
    try {
      await this.driver.wait( until.elementLocated(By.css('tbody tr')),  20000 );
    } catch (timeoutErr) {
      return false;
    }
    const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
    const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
    
    if (actionContainers.length >= 2) {
        try {
        const deleteButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][2]";
        const deleteButton = await this.driver.findElement(By.xpath(deleteButtonXPath));
        await deleteButton.click();
        const confirmButtonXPath = "//button[contains(text(), 'Annuler')]";
        await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
        const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
        await confirmButton.click();
        await this.driver.wait(until.stalenessOf(confirmButton),5000 );
        return true;
        try {
          await this.driver.wait(until.elementLocated(By.name('name')), 5000);
          return true;
        } catch (formErr) {
          console.log("Formulaire de suppression non trouvé après clic direct");
        }
      } catch (directClickErr) {
        console.log("Échec du clic direct sur le bouton de suppression:", directClickErr);
      }
      const actions = this.driver.actions({async: true});
      try {
        const deleteContainer = actionContainers[1];
        await actions.move({origin: deleteContainer}).perform();
        await this.driver.sleep(500);
        const deleteTextXPath = "//div[contains(@class, 'text-center') and text()='Annuler']";
        await this.driver.executeScript(`
          const deleteElement = document.evaluate(
            "${deleteTextXPath}",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          
          if (deleteElement) {
            deleteElement.click();
            return true;
          }
          return false;
        `);
        await this.driver.wait(until.elementLocated(By.name('name')), 8000);
        
        return true;
      } catch (actionsErr) {
          try {
          await this.driver.executeScript("arguments[0].click();", actionContainers[1]);
          await this.driver.sleep(500);
          await this.driver.executeScript(`
            const elements = document.querySelectorAll('div');
            for (const el of elements) {
              if (el.textContent.includes('Annuler')) {
                el.click();
                return true;
              }
            }
            return false;
          `);
          await this.driver.wait(until.elementLocated(By.name('name')), 8000);
          
          return true;
        } catch (finalErr) {
          console.log("Toutes les tentatives ont échoué");
          return false;
        }
      }
    } else {
      console.log("Conteneurs d'actions non trouvés");
      return false;
    }
  } catch (error) {
    console.error('Erreur lors du clic sur le bouton de supprimer:', error);
    return false;
  }
}




async clickDownloadFirstJuridique() {
  try {
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const filesBefore = fs.readdirSync(downloadsPath);
    await this.driver.wait(until.elementLocated(By.css('tbody tr')), 20000);
    const clicked = await this.driver.executeScript(`
      const row = document.querySelector('tbody tr:first-child');
      if (!row) return 'Aucune ligne trouvée';
      const lastCell = row.querySelector('td:last-child');
      if (!lastCell) return 'Dernière cellule non trouvée';
      const svgs = lastCell.querySelectorAll('svg');
      console.log('Nombre de SVGs trouvés:', svgs.length);
      for (let i = 0; i < svgs.length; i++) {
        const svg = svgs[i];
        const hasPolyline = svg.querySelector('polyline[points="7 10 12 15 17 10"]');
        const hasLine = svg.querySelector('line[x1="12"]');
        if (hasPolyline && hasLine) {
          console.log("SVG de téléchargement trouvé à l'index:", i);
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          svg.dispatchEvent(clickEvent);
          return 'Icône de téléchargement cliquée';
        }
      }
      const allGroups = lastCell.querySelectorAll('.relative.group');
      for (let i = 0; i < allGroups.length; i++) {
        const group = allGroups[i];
        if (group.textContent.includes('Télécharger')) {
          console.log("Groupe avec texte Télécharger trouvé à l'index:", i);
          group.click();
          return 'Groupe de téléchargement cliqué';
        }
      }
      if (allGroups.length >= 3) {
        console.log("Clic sur le troisième groupe.");
        allGroups[2].click();
        return 'Troisième groupe cliqué';
      }
      
      return 'Aucune icône de téléchargement trouvée';
    `);
    
    console.log('Résultat du script JavaScript:', clicked);
    let newFile = null;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts && !newFile) {
      await this.driver.sleep(500);
      attempts++;
      const filesAfter = fs.readdirSync(downloadsPath);
      const newFiles = filesAfter.filter(file => !filesBefore.includes(file));
      if (newFiles.length > 0) {
        const filePaths = newFiles.map(file => path.join(downloadsPath, file));
        const fileStats = filePaths.map(filePath => ({
          path: filePath,
          stats: fs.statSync(filePath)
        }));
        fileStats.sort((a, b) => b.stats.birthtimeMs - a.stats.birthtimeMs);
        newFile = path.basename(fileStats[0].path);
        break;
      }
    }
    
    if (newFile) {
      console.log(`Téléchargement réussi: ${newFile} trouvé dans ${downloadsPath}`);
      return {
        success: true,
        filePath: path.join(downloadsPath, newFile),
        fileName: newFile
      };
    } else {
      console.error('Aucun nouveau fichier détecté après le téléchargement');
      return {
        success: false,
        message: 'Aucun fichier téléchargé détecté'
      };
    }
  } catch (error) {
    console.error('Erreur lors de la tentative de téléchargement:', error);
    try {
      const groupContainers = await this.driver.findElements(By.xpath("//tbody/tr[1]/td[last()]//div[@class='relative group']"));
      
      if (groupContainers.length >= 3) {
        console.log('Approche alternative: clic sur le troisième conteneur de groupe');
        const actions = this.driver.actions({async: true});
        await actions.move({origin: groupContainers[2]}).click().perform();
        await this.driver.sleep(3000);
        return {
          success: true,
          message: 'Approche alternative utilisée, téléchargement probablement réussi'
        };
      }
      
      return {
        success: false,
        message: 'Téléchargement échoué'
      };
    } catch (altError) {
      console.error('Échec de l\'approche alternative:', altError);
      return {
        success: false,
        message: 'Toutes les tentatives de téléchargement ont échoué'
      };
    }
  }
}

async countDocumentsInTable() {
  try {
    await this.driver.wait(until.elementLocated(By.css('tbody tr')), 5000);
    const rows = await this.driver.findElements(By.css('tbody tr'));
    return rows.length;
  } catch (error) {
    console.error('Erreur lors du comptage des documents:', error);
    return 0;
  }
}
async waitForDocumentInTable(documentName, timeout = 5000) {
  try {
    const startTime = Date.now();
    let documentFound = false;
    
    while (Date.now() - startTime < timeout && !documentFound) {
      const rows = await this.driver.findElements(By.css('tbody tr'));
      
      for (const row of rows) {
        const nameCell = await row.findElement(By.css('td:first-child span'));
        const text = await nameCell.getText();
        
        if (text.includes(documentName)) {
          console.log(`Document trouvé dans le tableau: "${text}"`);
          documentFound = true;
          break;
        }
      }
      
      if (!documentFound) {
        console.log('Document non trouvé, attente...');
        await this.driver.sleep(500);
      }
    }
    
    return documentFound;
  } catch (error) {
    console.error('Erreur lors de la recherche du document dans le tableau:', error);
    return false;
  }
}

async getFirstDocumentName() {
  try {
    const firstDocumentNameCell = await driver.wait(
      until.elementLocated(By.xpath("//tbody/tr[1]/td[1]//span[@class='text-gray500']")), 
      5000, 
      'Cellule du nom du document non trouvée'
    );
    return await firstDocumentNameCell.getText();
  } catch (error) {
    console.error('Erreur lors de la récupération du nom du document:', error);
    return null;
  }
}
async isDocumentInTable(documentName) {
  try {
    const documentElement = await driver.findElement(By.xpath(`//tbody//span[contains(text(), '${documentName}')]`));
    return true;
  } catch (error) {
    return false;
  }
}
}


module.exports = JuridiquePage;

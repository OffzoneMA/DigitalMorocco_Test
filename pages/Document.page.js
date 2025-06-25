const {By, until} = require("selenium-webdriver");

class DocumentPage {
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

    async navigateToDocuments() {
        try {
          const DocumentMenu = await this.driver.wait( until.elementLocated(By.xpath("//span[contains(text(), 'Documents')]")), 10000,'Menu "Documents" non trouvé' );
          await DocumentMenu.click();
          await this.driver.wait(until.urlContains('Document'),10000,'Navigation vers la page des documents échouée' );
          await this.waitForPageLoad();
          return true;
        } catch (error) {
          console.error('Erreur lors de la navigation vers la page des documents:', error.message);
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
            const createDocumentButton = await this.driver.wait( until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Télécharger un nouveau document')]]")), 10000,'Bouton "Télécharger un nouveau document" non trouvé'  );
            await this.driver.executeScript("arguments[0].click();", createDocumentButton);
            
            const modalForm = await this.driver.wait( until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Télécharger un nouveau document')]]]")), 5000,  'Modal de télécharger de document non trouvé' );
            const isModalDisplayed = await modalForm.isDisplayed();
            
            if (isModalDisplayed) {
                const titleInput = await modalForm.findElement(By.xpath(".//input[@name='title']"));
                await titleInput.sendKeys('Document Test');
                const fileInput = await modalForm.findElement(By.xpath(".//input[@type='file']"));
                await this.driver.executeScript(`
                    arguments[0].style.display = 'block';
                    arguments[0].style.opacity = '1';
                    arguments[0].style.position = 'static';
                `, fileInput);
                
                const path = require('path');
                const testFilesDocumentsPath = path.join(__dirname, '..', 'test-files', 'documents');
                const filePath = path.join(testFilesDocumentsPath, 'Document.pdf');
                await fileInput.sendKeys(filePath);
                await this.driver.sleep(1000);
                try {
                    const targetInput = await modalForm.findElement(By.xpath(".//input[@name='target']"));
                    await this.driver.executeScript("arguments[0].click();", targetInput);
                    await this.driver.sleep(2000);                     
                    const userItems = await this.driver.findElements(By.xpath("//div[contains(@class, 'flex') and .//label[contains(@class, 'block')]]") );                    
                    if (userItems.length > 0) {
                        const firstCheckbox = await this.driver.findElement(By.xpath("(//input[@type='checkbox' and contains(@id, 'check_')])[1]"));
                        const isChecked = await this.driver.executeScript("return arguments[0].checked;", firstCheckbox);
                        if (!isChecked) {
                            await this.driver.executeScript("arguments[0].click();", firstCheckbox);
                            await this.driver.sleep(500);
                            console.log("Case à cocher sélectionnée");
                        } else {
                            console.log("La case était déjà cochée");
                        }
                        try {
                            const userName = await this.driver.findElement(By.xpath("(//div[contains(@class, 'flex') and .//label[contains(@class, 'block')]]//label[contains(@class, 'block')])[1]")).getText();
                            console.log(`Utilisateur sélectionné: ${userName}`);
                        } catch (nameError) {
                            console.log("Impossible d'obtenir le nom de l'utilisateur, mais la sélection a été effectuée");
                        }
                        const modalTitle = await modalForm.findElement(By.xpath(".//label[contains(text(), 'Télécharger un nouveau document')]"));
                        await this.driver.executeScript("arguments[0].click();", modalTitle);
                        await this.driver.sleep(1000);
                    } else {
                        throw new Error("Aucun utilisateur trouvé dans la liste déroulante");
                    }
                    
                } catch (error) {
                    console.log('Problème avec le champ de partage:', error.message);
                    throw error;
                }
                await this.driver.sleep(1000);
                const submitButton = await this.driver.wait(until.elementLocated(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]")), 5000,   'Bouton de soumission non trouvé'  );
                await this.driver.wait(until.elementIsVisible(submitButton), 5000, 'Le bouton de soumission n\'est pas visible' );
                await this.driver.wait(until.elementIsEnabled(submitButton), 5000, 'Le bouton de soumission n\'est pas activé' );
                await this.driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
                await this.driver.sleep(500);
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

    getTestDocumentPath(documentName) {
    const path = require('path');
    const fs = require('fs');
    const testFilesDocumentsPath = path.join(__dirname, '..', 'test-files', 'documents');
    const documentPath = path.join(testFilesDocumentsPath, documentName);
    
    if (!fs.existsSync(documentPath)) {
        throw new Error(`Fichier document non trouvé: ${documentPath}`);
    }
    
    return documentPath;
}


async clickEditFirstDocument() {
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

 async isDocumentInTable(documentName) {
    try {
      try {
        const noDocumentMessage = await this.driver.findElement(By.xpath("//div[contains(text(), 'Aucun document') or contains(text(), 'No documents')]") );
        if (await noDocumentMessage.isDisplayed()) {
          console.log("Le tableau est vide, aucun document n'est présent");
          return false;
        }
      } catch (noMsgError) {
      }
      await this.driver.wait(until.elementLocated(By.css('tbody')),10000,'Tableau de documents non trouvé'  );
      const documentRows = await this.driver.findElements(By.xpath(`//tbody/tr//td[contains(., '${documentName}')]`) );
      if (documentRows.length > 0) {
        console.log(`Document "${documentName}" trouvé dans le tableau`);
        return true;
      }
      const allRows = await this.driver.findElements(By.xpath("//tbody/tr"));
      for (let i = 0; i < allRows.length; i++) {
        const rowText = await allRows[i].getText();
        if (rowText.includes(documentName)) {
          console.log(`Document "${documentName}" trouvé dans le tableau (méthode alternative)`);
          return true;
        }
      }
      console.log(`Document "${documentName}" non trouvé dans le tableau`);
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du document dans le tableau:', error.message);
      return false;
    }
  }
  
  async waitForDocumentInTable(documentName, timeoutMs = 10000) {
    try {
      return await this.driver.wait(async () => {
        return await this.isDocumentInTable(documentName);
      }, timeoutMs, `Document "${documentName}" n'est pas apparu dans le tableau après ${timeoutMs}ms`);
    } catch (error) {
      console.error(`Timeout: Document "${documentName}" n'est pas apparu dans le tableau:`, error.message);
      return false;
    }
  }
  
  async countDocumentsInTable() {
    try {
      try {
        const noDocumentMessage = await this.driver.findElement(By.xpath("//div[contains(text(), 'Aucun document') or contains(text(), 'No documents')]") );
        if (await noDocumentMessage.isDisplayed()) {
          return 0;
        }
      } catch (noMsgError) {
      }
      const rows = await this.driver.findElements(By.xpath("//tbody/tr"));
      return rows.length;
    } catch (error) {
      console.error('Erreur lors du comptage des documents:', error.message);
      return -1; 
    }
  }

  async clickDeleteFirstDocument() {
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

  async  clickShareIcon() {
    try {
      await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
      try {
        await this.driver.wait(
          until.elementLocated(By.css('tbody tr')),
          20000
        );
      } catch (timeoutErr) {
        return false;
      }
      const shareButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][3]";
      const shareButton = await this.driver.findElement(By.xpath(shareButtonXPath));
      await shareButton.click();
      const shareDialogXPath = "//div[contains(@class, 'bg-white-A700') and .//label[contains(text(), 'Partager le document')]]";
      await this.driver.wait(until.elementLocated(By.xpath(shareDialogXPath)), 5000);
     return true;
    } catch (error) {
      console.error('Erreur lors du clic sur l\'icône de partage:', error);
      return false;
    }
  }



  async selectMemberToShare(memberName) {
    try {
      const searchInput = await this.driver.findElement(By.xpath("//input[@name='search']"));
      await searchInput.clear();
      await searchInput.sendKeys(memberName);
      await this.driver.sleep(1000);
      const memberRowXPath = `//label[contains(text(), '${memberName}')]/ancestor::div[contains(@class, 'flex items-center')]`;
      const memberRow = await this.driver.findElement(By.xpath(memberRowXPath));
      await this.driver.executeScript("arguments[0].click();", memberRow);
      const memberCheckboxXPath = `//label[contains(text(), '${memberName}')]/ancestor::div[contains(@class, 'flex items-center')]//input[@type='checkbox']`;
      const memberCheckbox = await this.driver.findElement(By.xpath(memberCheckboxXPath));
      await this.driver.executeScript("arguments[0].click();", memberCheckbox);
      const shareButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Partager avec les membres sélectionnés')]"));
      await shareButton.click();
      const shareDialogXPath = "//div[contains(@class, 'bg-white-A700') and .//label[contains(text(), 'Partager le document')]]";
      await this.driver.wait(until.stalenessOf(await this.driver.findElement(By.xpath(shareDialogXPath))), 5000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection du membre:', error);
      return false;
    }
  }

  
  async clickDeleteFirstDocumentThenCancel() {
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
}

module.exports = DocumentPage;
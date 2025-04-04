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
          const DocumentMenu = await this.driver.wait(  until.elementLocated(By.xpath("//span[contains(text(), 'Documents')]")),  10000,  'Menu "Documents" non trouvé'  );
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
        const createDocumentButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Télécharger un nouveau document')]]")),10000, 'Bouton "Télécharger un nouveau document" non trouvé'  );
        await this.driver.executeScript("arguments[0].click();", createDocumentButton);
        const modalForm = await this.driver.wait(until.elementLocated(By.xpath("//form[.//div[contains(@class, 'flex') and .//label[contains(text(), 'Télécharger un nouveau document')]]]")),5000,'Modal de télécharger de document non trouvé' );
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
            const downloadsFolder = path.join(require('os').homedir(), 'Downloads');
            const filePath = path.join(downloadsFolder, 'Document.pdf');
            await fileInput.sendKeys(filePath);
            await this.driver.sleep(1000);
            try {
                const targetInput = await modalForm.findElement(By.xpath(".//input[@name='target']"));
                await this.driver.executeScript("arguments[0].click();", targetInput);
                await this.driver.sleep(1000);
                const firstUser = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'dropdown') or contains(@role, 'option')]")),5000,'Aucun utilisateur trouvé dans la liste' );
                await this.driver.executeScript("arguments[0].click();", firstUser);
                await this.driver.sleep(1000);
                try {
                    const checkbox = await this.driver.wait(until.elementLocated(By.xpath("//input[@id='check_0' and @type='checkbox']")), 3000,'Checkbox pour la sélection du membre non trouvée'  );
                    await this.driver.executeScript("arguments[0].click();", checkbox);
                    await this.driver.sleep(1000);
                    await this.driver.executeScript(`
                        arguments[0].blur();
                    `, targetInput);
                    const modalTitle = await modalForm.findElement(By.xpath(".//label[contains(text(), 'Télécharger un nouveau document')]"));
                    await this.driver.executeScript("arguments[0].click();", modalTitle);
                    await this.driver.sleep(1000);
                } catch (checkboxError) {
                    console.log('Checkbox non trouvée:', checkboxError.message);
                }
            } catch (error) {
                console.log('Problème avec le champ de partage:', error.message);
            }
            await this.driver.sleep(1000);
            const submitButton = await this.driver.wait(until.elementLocated(By.xpath(".//button[contains(@class, 'bg-blue-A400') and contains(text(), 'Ajouter un document')]")),5000, 'Bouton de soumission non trouvé' );
            await this.driver.wait(
                until.elementIsVisible(submitButton), 
                5000, 
                'Le bouton de soumission n\'est pas visible'
            );
            
            await this.driver.wait(
                until.elementIsEnabled(submitButton), 
                5000, 
                'Le bouton de soumission n\'est pas activé'
            );
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
    
    
}

module.exports = DocumentPage;

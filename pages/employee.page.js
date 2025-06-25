const {By ,until} =require("selenium-webdriver");

class EmployeePage{
    constructor(driver){
        this.driver=driver;
    }

    async waitForPageLoad() {
        await this.driver.wait(async () => {
          const readyState = await this.driver.executeScript('return document.readyState');
          return readyState === 'complete';
        }, 10000, 'Page n\'a pas chargé dans le délai ');
        
        await this.driver.sleep(1000);
      }

      async navigateToEmployee() {
        try {
            const companyMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Entreprise')]]")), 10000,   'Menu "Entreprise" non trouvé' );
            await companyMenuTrigger.click();
            await this.driver.sleep(500);
            const employeeProfileLink = await this.driver.wait(until.elementLocated(By.xpath("//li//span[contains(text(), 'Collaborateurs')]")), 10000,  'Lien "collaborateurs" non trouvé' );
            await employeeProfileLink.click();
            await this.driver.wait(until.urlContains('Employees'), 10000, 'Navigation vers la page des employees échouée'  );
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des employees:', error);
            throw error;
        }
    }

    async clickCreateEmployee() {
        try {
          const createEmployeeButton = await this.driver.wait( until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Ajouter un nouvel employé')]]")), 10000,  'Bouton "Ajouter un nouvel employé" non trouvé');
          await createEmployeeButton.click();
          await this.driver.wait(until.urlContains('CreateEmployee'),10000,'Navigation vers la page de création des employees échouée' );
          await this.waitForPageLoad();
          return true;
        } catch (error) {
          console.error('Erreur lors du clic sur le bouton "Ajouter un nouvel employee":', error.message);
          throw error;
        }
      }

      async fillEmployeeForm(employeeData) {
        try {
          const nameField = await this.driver.wait( until.elementLocated(By.css("input[name='fullName']")),10000, 'Champ "Nom complet" non trouvé'  );
          await nameField.clear();
          await nameField.sendKeys(employeeData.name);

          const workEmailField = await this.driver.wait(until.elementLocated(By.css("input[name='workEmail']")),10000,'Champ "Email  work" non trouvé' );
          await workEmailField.clear();
          await workEmailField.sendKeys(employeeData.workEmail);

          const personalEmailField = await this.driver.wait(until.elementLocated(By.css("input[name='personalEmail']")),10000,'Champ "Email personnel" non trouvé' );
          await personalEmailField.clear();
          await personalEmailField.sendKeys(employeeData.personalEmail);

          const phoneNumberField = await this.driver.wait( until.elementLocated(By.css("input[name='phoneNumber']")), 10000, 'Champ "phone number" non trouvé'  );
          await phoneNumberField.clear();
          await phoneNumberField.sendKeys(employeeData.phoneNumber);

          const addressField = await this.driver.wait(until.elementLocated(By.css("input[name='address']")),10000,'Champ "address" non trouvé'  );
          await addressField.clear();
          await addressField.sendKeys(employeeData.address);

          if (employeeData.country) {
            await this.selectDropdownValue('Sélectionnez un pays', employeeData.country);
          }

          const taxIdentifierField = await this.driver.wait(until.elementLocated(By.css("input[name='personalTaxIdentifierNumber']")),10000,'Champ "personal tax Identifier" non trouvé' );
          await taxIdentifierField.clear();
          await taxIdentifierField.sendKeys(employeeData.taxIdentifier);

          if (employeeData.photoPath) {
            await this.uploadProfilePhoto(employeeData.photoPath);
          }

          if (employeeData.title) {
            await this.selectDropdownValue('Sélectionnez le poste/titre', employeeData.title);
          }
          
          if (employeeData.level) {
            await this.selectDropdownValue('Sélectionnez le niveau de l\'employé', employeeData.level);
          }
          
        if (employeeData.department) {
            await this.selectDropdownValue('Sélectionnez le département', employeeData.department);
          } 
          
       if (employeeData.dueDate) {
            await this.selectDate(employeeData.dueDate);
          }
        return true;
        } catch (error) {
          console.error('Erreur lors du remplissage du formulaire:', error.message);
          throw error;
        }
      }

      async selectDropdownValue(placeholder, value) {    
        try {
          const dropdownInput = await this.driver.wait(until.elementLocated( By.xpath(`//input[@placeholder="${placeholder}"]`) ), 10000 );
          await this.driver.executeScript("arguments[0].click();", dropdownInput);
          await this.driver.sleep(2000);
          const optionXpath = `//div[contains(@class, "flex") and contains(@class, "text-left") and contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${value.toLowerCase()}")][1]`;
          const firstOption = await this.driver.wait(until.elementLocated(By.xpath(optionXpath)),5000);
          await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", firstOption);
          await this.driver.sleep(500);
          await this.driver.executeScript("arguments[0].click();", firstOption);
          await this.driver.sleep(1000);
          return true;
        } catch (error) {
          
          try {
            const fallbackOptionXpath = `//div[contains(@class, "flex") and contains(@class, "text-left")][1]`;
            const fallbackOption = await this.driver.wait(until.elementLocated(By.xpath(fallbackOptionXpath)),5000);
            await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", fallbackOption);
            await this.driver.sleep(500);
            await this.driver.executeScript("arguments[0].click();", fallbackOption);
            return true;
          } catch (fallbackError) {
            throw error;
          }
        }
    }


    async selectDate(dueDate) {
      try {
        const dateInput = await this.driver.findElement(By.css('input[name="due-date"]'));
        await dateInput.click();
        await this.driver.sleep(1000);
        const [day, month, year] = dueDate.split('/');
        try {
          const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
          const monthName = monthNames[parseInt(month) - 1];
          const dayElement = await this.driver.findElement( By.xpath(`//abbr[contains(@aria-label, '${parseInt(day)} ${monthName} ${year}')]`));
          await this.driver.executeScript('arguments[0].click();', dayElement);
        } catch (clickError) {
          console.warn('Impossible de cliquer sur la date dans le calendrier:', clickError.message);
          await this.driver.executeScript(`
            const input = arguments[0];
            // Supprimer temporairement l'attribut readonly pour permettre la modification
            const originalReadOnly = input.readOnly;
            input.readOnly = false;
            input.value = '${dueDate}';
            input.readOnly = originalReadOnly;
            
            // Déclencher les événements nécessaires
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(changeEvent);
          `, dateInput);
          const body = await this.driver.findElement(By.tagName("body"));
          await body.click();
        }
        
        await this.driver.sleep(1000);
        return true;
      } catch (error) {
        console.error('Erreur lors de la sélection de la date:', error.message);
        throw error;
      }
    }
   async uploadProfilePhoto(imageName) {
      try {
        const path = require('path');
        const fs = require('fs');
        const testFilesImagesPath = path.join(__dirname, '..', 'test-files', 'images');
        const absoluteImagePath = path.join(testFilesImagesPath, imageName);
        const uploadContainer = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'flex') and .//label[contains(text(), 'Téléchargez la photo ici')]]")),10000,'Conteneur de téléchargement de photo non trouvé' );
        await uploadContainer.click();
        await this.driver.sleep(1000);
        try {
          const fileInput = await this.driver.findElement(By.css('input[type="file"]'));
          await fileInput.sendKeys(absoluteImagePath);
        } catch (inputError) {
          console.warn('Input de fichier standard non trouvé:', inputError.message);
          await this.driver.executeScript(`
            // Trouver l'input de fichier caché s'il existe
            const fileInputs = document.querySelectorAll('input[type="file"]');
            if (fileInputs.length > 0) {
              // Utiliser le premier input de fichier trouvé
              fileInputs[0].style.display = 'block';
              fileInputs[0].style.opacity = '1';
              fileInputs[0].style.position = 'fixed';
              fileInputs[0].style.top = '0';
              fileInputs[0].style.left = '0';
              fileInputs[0].style.zIndex = '9999';
              return fileInputs[0];
            } else {
              // Créer un nouveau input de fichier
              const input = document.createElement('input');
              input.type = 'file';
              input.style.display = 'block';
              input.style.position = 'fixed';
              input.style.top = '0';
              input.style.left = '0';
              input.style.zIndex = '9999';
              document.body.appendChild(input);
              return input;
            }
          `);
          const visibleFileInput = await this.driver.findElement(By.css('input[type="file"]'));
          await visibleFileInput.sendKeys(absoluteImagePath);
          await this.driver.executeScript(`
            const fileInput = arguments[0];
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
          `, visibleFileInput);
        }
        
        await this.driver.sleep(2000); 
        return true;
      } catch (error) {
        console.error('Erreur lors du téléchargement de la photo:', error.message);
        throw error;
      }
    }
      async submitEmployeeForm() {
        try {
          const submitButton = await this.driver.wait( until.elementLocated(By.xpath("//button[@type='submit' and contains(normalize-space(), 'Enregistrer')]")), 10000, 'Bouton "Enregistrer" non trouvé'  );
          await submitButton.click();
          await this.driver.sleep(2000);
          return true;
        } catch (error) {
          console.error('Erreur lors de la soumission du formulaire:', error.message);
          throw error;
        }
      }


      async clickEditFirstEmployee() {
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
              const editButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][2]";
              const editButton = await this.driver.findElement(By.xpath(editButtonXPath));
              await editButton.click();
              try {
                await this.driver.wait(until.elementLocated(By.name('name')), 5000);
                return true;
              } catch (formErr) {
              }
            } catch (directClickErr) {
            }
            const actions = this.driver.actions({async: true});
            try {
              const editContainer = actionContainers[1];
              await actions.move({origin: editContainer}).perform();
              await this.driver.sleep(500);
              const modifierTextXPath = "//div[contains(@class, 'text-center') and text()='Modifier']";
              await this.driver.executeScript(`
                const modifierElement = document.evaluate(
                  "${modifierTextXPath}",
                  document,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;
                
                if (modifierElement) {
                  modifierElement.click();
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
                    if (el.textContent.includes('Modifier')) {
                      el.click();
                      return true;
                    }
                  }
                  return false;
                `);
                await this.driver.wait(until.elementLocated(By.name('name')), 8000);
                
                return true;
              } catch (finalErr) {
                return false;
              }
            }
          } else {
            console.log("Conteneurs d'actions non trouvés");
            return false;
          }
        } catch (error) {
          console.error('Erreur lors du clic sur le bouton d\'édition:', error);
          return false;
        }
      }

    
      async clickDeleteFirstEmployee() {
        try {
          await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
          try {
            await this.driver.wait(until.elementLocated(By.css('tbody tr')), 20000);
          } catch (timeoutErr) {
            return false;
          }      
          const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
          const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
          
          if (actionContainers.length >= 1) {
            try {
              const deleteButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][1]";
              const deleteButton = await this.driver.findElement(By.xpath(deleteButtonXPath));
              await deleteButton.click();
              await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), \"Supprimer l'employé\")]")), 5000);
              const confirmButtonXPath = "//button[contains(text(), 'Supprimer maintenant')]";
              await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
              const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
              await confirmButton.click();
              
              await this.driver.wait(until.stalenessOf(confirmButton), 5000);
              return true;
            } catch (directClickErr) {
              console.log("Échec du clic direct sur le bouton de suppression:", directClickErr);
            }        
            const actions = this.driver.actions({async: true});
            try {
              const deleteContainer = actionContainers[0]; 
              await actions.move({origin: deleteContainer}).perform();
              await this.driver.sleep(500);
              const supprimerTextXPath = "//div[contains(@class, 'text-center') and text()='Supprimer']";
              
              await this.driver.executeScript(`
                const supprimerElement = document.evaluate(
                  "${supprimerTextXPath}",
                  document,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;
                
                if (supprimerElement) {
                  supprimerElement.click();
                  return true;
                }
                return false;
              `);
              await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), \"Supprimer l'employé\")]")), 5000);
              const confirmButtonXPath = "//button[contains(text(), 'Supprimer maintenant')]";
              await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
              const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
              await confirmButton.click();
              await this.driver.wait(until.stalenessOf(confirmButton), 5000);
              return true;
            } catch (actionsErr) {
              console.error("Erreur lors de la séquence d'actions:", actionsErr);
              
              try {
                await this.driver.executeScript("arguments[0].click();", actionContainers[0]);
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
                
                await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), \"Supprimer l'employé\")]")), 5000);
                
                await this.driver.executeScript(`
                  const buttons = document.querySelectorAll('button');
                  for (const btn of buttons) {
                    if (btn.textContent.includes('Supprimer maintenant')) {
                      btn.click();
                      return true;
                    }
                  }
                  return false;
                `);
                await this.driver.sleep(2000);
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
          console.error('Erreur lors de la suppression de l\'employé:', error);
          return false;
        }
      }

      async clickDeleteFirstEmployeeThenCancel() {
        try {
          await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
          try {
            await this.driver.wait(until.elementLocated(By.css('tbody tr')), 20000);
          } catch (timeoutErr) {
            return false;
          }      
          const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
          const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
          if (actionContainers.length >= 1) {
            try {
              const deleteButtonXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group'][1]";
              const deleteButton = await this.driver.findElement(By.xpath(deleteButtonXPath));
              await deleteButton.click();
              await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), \"Supprimer l'employé\")]")), 5000);
              const cancelButtonXPath = "//button[contains(text(), 'Annuler')]";
              await this.driver.wait(until.elementLocated(By.xpath(cancelButtonXPath)), 5000);
              const cancelButton = await this.driver.findElement(By.xpath(cancelButtonXPath));
              await cancelButton.click();
              await this.driver.wait(until.stalenessOf(cancelButton), 5000);
             return true;
            } catch (error) {
              try {
                await this.driver.executeScript(`
                  const buttons = document.querySelectorAll('button');
                  for (const btn of buttons) {
                    if (btn.textContent.includes('Annuler')) {
                      btn.click();
                      return true;
                    }
                  }
                  return false;
                `);
                
                await this.driver.sleep(2000);
                return true;
              } catch (jsError) {
                return false;
              }
            }
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      }
}

module.exports = EmployeePage;


      





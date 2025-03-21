const { By, until } = require('selenium-webdriver');

class ProjectsPage {
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

  async navigateToProjects() {
    try {
      const projectsMenu = await this.driver.wait(  until.elementLocated(By.xpath("//span[contains(text(), 'Mes Projets')]")),  10000,  'Menu "Mes Projets" non trouvé'  );
      await projectsMenu.click();
      await this.driver.wait(until.urlContains('Projects'),10000,'Navigation vers la page des projets échouée' );
      await this.waitForPageLoad();
      return true;
    } catch (error) {
      console.error('Erreur lors de la navigation vers la page des projets:', error.message);
      throw error;
    }
  }

  async clickCreateProject() {
    try {
      const createProjectButton = await this.driver.wait( until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and .//span[contains(text(), 'Créer un projet')]]")), 10000,  'Bouton "Créer un projet" non trouvé');
      await createProjectButton.click();
      await this.driver.wait(until.urlContains('CreateProject'),10000,'Navigation vers la page de création de projet échouée' );
      await this.waitForPageLoad();
      return true;
    } catch (error) {
      console.error('Erreur lors du clic sur le bouton "Créer un projet":', error.message);
      throw error;
    }
  }

  async fillProjectForm(projectData) {
    try {
      const nameField = await this.driver.wait( until.elementLocated(By.css("input[name='name']")),10000, 'Champ "Nom du projet" non trouvé'  );
      await nameField.clear();
      await nameField.sendKeys(projectData.name);
      const detailsField = await this.driver.wait( until.elementLocated(By.css("textarea[name='details']")), 10000, 'Champ "Détails du projet" non trouvé' );
      await detailsField.clear();
      await detailsField.sendKeys(projectData.details);
      if (projectData.website) {
        const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")),10000,'Champ "Site Web" non trouvé' );
        await websiteField.clear();
        await websiteField.sendKeys(projectData.website);
      }
      const contactEmailField = await this.driver.wait(until.elementLocated(By.css("input[name='contactEmail']")),10000,'Champ "Email de contact" non trouvé' );
      await contactEmailField.clear();
      await contactEmailField.sendKeys(projectData.contactEmail);
  
      const fundingField = await this.driver.wait( until.elementLocated(By.css("input[name='funding']")), 10000, 'Champ "Objectif de financement" non trouvé'  );
      await fundingField.clear();
      await fundingField.sendKeys(projectData.funding);
         
      const totalRaisedField = await this.driver.wait(until.elementLocated(By.css("input[name='totalRaised']")),10000,'Champ "Montant total des fonds levés" non trouvé' );
      await totalRaisedField.clear();
      await totalRaisedField.sendKeys(projectData.totalRaised);
      
      if (projectData.projectPhase) {
        await this.selectDropdownValue('Sélectionnez la Phase actuelle du projet', projectData.projectPhase);
      }
      
      if (projectData.country) {
        await this.selectDropdownValue('Sélectionnez un pays', projectData.country);
      }
      
      if (projectData.sector) {
        await this.selectDropdownValue('Sélectionnez un secteur pour le projet', projectData.sector);
      }
      
      if (projectData.publicationType) {
        await this.selectDropdownValue('Sélectionner le type de publication', projectData.publicationType);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors du remplissage du formulaire:', error.message);
      throw error;
    }
  }
  
  async selectDropdownValue(placeholder, value) {    
    try {
      const dropdownInput = await this.driver.wait( until.elementLocated(By.xpath(`//input[@placeholder='${placeholder}']`)), 10000, `Input avec placeholder "${placeholder}" non trouvé` );
      await this.driver.executeScript("arguments[0].click();", dropdownInput);
      await this.driver.sleep(2000);
      const firstOption = await this.driver.wait(  until.elementLocated(By.xpath(`//div[contains(@class, "flex") and contains(@class, "text-left")][1]`)),  5000,  `Aucune option trouvée dans la liste` );
      await this.driver.executeScript("arguments[0].scrollIntoView(true);", firstOption);
      await this.driver.sleep(500);
      await this.driver.executeScript("arguments[0].click();", firstOption);
       await this.driver.sleep(1000);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sélection dans le dropdown "${placeholder}":`, error.message);
      throw error;
    }
  }
  async submitProjectForm() {
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

  async clickEditFirstProject() {
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
            console.log("Formulaire d'édition non trouvé après clic direct");
          }
        } catch (directClickErr) {
          console.log("Échec du clic direct sur le bouton d'édition:", directClickErr);
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
            console.log("Toutes les tentatives ont échoué");
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

  async clickDeleteFirstProject() {
    try {
      await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
      try {
        await this.driver.wait(until.elementLocated(By.css('tbody tr')), 20000 );
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
          await this.driver.wait( until.elementLocated(By.xpath("//label[contains(text(), 'Supprimer le projet')]")),  5000  );
          const confirmButtonXPath = "//button[contains(text(), 'Supprimer maintenant')]";
          await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
          const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
          await confirmButton.click();
          
          await this.driver.wait(until.stalenessOf(confirmButton),5000 );
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
          await this.driver.wait( until.elementLocated(By.xpath("//label[contains(text(), 'Supprimer le projet')]")),  5000 );
          const confirmButtonXPath = "//button[contains(text(), 'Supprimer maintenant')]";
          await this.driver.wait(until.elementLocated(By.xpath(confirmButtonXPath)), 5000);
          const confirmButton = await this.driver.findElement(By.xpath(confirmButtonXPath));
          await confirmButton.click();
          await this.driver.wait( until.stalenessOf(confirmButton),  5000 );
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
            
            await this.driver.wait( until.elementLocated(By.xpath("//label[contains(text(), 'Supprimer le projet')]")),  5000 );
            
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
      console.error('Erreur lors de la suppression du projet:', error);
      return false;
    }
  }


 
}

module.exports = ProjectsPage;
const { By, until } = require('selenium-webdriver');

class ProjectsDetailsPage {
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
      const projectsMenu = await this.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Mes Projets')]")),10000,'Menu "Mes Projets" non trouvé'  );
      await projectsMenu.click();
      await this.driver.wait(until.urlContains('Projects'),10000,'Navigation vers la page des projets échouée' );
      await this.waitForPageLoad();
      return true;
    } catch (error) {
      console.error('Erreur lors de la navigation vers la page des projets:', error.message);
      throw error;
    }
  }

  async clickEditFirstProject() {
    try {
      await this.driver.wait(until.elementLocated(By.css('.bg-white-A700')), 10000);
      try {
        await this.driver.wait(until.elementLocated(By.css('tbody tr')),20000 );
      } catch (timeoutErr) {
        return false;
      }
      const actionContainersXPath = "//tbody/tr[1]/td[last()]//div[@class='relative group']";
      const actionContainers = await this.driver.findElements(By.xpath(actionContainersXPath));
      if (actionContainers.length >= 2) {
        const editContainer = actionContainers[1];
        const actions = this.driver.actions({async: true});
        await actions.move({origin: editContainer}).perform();
        await this.driver.sleep(1000);
        const modifierTextXPath = "//div[contains(@class, 'text-center') and text()='Modifier']";
        try {
          const modifierElement = await this.driver.wait(until.elementLocated(By.xpath(modifierTextXPath)),3000);
          await this.driver.executeScript("arguments[0].click();", modifierElement);
          return true;
        } catch (timeoutErr) {
          try {
            const altModifierXPath = "//div[contains(text(), 'Modifier')]";
            const altModifierElement = await this.driver.findElement(By.xpath(altModifierXPath));
            await this.driver.executeScript("arguments[0].click();", altModifierElement);
            await this.driver.wait(until.elementLocated(By.name('name')), 8000);
            return true;
          } catch (err) {
            await this.driver.executeScript("arguments[0].click();", editContainer);
            try {
              await this.driver.wait(until.elementLocated(By.name('name')), 8000);
              return true;
            } catch (timeoutErr) {
              return false;
            }
          }
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async clickAddJalon() {
    try {
      const addJalonButton = await this.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Ajouter un nouveau Jalon')]/..")),10000,   'Bouton "Ajouter un nouveau Jalon" non trouvé' );
      await addJalonButton.click();
      await this.driver.wait(  until.elementLocated(By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]")),  10000,  'Modal d\'ajout de jalon non affiché'    );
      
      return true;
    } catch (error) {
      console.error('Erreur lors du clic sur Ajouter un nouveau Jalon:', error.message);
      return false;
    }
  }
  async fillJalonForm(name, dueDate, description = '') {
    try {
      const nameInput = await this.driver.findElement(By.name('name'));
      await nameInput.clear();
      await nameInput.sendKeys(name);
      const dateInput = await this.driver.findElement(By.css('input[placeholder="Date d\'échéance"]'));
      await dateInput.click();
      const [day, month, year] = dueDate.split('/');
  
      try {
        const dayElement = await this.driver.findElement(
          By.xpath(`//abbr[contains(@aria-label, '${day} avril 2025')]`)
        );
        await this.driver.executeScript('arguments[0].click();', dayElement);
        await this.driver.sleep(500);
      } catch (clickError) {
        await this.driver.executeScript(`
          const input = arguments[0];
          input.value = '${dueDate}';
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        `, dateInput);
        console.log('Date insérée via JavaScript');
      }
      
      try {
        const descriptionLabel = await this.driver.findElement(
          By.xpath("//label[contains(text(), 'Description')]")
        );
        await this.driver.executeScript('arguments[0].click();', descriptionLabel);
        await this.driver.sleep(500);
      } catch (closeError) {
        try {
          const descriptionField = await this.driver.findElement(By.name('description'));
          await this.driver.executeScript('arguments[0].click();', descriptionField);
          await this.driver.sleep(500);
        } catch (e) {
          try {
            const formTitle = await this.driver.findElement(
              By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]")
            );
            await this.driver.executeScript('arguments[0].click();', formTitle);
            await this.driver.sleep(500);
          } catch (e2) {
            console.log('Tentatives de fermeture du calendrier échouées');
          }
        }
      }
      if (description) {
        try {
          const descriptionInput = await this.driver.findElement(By.name('description'));
          await descriptionInput.clear();
          await descriptionInput.sendKeys(description);
          console.log('Description remplie:', description);
        } catch (descError) {
          console.log('Erreur lors de la saisie de la description:', descError.message);
        }
      }
  
      return true;
    } catch (error) {
      console.error('Erreur détaillée lors du remplissage du formulaire de jalon:', error);
      return false;
    }
  }
  async submitJalonForm() {
    try {
      try {
        const formTitle = await this.driver.findElement( By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]") );
        await this.driver.executeScript('arguments[0].click();', formTitle);
        await this.driver.sleep(500);
      } catch (e) {
        try {
          const nameInput = await this.driver.findElement(By.name('name'));
          await this.driver.executeScript('arguments[0].click();', nameInput);
          await this.driver.sleep(500);
        } catch (e2) {
          console.log('Impossible de cliquer ailleurs pour fermer le calendrier');
        }
      }
      const submitButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Ajouter une étape clé')]") );
      const isClickable = await this.driver.executeScript(`
        const rect = arguments[0].getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        return arguments[0].contains(elementAtPoint) || arguments[0] === elementAtPoint;
      `, submitButton);
      
      if (!isClickable) {
        console.log('Le bouton n\'est pas cliquable, tentative de fermeture du calendrier');
        await this.driver.executeScript(`
          // Cacher tous les éléments qui pourraient être un calendrier
          const calendars = document.querySelectorAll('.calendar, [role="dialog"], [aria-label*="2025"]');
          if (calendars) {
            calendars.forEach(cal => {
              cal.style.display = 'none';
            });
          }
        `);
        await this.driver.sleep(500);
      }
      await this.driver.executeScript('arguments[0].click();', submitButton);
      await this.driver.wait(until.stalenessOf(submitButton), 10000, 'Le formulaire n\'a pas été soumis correctement');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de jalon:', error.message);
      return false;
    }
  }
  async cancelJalonForm() {
    try {
      const cancelButton = await this.driver.findElement(By.xpath("//button[text()='Annuler']"));
      await cancelButton.click();
      
      await this.driver.wait(until.stalenessOf(cancelButton),10000,'Le formulaire n\'a pas été fermé correctement');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du formulaire de jalon:', error.message);
      return false;
    }
  }

  
}

module.exports = ProjectsDetailsPage;
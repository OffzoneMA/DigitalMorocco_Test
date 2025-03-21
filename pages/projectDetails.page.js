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

  async clickAddMilestoneButton() {
    try {
      const addButton = await this.driver.wait( until.elementLocated(By.xpath("//button//span[contains(text(), 'Ajouter un nouveau Jalon')]")), 10000,'Bouton d\'ajout de jalon non trouvé' );
      await addButton.click();
      await this.driver.wait( until.elementLocated(By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]")), 10000, 'Modale d\'ajout de jalon non affichée'  );
       return true;
    } catch (error) {
      console.error('Erreur lors du clic sur le bouton d\'ajout de jalon:', error.message);
      throw error;
    }
  }

  async fillMilestoneForm(milestoneName, dueDate, description = '') {
    try {
      const nameInput = await this.driver.findElement(By.name('name'));
      await nameInput.sendKeys(milestoneName);
      const dateInput = await this.driver.findElement(By.xpath("//input[@name='due-date']"));
      await dateInput.click();
      await this.driver.sleep(500);
      await dateInput.sendKeys(dueDate);
      await dateInput.sendKeys(Key.ESCAPE); 
      if (description) {
        const descriptionInput = await this.driver.findElement(By.name('description'));
        await descriptionInput.sendKeys(description);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors du remplissage du formulaire de jalon:', error.message);
      throw error;
    }
  }

  async submitMilestoneForm() {
    try {
      const submitButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Ajouter une étape clé')]")  );
      await submitButton.click();
      await this.driver.wait(
        until.stalenessOf(await this.driver.findElement(  By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]")  ) ),  10000,   'La modale ne s\'est pas fermée après soumission'   );
      
      await this.driver.sleep(1000);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de jalon:', error.message);
      throw error;
    }
  }

  async cancelMilestoneForm() {
    try {
      const cancelButton = await this.driver.findElement(  By.xpath("//button[contains(text(), 'Annuler')]"));
      await cancelButton.click();
      await this.driver.wait(until.stalenessOf(  await this.driver.findElement(    By.xpath("//label[contains(text(), 'Ajouter une nouvelle étape clé')]")  )  ),  10000,  'La modale ne s\'est pas fermée après annulation'  );
       return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du formulaire de jalon:', error.message);
      throw error;
    }
  }

  async isMilestoneVisible(milestoneName) {
    try {
      const milestone = await this.driver.wait( until.elementLocated(By.xpath(`//td//div[contains(text(), '${milestoneName}')]`)), 10000,  `Jalon "${milestoneName}" non trouvé dans le tableau` );
      
      return milestone !== null;
    } catch (error) {
      console.error(`Erreur lors de la vérification de la visibilité du jalon "${milestoneName}":`, error.message);
      return false;
    }
  }


}

module.exports = ProjectsDetailsPage;





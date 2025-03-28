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




}
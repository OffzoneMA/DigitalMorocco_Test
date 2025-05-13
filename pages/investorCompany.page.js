const { By, until } = require('selenium-webdriver');

class InvestorCompanyPage {
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
   async navigateToCompany() {
        try {
            const companyMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Entreprise')]]")), 10000,   'Menu "Entreprise" non trouvé' );
            await companyMenuTrigger.click();
            await this.driver.sleep(500);
            const companyProfileLink = await this.driver.wait(until.elementLocated(By.xpath("//li//span[contains(text(), concat('Profil de ', \"l'\", 'entreprise'))]")), 10000,  'Lien "Profil de l\'entreprise" non trouvé' );
            await companyProfileLink.click();
            await this.driver.wait(until.urlContains('MyCompany'), 10000, 'Navigation vers la page des entreprises échouée'  );
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des entreprises:', error);
            throw error;
        }
    }

  async fillCompanyForm(companyData) {
        try {
            const nameField = await this.driver.wait( until.elementLocated(By.css("input[name='companyName']")),10000, 'Champ "Nom d\'entreprise" non trouvé'    );
            await nameField.clear();
            await nameField.sendKeys(companyData.name);
    
            const legalNameField = await this.driver.wait( until.elementLocated(By.css("input[name='legalName']")), 10000, 'Champ "legal name" non trouvé' );
            await legalNameField.clear();
            await legalNameField.sendKeys(companyData.legalName);
    
            const detailsField = await this.driver.wait( until.elementLocated(By.css("textarea[name='description']")), 10000, 'Champ "description" non trouvé' );
            await detailsField.clear();
            await detailsField.sendKeys(companyData.details);
    
            if (companyData.website) {
                const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")),10000,'Champ "Site Web" non trouvé'   );
                await websiteField.clear();
                await websiteField.sendKeys(companyData.website);
            }
    
            const contactEmailField = await this.driver.wait( until.elementLocated(By.css("input[name='contactEmail']")), 10000, 'Champ "Email de contact" non trouvé' );
            await contactEmailField.clear();
            await contactEmailField.sendKeys(companyData.contactEmail);
    
            const addressField = await this.driver.wait(until.elementLocated(By.css("input[name='address']")),10000,'Champ "address" non trouvé'  );
            await addressField.clear();
            await addressField.sendKeys(companyData.address);
        
            if (companyData.companyLocation) {
             await this.selectCompanyLocation(companyData.companyLocation);
              }
            
            if (companyData.sector) { 
             await this.selectCompanySectors(companyData.investmentSectors);
            }
    
            const taxIdentifierField = await this.driver.wait( until.elementLocated(By.css("input[name='taxIdentfier']")), 10000, 'Champ "tax Identifier" non trouvé'  );
            await taxIdentifierField.clear();
            await taxIdentifierField.sendKeys(companyData.funding);
                
            const corporateIdentifierField = await this.driver.wait(until.elementLocated(By.css("input[name='corporateIdentfier']")),10000,  'Champ "corporate Identifier" non trouvé'   );
            await corporateIdentifierField.clear();
            await corporateIdentifierField.sendKeys(companyData.totalRaised);
              
            return true;
        } catch (error) {
            console.error('Erreur lors du remplissage du formulaire:', error.message);
            throw error;
        }
    }

async selectCompanyLocation(location) {
    try {
      const locationSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez un pays'][readonly]")),10000,'Sélecteur de pays non trouvé');
      await locationSelector.click();
      await this.driver.sleep(1000);
      const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un pays']")),10000,'Champ de recherche pour le lieu non trouvé' );
      await searchField.clear();
      await searchField.sendKeys(location);
      await this.driver.sleep(1000);
      const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color')]//label[text()='${location}']`)),10000,`Option "${location}" non trouvée dans la liste` );
      await this.driver.executeScript("arguments[0].click();", option);
      await this.driver.sleep(1000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection du lieu de l\'entreprise:', error.message);
      throw error;
    }
  }

   async selectCompanySectors(sectors) {
    try {
      if (typeof sectors === 'string') {
        sectors = [sectors];
      }
      
      if (!Array.isArray(sectors) || sectors.length === 0) {
        console.warn('Aucun secteur d\'investissement fourni ou format incorrect');
        return true;
      }
      
      for (const sector of sectors) {
        const sectorSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez le secteur d\\'activité de votre entreprise'][readonly]")),10000,'Sélecteur de secteurs d\'investissement non trouvé');
        await this.driver.executeScript("arguments[0].click();", sectorSelector);
        await this.driver.sleep(1500);
        try {
          const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un secteur']")),10000, 'Champ de recherche pour les secteurs non trouvé');
          await searchField.clear();
          for (const char of sector) {
            await searchField.sendKeys(char);
            await this.driver.sleep(50);
          }
          await this.driver.sleep(1500);
          try {
            const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color') or contains(@class, 'w-full')]//label[contains(text(), '${sector}')]`)),8000,`Option "${sector}" non trouvée dans la liste` );
            await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", option);
            await this.driver.sleep(500);
            await this.driver.executeScript("arguments[0].click();", option);
            await this.driver.sleep(1000);
          } catch (optionError) {
            console.warn(`Option "${sector}" non trouvée après recherche: ${optionError.message}`);
            await this.driver.findElement(By.tagName('body')).click();
            await this.driver.sleep(500);
            continue;
          }
        } catch (searchError) {
          console.error('Erreur lors de la recherche de secteur:', searchError.message);
          await this.driver.findElement(By.tagName('body')).click();
          await this.driver.sleep(500);
          continue;
        }
      }
      
      await this.driver.findElement(By.tagName('body')).click();
      await this.driver.sleep(1000);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection des secteurs d\'entreprise:', error.message);
      throw error;
    }
  }

  async submitCompanyForm() {
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

}

module.exports = InvestorCompanyPage;
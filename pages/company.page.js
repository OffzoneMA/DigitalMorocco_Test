const {By ,until} =require("selenium-webdriver");

class CompanyPage{
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
        
            if (companyData.country) { 
                await this.selectDropdownValue('Sélectionnez un pays'); 
            }
            
            if (companyData.sector) { 
                await this.selectDropdownValue('Sélectionnez le secteur d\'activité de votre entreprise');
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

    async selectDropdownValue(placeholder, value) {    
        try {
            const dropdownContainer = await this.driver.wait(until.elementLocated(By.xpath(`//div[.//input[@placeholder="${placeholder}"]]`)),10000,   `Conteneur du dropdown "${placeholder}" non trouvé` );
            await this.driver.executeScript("arguments[0].click();", dropdownContainer);
            await this.driver.sleep(2000);
            const optionsLocator = By.xpath(`//div[contains(@class, "flex") and contains(@class, "text-left")]`);
            const options = await this.driver.findElements(optionsLocator);
            
            console.log(`Nombre d'options trouvées : ${options.length}`);
            if (value) {
                for (const option of options) {
                    const optionText = await option.getText();
                    if (optionText.includes(value)) {
                        await this.driver.executeScript("arguments[0].scrollIntoView(true);", option);
                        await this.driver.sleep(500);
                        await option.click();
                        return true;
                    }
                }
                throw new Error(`Aucune option trouvée pour "${value}"`);
            } else {
                if (options.length > 0) {
                    await this.driver.executeScript("arguments[0].scrollIntoView(true);", options[0]);
                    await this.driver.sleep(500);
                    await options[0].click();
                    return true;
                }
            }
    
            return false;
        } catch (error) {
            console.error(`Erreur lors de la sélection dans le dropdown "${placeholder}":`, error.message);
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

module.exports = CompanyPage;



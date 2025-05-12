const { By, until } = require('selenium-webdriver');

class InvestorPage {
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

  async navigateToInvestor() {
    try {
      const InvestorMenu = await this.driver.wait(
        until.elementLocated(By.xpath("//span[contains(text(), \"Profil d'Investisseur\")]")),
        10000,
        'Menu "Profil d\'Investisseur" non trouvé'
      );
      await InvestorMenu.click();
      await this.driver.wait(
        until.urlContains('InvestorProfile'),
        10000,
        'Navigation vers la page du profil d\'investisseur a échoué'
      );
      await this.waitForPageLoad();
      return true;
    } catch (error) {
      console.error('Erreur lors de la navigation vers la page profil d\'investisseur', error.message);
      throw error;
    }
  }

  async fillInvestorForm(InvestorData) {
    try {
      const companyField = await this.driver.wait( until.elementLocated(By.css("input[name='companyName']")),10000, 'Champ "Nom du company" non trouvé'  );
      await companyField.clear();
      await companyField.sendKeys(InvestorData.name);
      const legalField = await this.driver.wait( until.elementLocated(By.css("input[name='legalName']")), 10000, 'Champ "nom légal" non trouvé' );
      await legalField.clear();
      await legalField.sendKeys(InvestorData.legal);


      if (InvestorData.companyType) {
        await this.selectCompanyType(InvestorData.companyType);
      }

      const descriptionField = await this.driver.wait( until.elementLocated(By.css("textarea[name='description']")), 10000, 'Champ "description" non trouvé' );
      await descriptionField.clear();
      await descriptionField.sendKeys(InvestorData.description);

      if (InvestorData.website) {
        const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")),10000,'Champ "Site Web" non trouvé' );
        await websiteField.clear();
        await websiteField.sendKeys(InvestorData.website);
      }
     
      if (InvestorData.companyLocation) {
        await this.selectCompanyLocation(InvestorData.companyLocation);
      }
      if (InvestorData.target) {
        await this.selectDropdownValue('Sélectionnez les phases d\'investissement', InvestorData.target);
      }

      if (InvestorData.investmentSectors && InvestorData.investmentSectors.length > 0) {
        await this.selectInvestmentSectors(InvestorData.investmentSectors);
      }
      const contactEmailField = await this.driver.wait(until.elementLocated(By.css("input[name='contactEmail']")),10000,'Champ "Email de contact" non trouvé' );
      await contactEmailField.clear();
      await contactEmailField.sendKeys(InvestorData.contactEmail);

      const phoneField = await this.driver.wait(until.elementLocated(By.css("input[name='phoneNumber']")),10000,'Champ "phone number" non trouvé' );
      await phoneField.clear();
      await phoneField.sendKeys(InvestorData.phone);
  
      const investmentCapacityField = await this.driver.wait( until.elementLocated(By.css("input[name='investmentCapacity']")), 10000, 'Champ "Capacité d\'investissement" non trouvé'  );
      await investmentCapacityField.clear();
      await investmentCapacityField.sendKeys(InvestorData.investmentCapacity);

      const numberOfExitsField = await this.driver.wait( until.elementLocated(By.css("input[name='numberOfExits']")), 10000, 'Champ "Capacité d\'investissement" non trouvé'  );
      await numberOfExitsField.clear();
      await numberOfExitsField.sendKeys(InvestorData.numberOfExits);

      const fundField = await this.driver.wait( until.elementLocated(By.css("input[name='fund']")), 10000, 'Champ "fund" non trouvé'  );
      await fundField.clear();
      await fundField.sendKeys(InvestorData.fund);
         
      const acquisitionsField = await this.driver.wait(until.elementLocated(By.css("input[name='acquisitions']")),10000,'Champ "acquisitions" non trouvé' );
      await acquisitionsField.clear();
      await acquisitionsField.sendKeys(InvestorData.acquisitions);
      return true;
    } catch (error) {
      console.error('Erreur lors du remplissage du formulaire:', error.message);
      throw error;
    }
  }

  async selectCompanyType(companyType) {
  try {
    const companyTypeSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez le type d\\'entreprise'][readonly]")),10000,'Sélecteur de type d\'entreprise non trouvé' );
    await companyTypeSelector.click();
    await this.driver.sleep(1000);
    const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un type d\\'entreprise']")),10000,'Champ de recherche pour le type d\'entreprise non trouvé' );
    await searchField.clear();
    await searchField.sendKeys(companyType);
    await this.driver.sleep(1000);
    const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color')]//label[text()='${companyType}']`)),10000,`Option "${companyType}" non trouvée dans la liste`);
    await this.driver.executeScript("arguments[0].click();", option);
    await this.driver.sleep(1000);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sélection du type d\'entreprise:', error.message);
    throw error;
  }
}
 async selectCompanyLocation(location) {
  try {
    const locationSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez le lieu de l\\'entreprise'][readonly]")),10000,'Sélecteur de lieu d\'entreprise non trouvé');
    await locationSelector.click();
    await this.driver.sleep(1000);
    const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un lieu']")),10000,'Champ de recherche pour le lieu non trouvé' );
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

async selectInvestmentSectors(sectors) {
  try {
    for (const sector of sectors) {
      const sectorSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez les secteurs d\\'investissement préférés'][readonly]")),10000,'Sélecteur de secteurs d\'investissement non trouvé' );
      await sectorSelector.click();
      await this.driver.sleep(1000);
      const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher des secteurs d\\'investissement']")),10000,'Champ de recherche pour les secteurs non trouvé' );
      await searchField.clear();
      await searchField.sendKeys(sector);
      await this.driver.sleep(1000);
      try {
        const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color')]//label[text()='${sector}']`)),5000,`Option "${sector}" non trouvée dans la liste`);
        await this.driver.executeScript("arguments[0].click();", option);
        await this.driver.sleep(1000);
      } catch (sectorError) {
        await this.driver.findElement(By.tagName('body')).click();
        await this.driver.sleep(500);
        continue;
      }
    }
    await this.driver.findElement(By.tagName('body')).click();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sélection des secteurs d\'investissement:', error.message);
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

  async submitInvestorForm() {
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

module.exports = InvestorPage;
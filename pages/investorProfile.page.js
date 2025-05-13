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
      const InvestorMenu = await this.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), \"Profil d'Investisseur\")]")),10000,'Menu "Profil d\'Investisseur" non trouvé');
      await InvestorMenu.click();
      await this.driver.wait(until.urlContains('InvestorProfile'),10000,'Navigation vers la page du profil d\'investisseur a échoué');
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
        await this.selectInvestmentPhases(InvestorData.target);
      }

      if (InvestorData.investmentSectors) {
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

  async selectInvestmentPhases(phases) {
    try {
      if (typeof phases === 'string') {
        phases = [phases];
      }
      if (!Array.isArray(phases) && typeof phases !== 'string') {
        console.warn('Aucune phase d\'investissement fournie ou format incorrect');
        return true;
      }
      const phaseSelector = await this.driver.wait(until.elementLocated(By.css("input[name='target'][placeholder='Sélectionnez les phases d\\'investissement'][readonly]")),10000,'Sélecteur de phases d\'investissement non trouvé');
      await this.driver.executeScript("arguments[0].click();", phaseSelector);
      await this.driver.sleep(2000);
      for (const phase of Array.isArray(phases) ? phases : [phases]) {
        try {
          const xpath = `//div[contains(@class, 'flex')]//label[contains(text(), '${phase}')]`;
          const option = await this.driver.wait(until.elementLocated(By.xpath(xpath)),5000,`Option "${phase}" non trouvée dans la liste`);
          await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", option);
          await this.driver.sleep(1000);
          const parent = await option.findElement(By.xpath("./ancestor::div[contains(@class, 'flex') and contains(@class, 'items-center')][1]"));
          const checkbox = await parent.findElement(By.css("input[type='checkbox']"));
          await this.driver.executeScript("arguments[0].click();", checkbox);
          await this.driver.sleep(1000);
        } catch (phaseError) {
          console.warn(`Phase d'investissement "${phase}" non trouvée:`, phaseError.message);
        }
      }
      await this.driver.findElement(By.tagName('body')).click();
      await this.driver.sleep(1000);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection des phases d\'investissement:', error.message);
      throw error;
    }
  }

  async selectInvestmentSectors(sectors) {
    try {
      if (typeof sectors === 'string') {
        sectors = [sectors];
      }
      
      if (!Array.isArray(sectors) || sectors.length === 0) {
        console.warn('Aucun secteur d\'investissement fourni ou format incorrect');
        return true;
      }
      
      for (const sector of sectors) {
        const sectorSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez les secteurs d\\'investissement préférés'][readonly]")),10000,'Sélecteur de secteurs d\'investissement non trouvé');
        await this.driver.executeScript("arguments[0].click();", sectorSelector);
        await this.driver.sleep(1500);
        try {
          const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher des secteurs d\\'investissement']")),10000, 'Champ de recherche pour les secteurs non trouvé');
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
      console.error('Erreur lors de la sélection des secteurs d\'investissement:', error.message);
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

async clearCompanyTypeAndLocation() {
  try {
    const companyTypeInputs = await this.driver.findElements(By.xpath("//input[@placeholder=\"Sélectionnez le type d'entreprise\"]"));
    if (companyTypeInputs.length > 0) {
      const parentElement = await companyTypeInputs[0].findElement(By.xpath("./.."));
      try {
        const deleteButton = await parentElement.findElement(By.css(".btn_delete_selected") );
        await this.driver.executeScript("arguments[0].click();", deleteButton);
        await this.driver.sleep(1000);
      } catch (btnError) {
        console.warn("Bouton de suppression pour le type d'entreprise non trouvé ou déjà vide");
      }
    }
    
    const locationInputs = await this.driver.findElements(By.xpath("//input[@placeholder=\"Sélectionnez le lieu de l'entreprise\"]") );
    
    if (locationInputs.length > 0) {
      const parentElement = await locationInputs[0].findElement(By.xpath("./.."));
      
      try {
        const deleteButton = await parentElement.findElement(By.css(".btn_delete_selected"));
        await this.driver.executeScript("arguments[0].click();", deleteButton);
        await this.driver.sleep(1000);
      } catch (btnError) {
        console.warn("Bouton de suppression pour le lieu de l'entreprise non trouvé ou déjà vide");
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des champs Type et Location:', error.message);
    return false;
  }
}
async clearInvestmentPhases() {
  try {
    const phaseSelector = await this.driver.findElement(By.css("input[name='target'][placeholder='Sélectionnez les phases d\\'investissement'][readonly]"));
    const value = await phaseSelector.getAttribute("value");
    if (value && value.trim() !== "") {
      await this.driver.executeScript("arguments[0].click();", phaseSelector);
      await this.driver.sleep(2000);
      const checkedItems = await this.driver.findElements(By.xpath("//div[contains(@class, 'flex items-center')]//label[contains(@class, 'cursorpointer-green')]/input[@checked]"));
      for (const checkbox of checkedItems) {
        try {
          const parentLabel = await checkbox.findElement(By.xpath("./.."));
          await this.driver.executeScript("arguments[0].click();", parentLabel);
          await this.driver.sleep(800); 
        } catch (checkboxError) {
          console.warn("Erreur lors du décochage d'une phase:", checkboxError.message);
          try {
            await this.driver.executeScript("arguments[0].click();", checkbox);
            await this.driver.sleep(800);
          } catch (directClickError) {
            console.warn("Échec également avec clic direct:", directClickError.message);
          }
        }
      }
      await this.driver.findElement(By.tagName('body')).click();
      await this.driver.sleep(1000);
    } else {
      console.log("Aucune phase d'investissement n'est sélectionnée, pas besoin de nettoyer");
    }
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des phases d\'investissement:', error.message);
    return false;
  }
}

async clearInvestmentSectors() {
  try {
    const sectorSelector = await this.driver.findElement(By.css("input[placeholder='Sélectionnez les secteurs d\\'investissement préférés'][readonly]"));
    const value = await sectorSelector.getAttribute("value");
    if (value && value.trim() !== "") {
      await this.driver.executeScript("arguments[0].click();", sectorSelector);
      await this.driver.sleep(2000);
      const checkedItems = await this.driver.findElements(By.xpath("//div[contains(@class, 'flex items-center')]//label[contains(@class, 'cursorpointer-green')]/input[@checked]"));
      console.log(`Trouvé ${checkedItems.length} secteurs d'investissement sélectionnés à décocher`);
      for (const checkbox of checkedItems) {
        try {
          const parentLabel = await checkbox.findElement(By.xpath("./.."));
          await this.driver.executeScript("arguments[0].click();", parentLabel);
          await this.driver.sleep(800);
        } catch (checkboxError) {
          console.warn("Erreur lors du décochage d'un secteur:", checkboxError.message);
          try {
            await this.driver.executeScript("arguments[0].click();", checkbox);
            await this.driver.sleep(800);
          } catch (directClickError) {
            console.warn("Échec également avec clic direct:", directClickError.message);
          }
        }
      }
      await this.driver.sleep(1000);
    } else {
      console.log("Aucun secteur d'investissement n'est sélectionné, pas besoin de nettoyer");
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des secteurs d\'investissement:', error.message);
    return false;
  }
}
async clearAllFields() {
  try {
    const textFields = [
      "input[name='companyName']",
      "input[name='legalName']",
      "textarea[name='description']",
      "input[name='website']",
      "input[name='contactEmail']",
      "input[name='phoneNumber']",
    ];
    
    for (const selector of textFields) {
      try {
        const fields = await this.driver.findElements(By.css(selector));
        if (fields.length > 0) {
          await fields[0].clear();
          await this.driver.sleep(300);
        }
      } catch (fieldError) {
        console.warn(`Champ ${selector} non trouvé ou impossible à effacer:`, fieldError.message);
      }
    }
    
    try {
      await this.clearCompanyTypeAndLocation();
    } catch (error) {
      console.warn("Impossible de nettoyer les champs Type et Location:", error.message);
    }
    
    try {
      await this.clearInvestmentPhases();
    } catch (error) {
      console.warn("Impossible de nettoyer les phases d'investissement:", error.message);
    }
    
    try {
      await this.clearInvestmentSectors();
    } catch (error) {
      console.warn("Impossible de nettoyer les secteurs d'investissement:", error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage de tous les champs:', error.message);
    throw error;
  }
}

async testRequiredField(fieldName, fieldSelector) {
  try {
    await this.submitInvestorForm();
    await this.driver.sleep(2000);
    const field = await this.driver.findElement(By.css(fieldSelector));
    const classes = await field.getAttribute('class');
    const isRequired = classes && classes.includes('shadow-inputBsError');
    console.log(`Champ ${fieldName}: ${isRequired ? 'obligatoire' : 'optionnel'}`);
    return isRequired;
  } catch (error) {
    console.error(`Erreur lors du test du champ obligatoire ${fieldName}:`, error.message);
    throw error;
  }
}
async updateInvestorField(fieldName, newValue) {
  try {    
    switch(fieldName) {
      case 'companyName':
        const companyField = await this.driver.wait(until.elementLocated(By.css("input[name='companyName']")),10000, 'Champ "Nom du company" non trouvé' );
        await companyField.clear();
        await companyField.sendKeys(newValue);
        break;
        
      case 'legalName':
        const legalField = await this.driver.wait(until.elementLocated(By.css("input[name='legalName']")),10000, 'Champ "nom légal" non trouvé' );
        await legalField.clear();
        await legalField.sendKeys(newValue);
        break;
        
      case 'description':
        const descriptionField = await this.driver.wait(until.elementLocated(By.css("textarea[name='description']")),10000, 'Champ "description" non trouvé');
        await descriptionField.clear();
        await descriptionField.sendKeys(newValue);
        break;
        
      case 'website':
        const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")),10000,'Champ "Site Web" non trouvé' );
        await websiteField.clear();
        await websiteField.sendKeys(newValue);
        break;
        
      default:
        throw new Error(`Champ "${fieldName}" non pris en charge pour la mise à jour`);
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du champ ${fieldName}:`, error.message);
    throw error;
  }
}

async updateMultipleFields(fieldsToUpdate) {
  try {
    for (const [fieldName, newValue] of Object.entries(fieldsToUpdate)) {
      if (newValue !== undefined && newValue !== null) {
        await this.updateInvestorField(fieldName, newValue);
      }
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de plusieurs champs:', error.message);
    throw error;
  }
}

async verifyFieldValues(expectedValues) {
  try {
    for (const [fieldName, expectedValue] of Object.entries(expectedValues)) {
      if (expectedValue === undefined || expectedValue === null) continue;
      
      let actualValue;
      
      switch(fieldName) {
        case 'companyName':
          const companyField = await this.driver.wait(until.elementLocated(By.css("input[name='companyName']")),10000);
          actualValue = await companyField.getAttribute('value');
          break;
          
        case 'legalName':
          const legalField = await this.driver.wait(until.elementLocated(By.css("input[name='legalName']")),10000 );
          actualValue = await legalField.getAttribute('value');
          break;
          
        case 'description':
          const descriptionField = await this.driver.wait(until.elementLocated(By.css("textarea[name='description']")),10000);
          actualValue = await descriptionField.getAttribute('value');
          break;
          
        case 'website':
          const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")),10000);
          actualValue = await websiteField.getAttribute('value');
          break;
        default:
          console.warn(`La vérification du champ "${fieldName}" n'est pas prise en charge`);
          continue;
      }
      
      if (actualValue !== expectedValue) {
        throw new Error(`La valeur du champ ${fieldName} est "${actualValue}" au lieu de "${expectedValue}"`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des valeurs des champs:', error.message);
    throw error;
  }
}







}

module.exports = InvestorPage;
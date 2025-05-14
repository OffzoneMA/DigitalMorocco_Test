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
        const companyMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Entreprise')]]")), 10000, 'Menu "Entreprise" non trouvé');
        await companyMenuTrigger.click();
        await this.driver.sleep(500);
        const companyProfileLink = await this.driver.wait(until.elementLocated(By.xpath("//li//span[contains(text(), concat('Profil de ', \"l'\", 'entreprise'))]")), 10000, 'Lien "Profil de l\'entreprise" non trouvé');
        await companyProfileLink.click();
        await this.driver.wait(until.urlContains('MyCompany'), 10000, 'Navigation vers la page des entreprises échouée');
        await this.waitForPageLoad();
        return true;
    } catch (error) {
        console.error('Erreur lors de la navigation vers la page des entreprises:', error);
        throw error;
    }
  }

  async fillCompanyForm(companyData) {
    try {
        const nameField = await this.driver.wait(until.elementLocated(By.css("input[name='companyName']")), 10000, 'Champ "Nom d\'entreprise" non trouvé');
        await nameField.clear();
        await nameField.sendKeys(companyData.name);

        const legalNameField = await this.driver.wait(until.elementLocated(By.css("input[name='legalName']")), 10000, 'Champ "legal name" non trouvé');
        await legalNameField.clear();
        await legalNameField.sendKeys(companyData.legalName);

        const detailsField = await this.driver.wait(until.elementLocated(By.css("textarea[name='description']")), 10000, 'Champ "description" non trouvé');
        await detailsField.clear();
        await detailsField.sendKeys(companyData.details);

        if (companyData.website) {
            const websiteField = await this.driver.wait(until.elementLocated(By.css("input[name='website']")), 10000, 'Champ "Site Web" non trouvé');
            await websiteField.clear();
            await websiteField.sendKeys(companyData.website);
        }

        const contactEmailField = await this.driver.wait(until.elementLocated(By.css("input[name='contactEmail']")), 10000, 'Champ "Email de contact" non trouvé');
        await contactEmailField.clear();
        await contactEmailField.sendKeys(companyData.contactEmail);

        const addressField = await this.driver.wait(until.elementLocated(By.css("input[name='address']")), 10000, 'Champ "address" non trouvé');
        await addressField.clear();
        await addressField.sendKeys(companyData.address);
    
        if (companyData.companyLocation) {
          await this.selectCompanyLocation(companyData.companyLocation);
        }
        
        if (companyData.sector) { 
          await this.selectCompanySectors(companyData.sector);
        }

        const taxIdentifierField = await this.driver.wait(until.elementLocated(By.css("input[name='taxIdentfier']")), 10000, 'Champ "tax Identifier" non trouvé');
        await taxIdentifierField.clear();
        await taxIdentifierField.sendKeys(companyData.funding);
            
        const corporateIdentifierField = await this.driver.wait(until.elementLocated(By.css("input[name='corporateIdentfier']")), 10000, 'Champ "corporate Identifier" non trouvé');
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
      const locationSelector = await this.driver.wait(until.elementLocated(By.css("input[placeholder='Sélectionnez un pays'][readonly]")), 10000, 'Sélecteur de pays non trouvé');
      await locationSelector.click();
      await this.driver.sleep(1000);
      const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un pays']")), 10000, 'Champ de recherche pour le lieu non trouvé');
      await searchField.clear();
      await searchField.sendKeys(location);
      await this.driver.sleep(1000);
      const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color')]//label[text()='${location}']`)), 10000, `Option "${location}" non trouvée dans la liste`);
      await this.driver.executeScript("arguments[0].click();", option);
      await this.driver.sleep(1000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection du lieu de l\'entreprise:', error.message);
      throw error;
    }
  }
  async selectCompanySectors(sector) {
    try {
      const sectorSelector = await this.driver.wait(until.elementLocated(By.css("input[name='target'][placeholder*='Sélectionnez le secteur d\\'activité'][readonly]")), 10000, 'Sélecteur de secteur d\'activité non trouvé');
      await this.driver.executeScript("arguments[0].click();", sectorSelector);
      await this.driver.sleep(1500);
      const searchField = await this.driver.wait(until.elementLocated(By.css("input[name='search'][placeholder='Rechercher un secteur']") ), 10000, 'Champ de recherche pour les secteurs non trouvé');
      await searchField.clear();
      for (const char of sector) {
        await searchField.sendKeys(char);
        await this.driver.sleep(50); 
      }
      await this.driver.sleep(1500);
      try {
        const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'hover-select-color')]//label[contains(text(), '${sector}')]`)), 8000, `Option "${sector}" non trouvée dans la liste`);
        await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", option);
        await this.driver.sleep(500);
        await this.driver.executeScript("arguments[0].click();", option);
        await this.driver.sleep(1000);
      } catch (optionError) {
        console.warn(`Option "${sector}" non trouvée après recherche: ${optionError.message}`);
        await this.driver.findElement(By.tagName('body')).click();
        await this.driver.sleep(500);
        throw new Error(`Option "${sector}" non trouvée dans la liste déroulante`);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sélection du secteur d\'entreprise:', error.message);
      throw error;
    }
  }

  async submitCompanyForm() {
    try {
      const submitButton = await this.driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(normalize-space(), 'Enregistrer')]")), 10000, 'Bouton "Enregistrer" non trouvé');
      await submitButton.click();
      await this.driver.sleep(2000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error.message);
      throw error;
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
    ];
    
    for (const selector of textFields) {
      try {
        const field = await this.driver.wait(until.elementLocated(By.css(selector)), 5000);
        await field.clear();
        await this.driver.sleep(200);
      } catch (e) {
        console.warn(`Champ non trouvé ou non effaçable: ${selector}`);
      }
    }
    try {
      const locationField = await this.driver.findElement(By.css("input[placeholder='Sélectionnez un pays'][readonly]"));
      const value = await locationField.getAttribute('value');
      if (value && value.trim().length > 0) {
        const deleteButton = await this.driver.findElement(By.xpath("//input[@placeholder='Sélectionnez un pays']/..//button[contains(@class, 'btn_delete_selected')]"));
        await this.driver.executeScript("arguments[0].click();", deleteButton);
        await this.driver.sleep(500);
      }
    } catch (e) {
      console.warn("Champ pays non trouvé ou déjà vide:", e.message);
    }
    try {
      const selectorPath = "input[name='target'][placeholder*='Sélectionnez le secteur d\\'activité'][readonly]";
      const sectorField = await this.driver.findElement(By.css(selectorPath));
      const value = await sectorField.getAttribute('value');
      if (value && value.trim().length > 0) {
        const deleteButtonXPath = "//input[@name='target'][contains(@placeholder, 'Sélectionnez le secteur')]/..//button[contains(@class, 'btn_delete_selected')]";
        const deleteButton = await this.driver.wait(until.elementLocated(By.xpath(deleteButtonXPath)), 5000, "Bouton de suppression du secteur non trouvé");
        await this.driver.executeScript("arguments[0].click();", deleteButton);
        await this.driver.sleep(1000);
        const newValue = await sectorField.getAttribute('value');
        if (newValue && newValue.trim().length > 0) {
          console.warn("Le champ secteur n'a pas été correctement effacé après tentative");
          await this.driver.findElement(By.tagName('body')).click();
          await this.driver.sleep(500);
          await this.driver.executeScript("arguments[0].click();", deleteButton);
          await this.driver.sleep(500);
        }
      }
    } catch (e) {
      console.warn("Champ secteur non trouvé ou déjà vide:", e.message);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'effacement des champs:", error.message);
    throw error;
  }
}
  async checkRequiredFieldErrors() {
    try {
      const requiredFields = [
        { name: "Nom de l'entreprise", selector: "input[name='companyName']" },
        { name: "Dénomination sociale", selector: "input[name='legalName']" },
        { name: "Description de l'entreprise", selector: "textarea[name='description']" },
        { name: "Email de contact", selector: "input[name='contactEmail']" },
        { name: "Pays", selector: "input[placeholder='Sélectionnez un pays'][readonly]" },
        { name: "Secteur d'activité", selector: "input[name='target'][placeholder*='Sélectionnez le secteur d\\'activité'][readonly]" }
      ];
      
      const errorResults = [];
      for (const field of requiredFields) {
        try {
          const element = await this.driver.findElement(By.css(field.selector));
          const hasError = await this.driver.executeScript(`
            const el = arguments[0];
            const parent = el.parentElement;
            const grandparent = parent.parentElement;
            const hasErrorClass = el.classList.contains('shadow-inputBsError') || 
                                 parent.classList.contains('shadow-inputBsError') ||
                                 grandparent.classList.contains('shadow-inputBsError');
            
            const computedStyle = window.getComputedStyle(el);
            const parentStyle = window.getComputedStyle(parent);
            const grandparentStyle = window.getComputedStyle(grandparent);
            
            const hasBorderError = computedStyle.boxShadow.includes('rgba(232, 85, 85, 0.13)') || 
                                   parentStyle.boxShadow.includes('rgba(232, 85, 85, 0.13)') ||
                                   grandparentStyle.boxShadow.includes('rgba(232, 85, 85, 0.13)');
            
            return hasErrorClass || hasBorderError;
          `, element);
          
          errorResults.push({
            field: field.name,
            hasError: hasError
          });
          
        } catch (e) {
          console.warn(`Champ non trouvé pour vérification d'erreur: ${field.name}`);
          errorResults.push({
            field: field.name,
            hasError: false,
            error: "Champ non trouvé"
          });
        }
      }
      const allFieldsHaveErrors = errorResults.every(result => result.hasError);
      const fieldsWithoutErrors = errorResults.filter(result => !result.hasError).map(result => result.field);
      
      return {
        allFieldsHaveErrors,
        errorResults,
        fieldsWithoutErrors
      };
      
    } catch (error) {
      console.error("Erreur lors de la vérification des erreurs de validation:", error.message);
      throw error;
    }
  }

async uploadCompanyLogo(filePath) {
  try {
    const uploadLabel = await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Téléchargez le logo de votre entreprise')]")), 10000, "Label de téléchargement du logo non trouvé" );
    let fileInput;
    try {
      const labelForAttribute = await uploadLabel.getAttribute('for');
      if (labelForAttribute) {
        fileInput = await this.driver.findElement(By.id(labelForAttribute));
      } else {
        fileInput = await this.driver.findElement(By.css("input[type='file']"));
      }
    } catch (e) {
      await this.driver.executeScript(`
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.id = 'tempFileInput';
        tempInput.style.display = 'block';
        document.body.appendChild(tempInput);
      `);
      
      fileInput = await this.driver.findElement(By.id('tempFileInput'));
    }
    await this.driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible';", fileInput);
    await fileInput.sendKeys(filePath);
    await this.driver.sleep(2000); 
    try {
      await this.driver.wait(until.elementLocated(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview")), 10000, "Aperçu du logo non trouvé après téléchargement");
      console.log("Logo téléchargé avec succès");
      return true;
    } catch (previewError) {
      
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement du logo:", error.message);
    throw error;
  }
}

async changeCompanyLogo(filePath) {
  try {
    const optionsButton = await this.driver.wait(until.elementLocated(By.css('svg[width="14"][height="4"]')), 10000, "Menu d'options (trois points) non trouvé");
    await optionsButton.click();
    await this.driver.sleep(1000); 
    const changeOption = await this.driver.wait(until.elementLocated(By.xpath('//div[contains(@class, "flex-col") and contains(@class, "bg-white-A700")]//div[contains(text(), "Changer")]')),5000,"Option 'Changer' non trouvée dans le dropdown");
    await changeOption.click();
    await this.driver.sleep(1000); 
    let fileInput;
    try {
      fileInput = await this.driver.findElement(By.css("input[type='file']"));
    } catch (e) {
      console.warn("Input file non trouvé via méthode standard, utilisation d'approche alternative");
      await this.driver.executeScript(`
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.id = 'tempFileInput';
        tempInput.style.display = 'block';
        document.body.appendChild(tempInput);
      `);
      
      fileInput = await this.driver.findElement(By.id('tempFileInput'));
    }
    await this.driver.executeScript("arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible';", fileInput);
    await fileInput.sendKeys(filePath);
    await this.driver.sleep(2000); 
    try {
      await this.driver.wait(until.elementLocated(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview")), 10000,"Aperçu du logo non trouvé après changement");
      console.log("Logo changé avec succès");
      return true;
    } catch (previewError) {
     throw previewError;
    }
  } catch (error) {
    console.error("Erreur lors du changement du logo:", error.message);
    throw error;
  }
}

async removeCompanyLogoIfExists() {
  try {
    const logoExists = await this.driver.findElements(By.css(".company-logo-preview, img[alt*='logo'], .logo-preview"));
    if (logoExists.length > 0) {
      console.log("Logo existant détecté, tentative de suppression...");
      const optionsButton = await this.driver.wait(until.elementLocated(By.css('svg[width="14"][height="4"]')),  10000, "Menu d'options (trois points) non trouvé");
      await optionsButton.click();
      await this.driver.sleep(1000);
      const deleteOption = await this.driver.wait(until.elementLocated(By.xpath('//div[contains(@class, "flex-col") and contains(@class, "bg-white-A700")]//div[contains(text(), "Supprimer")]')),5000,"Option 'Supprimer' non trouvée dans le dropdown" );
      await deleteOption.click();
      await this.driver.sleep(1000);
      console.log("Logo supprimé avec succès");
      return true;
    } else {
      console.log("Aucun logo existant détecté");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification/suppression du logo:", error.message);
    return false;
  }
}


}

module.exports = InvestorCompanyPage;
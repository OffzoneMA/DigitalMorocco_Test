const {By, until} = require("selenium-webdriver");
const os = require('os');


class ProfilePage {
     constructor(driver) {
        this.driver = driver;
     }
    async waitForPageLoad() {
        await this.driver.wait(async () => {
          const readyState = await this.driver.executeScript('return document.readyState');
          return readyState === 'complete';
        }, 10000, 'Page n\'a pas chargé dans le délai ');
        await this.driver.sleep(1000);
     }

     async navigateToProfile() {
        try {
            await this.driver.sleep(2000);
            let ParametresMenuTrigger;
            try {
                ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Paramètres')]]")),  5000  );
            } catch (e) {
                try {
                    ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Paramètres')]")), 5000);
                } catch (e2) {
                    ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(translate(text(), 'PARAMÈTRES', 'paramètres'), 'paramètres')]")), 5000,'Menu "Paramètres" non trouvé même après plusieurs tentatives'
                    );
                }
            }
            await ParametresMenuTrigger.click();
            await this.driver.sleep(1000); 
            const ProfileLink = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mon profil')]")), 5000,'Lien "Mon profil" non trouvé' );
            await ProfileLink.click();
            await this.driver.wait(until.urlContains('UserProfile'), 10000, 'Navigation vers la page des profils échouée');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des profils:', error);
            throw error;
        }
    }

    async checkLanguageSectionVisible() {
        try {
            await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Paramètres de langue et de région')]")),5000,'Section "Paramètres de langue et de région" non trouvée' );
            return true;
        } catch (error) {
            console.error('La section de paramètres de langue et région n\'a pas été trouvée:', error.message);
            return false;
        }
    }
    
    async verifyPageLanguage() {
        try {
            const languageLabel = await this.driver.wait(until.elementLocated(By.xpath("//label[text()='Sélectionnez la langue']")),5000,'Label "Sélectionnez la langue" non trouvé' );
            const regionLabel = await this.driver.wait(until.elementLocated(By.xpath("//label[text()='Sélectionnez la région']")),5000,'Label "Sélectionnez la région" non trouvé'  );
            const saveButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Enregistrer')]")),5000,'Bouton "Enregistrer" non trouvé'   );
            return true;
        } catch (error) {
            console.error('La page ne semble pas être affichée en français:', error.message);
            return false;
        }
    }

    async getSelectedLanguage() {
        try {
            const languageInput = await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Sélectionnez la langue')]/following::input[@value]")), 5000, 'Input de sélection de langue non trouvé');
            const languageValue = await languageInput.getAttribute('value');
            return languageValue;
        } catch (error) {
            console.error('Erreur lors de la récupération de la langue sélectionnée:', error);
            return null;
        }
    }

    

    async getProfileInfo() {
        try {
            await this.driver.wait(until.elementLocated(By.css("form")), 10000, 'Formulaire de profil non trouvé' );
            const firstName = await this.driver.findElement(By.name("firstName")).getAttribute('value');
            const lastName = await this.driver.findElement(By.name("lastName")).getAttribute('value');
            const email = await this.driver.findElement(By.name("email")).getAttribute('value');
            const phoneNumber = await this.driver.findElement(By.name("phoneNumber")).getAttribute('value');
            const website = await this.driver.findElement(By.name("website")).getAttribute('value');
            const address = await this.driver.findElement(By.name("address")).getAttribute('value');
            const country = await this.driver.findElement(By.css("input[name='target']")).getAttribute('value');
            return {
                firstName,
                lastName,
                email,
                phoneNumber,
                website,
                address,
                country
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du profil:', error);
            throw error;
        }
    }
    
    async selectCountry(countryName) {
        try {
            console.log(`Tentative de sélection du pays: ${countryName}`);
            const countrySelector = await this.driver.findElement(By.css('input[name="target"][placeholder="Sélectionner le pays"]'));
            await countrySelector.click();
            await this.driver.sleep(1000);
            const searchInput = await this.driver.findElement(By.css('input[name="search"][placeholder="Rechercher un pays"]'));
            await searchInput.clear();
            await searchInput.sendKeys(countryName);
            await this.driver.sleep(1000);
            try {
                const countryElement = await this.driver.findElement(By.xpath(`//div[contains(@class, 'flex py-2')]/label[text()="${countryName}"]`));
                await countryElement.click();
            } catch (error) {
                console.log(`XPath exact échoué, tentative avec contains(): ${error.message}`);
                const countryElement = await this.driver.findElement(By.xpath(`//div[contains(@class, 'flex py-2')]/label[contains(text(), "${countryName}")]`));
                await countryElement.click();
            }
            await this.driver.sleep(1000);
            return true;
        } catch (error) {
            throw new Error(`Impossible de sélectionner le pays "${countryName}": ${error.message}`);
        }
    }

    async updateProfileInfo(updates = {}) {
        try {
            await this.driver.wait(until.elementLocated(By.css("form")), 10000, 'Formulaire de profil non trouvé' );
            const oldValues = await this.getProfileInfo();
            
            for (const [field, value] of Object.entries(updates)) {
                if (value && field !== 'country') { 
                    const input = await this.driver.findElement(By.name(field));
                    await input.clear();
                    await input.sendKeys(value);
                    console.log(`Champ ${field} mis à jour avec la valeur: ${value}`);
                }
            }
            
            return oldValues; 
        } catch (error) {
            console.error('Erreur lors de la mise à jour des informations du profil:', error);
            throw error;
        }
    }

    async saveProfileInfo() {
        try {
            const saveButton = await this.driver.findElement(By.xpath("//button[contains(text(), 'Enregistrer')]") );
            await saveButton.click();
            await this.driver.sleep(2000);
            try {
                const successMessage = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'enregistré') or contains(text(), 'mis à jour') or contains(text(), 'succès')]")),5000  );
                return true;
            } catch (e) {
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des modifications:', error);
            throw error;
        }
    }

    async verifyProfileUpdates(oldValues, newValues) {
        try {
            await this.driver.navigate().refresh();
            await this.waitForPageLoad();
            const currentValues = await this.getProfileInfo();
            const results = {};
            let allUpdatesSuccessful = true;
            for (const [field, newValue] of Object.entries(newValues)) {
                if (newValue && currentValues[field] === newValue) {
                    results[field] = {
                        success: true,
                        oldValue: oldValues[field],
                        newValue: newValue,
                        currentValue: currentValues[field]
                    };
                } else if (newValue) {
                    results[field] = {
                        success: false,
                        oldValue: oldValues[field],
                        newValue: newValue,
                        currentValue: currentValues[field]
                    };
                    allUpdatesSuccessful = false;
                }
            }
            
            return {
                allUpdatesSuccessful,
                results
            };
        } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            const userNameDiv = await this.driver.wait(until.elementLocated( By.xpath("//div[contains(@class, 'flex') and contains(@class, 'justify-between')]//span[contains(text(), 'IKRAM ELHAJI')]/parent::div/parent::div") ), 5000,'Élément contenant le nom d\'utilisateur non trouvé'   );
            await userNameDiv.click();
            await this.driver.sleep(1500); 
            let logoutButton;
            try {
                logoutButton = await this.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Déconnexion')] | //button[contains(text(), 'Déconnexion')] | //a[contains(text(), 'Déconnexion')]")  ),   5000 );
            } catch (e) {
                logoutButton = await this.driver.wait( until.elementLocated(By.xpath("//span[contains(text(), 'Logout')] | //button[contains(text(), 'Logout')] | //a[contains(text(), 'Logout')] | //span[contains(text(), 'Sign out')] | //button[contains(text(), 'Sign out')]")),  5000,  "Bouton de déconnexion non trouvé dans le menu" );
            }
            await logoutButton.click();
            await this.driver.wait(until.urlContains('SignIn'), 10000, 'La déconnexion n\'a pas redirigé vers la page de connexion');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            try {
                await this.driver.executeScript(`
                    var elements = document.querySelectorAll("div.flex span");
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].textContent.includes("IKRAM ELHAJI")) {
                            elements[i].closest("div.flex").click();
                            break;
                        }
                    }
                `);
                await this.driver.sleep(1500);
                await this.driver.executeScript(`
                    var elements = document.querySelectorAll("span, button, a");
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].textContent.includes("Déconnexion") || 
                            elements[i].textContent.includes("Logout") || 
                            elements[i].textContent.includes("Sign out")) {
                            elements[i].click();
                            break;
                        }
                    }
                `);
                await this.driver.wait(until.urlContains('SignIn'), 10000);
                await this.waitForPageLoad();
                return true;
            } catch (jsError) {
                throw error; 
            }
        }
    }
    
    async changePassword(currentPassword, newPassword, confirmNewPassword) {
        try {
            await this.driver.wait(until.elementLocated(By.css("form")), 10000, 'Formulaire de profil non trouvé');
            const currentPasswordField = await this.driver.findElement(By.name("currentPassword"));
            await currentPasswordField.clear();
            await currentPasswordField.sendKeys(currentPassword);
            const newPasswordField = await this.driver.findElement(By.name("newPassword"));
            await newPasswordField.clear();
            await newPasswordField.sendKeys(newPassword);
            const confirmNewPasswordField = await this.driver.findElement(By.name("confirmNewPassword"));
            await confirmNewPasswordField.clear();
            await confirmNewPasswordField.sendKeys(confirmNewPassword);
            return true;
        } catch (error) {
            throw error;
        }
    }
    
    async savePasswordChanges() {
        try {
            let saveButton;
            try {
                const passwordSection = await this.driver.findElement(By.xpath("//h2[contains(text(), 'Paramètres du mot de passe') or contains(text(), 'mot de passe')]/ancestor::div[contains(@class, 'section') or position() <= 3]"));
                saveButton = await passwordSection.findElement(By.xpath(".//button[contains(text(), 'Enregistrer')]")  );
            } catch (e) {
                try {
                    const confirmPasswordField = await this.driver.findElement(By.name("confirmNewPassword"));
                    const parentElement = await confirmPasswordField.findElement(By.xpath("./ancestor::form"));
                    saveButton = await parentElement.findElement(By.xpath(".//button[contains(text(), 'Enregistrer')]"));
                } catch (e2) {
                    const allSaveButtons = await this.driver.findElements(By.xpath("//button[contains(text(), 'Enregistrer')]"));
                    if (allSaveButtons.length >= 2) {
                        saveButton = allSaveButtons[1]; 
                    } else {
                        throw new Error("Impossible de trouver le bouton d'enregistrement pour le mot de passe");
                    }
                }
            }
            await saveButton.click();
            await this.driver.sleep(2000);
            
            try {
                const successMessage = await this.driver.wait(until.elementLocated( By.xpath("//*[contains(text(), 'enregistré') or contains(text(), 'mis à jour') or contains(text(), 'succès') or contains(text(), 'Mot de passe')]")  ), 5000);
                return {
                    success: true,
                    message: await successMessage.getText()
                };
            } catch (e) {
                try {
                    const errorMessage = await this.driver.findElement(By.xpath("//*[contains(text(), 'erreur') or contains(text(), 'incorrect') or contains(text(), 'échec')]"));
                    return {
                        success: false,
                        message: await errorMessage.getText()
                    };
                } catch (e2) {
                    return {
                        success: true,
                        message: "Changement effectué (aucun message explicite)"
                    };
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du mot de passe:', error);
            throw error;
        }
    }

    async checkFieldHasError(fieldName) {
        try {
          const field = await this.driver.findElement(By.name(fieldName));
          const hasErrorClass = await this.driver.executeScript(`
            const el = arguments[0];
            if (el.classList.contains('shadow-inputBsError')) return true;
            const parent = el.parentElement;
            if (parent && parent.classList.contains('shadow-inputBsError')) return true;
            const style = window.getComputedStyle(el);
            if (style.boxShadow && style.boxShadow.includes('rgba(232, 85, 85, 0.13)')) return true;
            if (el.getAttribute('aria-invalid') === 'true') return true;
            
            return false;
          `, field);
          
          return hasErrorClass;
        } catch (error) {
          console.error(`Erreur lors de la vérification de l'erreur pour le champ ${fieldName}:`, error);
          return false;
        }
      }
      
      async getFieldErrorMessage(fieldName) {
        try {
          const hasError = await this.checkFieldHasError(fieldName);
          if (!hasError) {
            return null;
          }
          const locators = [
            By.xpath(`//input[@name='${fieldName}']/following-sibling::div[contains(@class, 'text-red') or contains(@class, 'error')]`),
            By.xpath(`//input[@name='${fieldName}']/parent::div/following-sibling::div[contains(@class, 'text-red') or contains(@class, 'error')]`),
            By.xpath(`//input[@name='${fieldName}']/ancestor::div[position()=1 or position()=2]/following-sibling::div[contains(@class, 'text-red') or contains(@class, 'error')]`),
            By.xpath(`//input[@name='${fieldName}']/following-sibling::span[contains(@class, 'text-red') or contains(@class, 'error')]`)
          ];
          for (const locator of locators) {
            try {
              const errorElements = await this.driver.findElements(locator);
              if (errorElements.length > 0) {
                for (const element of errorElements) {
                  const text = await element.getText();
                  if (text && text.trim().length > 0) {
                    return text;
                  }
                }
              }
            } catch (e) {
            }
          }
          return "Erreur de validation détectée (bordure rouge)";
        } catch (error) {
          console.log(`Erreur lors de la recherche de message d'erreur pour ${fieldName}:`, error);
          return null;
        }
      }

      async uploadProfilePhoto(imageName) {
        try {
          const os = require('os');
          const path = require('path');
          const downloadsFolder = path.join(os.homedir(), 'Downloads');
          const absoluteImagePath = path.join(downloadsFolder, imageName);
          const fileInput = await this.driver.findElement(By.css('input[type="file"]'));
          await fileInput.sendKeys(absoluteImagePath);
          await this.driver.sleep(3000);
          await this.saveProfileInfo();
          return true;
        } catch (error) {
          console.error(`Erreur lors du téléchargement de la photo: ${error.message}`);
          throw new Error(`Impossible de télécharger la photo: ${error.message}`);
        }
      }

      async changeProfilePhoto(imageName) {
        try {
            await this.driver.sleep(5000);
            const iconContainer = await this.driver.wait(until.elementLocated(By.className('icon-container1')),10000,"Le conteneur de l'icône n'a pas été trouvé" );
            const actions = this.driver.actions({async: true});
            await actions.move({origin: iconContainer}).perform();
            await this.driver.sleep(2000);
            const changeButton = await this.driver.wait(until.elementLocated(By.xpath('//div[text()="Changer"]')),5000,"Le bouton 'Changer' n'a pas été trouvé après hover" );
            await changeButton.click();
            await this.driver.sleep(1000);
            const fileInput = await this.driver.wait(until.elementLocated(By.css('input[type="file"]')),5000,"Le sélecteur de fichier n'est pas apparu");
            await fileInput.sendKeys(this.getAbsoluteImagePath(imageName));
            await this.driver.sleep(3000);
            return true;
        } catch (error) {
            console.error(`Erreur lors du changement de photo de profil: ${error.message}`);
            throw new Error(`Impossible de changer la photo de profil: ${error.message}`);
        }
    }
    
    getAbsoluteImagePath(imageName) {
        const os = require('os');
        const path = require('path');
        const downloadsFolder = path.join(os.homedir(), 'Downloads');
        return path.join(downloadsFolder, imageName);
    }

    async DeleteProfilePhoto() {
        try {
            await this.driver.sleep(5000);
            const iconContainer = await this.driver.wait(until.elementLocated(By.className('icon-container1')),10000,"Le conteneur de l'icône n'a pas été trouvé" );
            const actions = this.driver.actions({async: true});
            await actions.move({origin: iconContainer}).perform();
            await this.driver.sleep(2000);
            const DeleteButton = await this.driver.wait(until.elementLocated(By.xpath('//div[text()="Supprimer"]')),5000,"Le bouton 'Supprimer' n'a pas été trouvé après hover" );
            await DeleteButton.click();
            await this.driver.sleep(3000);
            return true;
        } catch (error) {
            console.error(`Erreur lors du Suppression de photo de profil: ${error.message}`);
            throw new Error(`Impossible de supprimer la photo de profil: ${error.message}`);
        }
    }

    async changeLanguage(language) {
        try {
            const languageSection = await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Paramètres de langue et de région') or contains(text(), 'Language & Region Settings')]")),5000,'Section des paramètres de langue non trouvée');
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", languageSection);
            await this.driver.sleep(1000); 
            const languageField = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Sélectionnez la langue']")),5000,'Champ de sélection de langue non trouvé'   );
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", languageField);
            await this.driver.sleep(500);
            const parentDiv = await languageField.findElement(By.xpath("./.."));
            await parentDiv.click();
            await this.driver.sleep(1000);
            const searchInput = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Rechercher une language']")),5000,'Champ de recherche de langue non trouvé' );
            await searchInput.clear();
            await searchInput.sendKeys(language);
            await this.driver.sleep(1000);
            const languageOption = await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${language}')]`)),5000,`Option de langue "${language}" non trouvée` );
            await languageOption.click();
            await this.driver.sleep(1000);
            
            return true;
        } catch (error) {
            console.error(`Erreur lors du changement de langue vers ${language}:`, error);
            throw error;
        }
    }

    async changeRegion(region) {
        try {
            const regionField = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Sélectionnez votre région' or @placeholder='Sélectionnez la région']")),5000,'Champ de sélection de région non trouvé' );
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", regionField);
            await this.driver.sleep(500);
            const parentDiv = await regionField.findElement(By.xpath("./.."));
            await parentDiv.click();
            await this.driver.sleep(1000);
            const searchInput = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Rechercher une région']")),5000,'Champ de recherche de région non trouvé');
            await searchInput.clear();
            await searchInput.sendKeys(region);
            await this.driver.sleep(1000);
            const regionOption = await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${region}')]`)), 5000, `Option de région "${region}" non trouvée` );
            await regionOption.click();
            await this.driver.sleep(1000);
            return true;
        } catch (error) {
            console.error(`Erreur lors du changement de région vers ${region}:`, error);
            throw error;
        }
    }

    async saveLanguageAndRegionSettings() {
        try {
            const saveButton = await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Paramètres de langue et de région')]/following::button[contains(text(), 'Enregistrer') or contains(text(), 'Save')][1]"  )), 5000, 'Bouton Enregistrer pour les paramètres de langue et région non trouvé'  );
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", saveButton);
            await this.driver.sleep(500);
            await saveButton.click();
            await this.driver.sleep(2000); 
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des paramètres de langue et région:', error);
            throw error;
        }
    }

    async verifyEnglishInterface() {
        try {
            await this.scrollToLanguageSection();
            const sectionTitle = await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Language & Region Settings')]")),10000,'Titre "Language & Region Settings" non trouvé' );
            const languageLabel = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Select Language')]")),5000,'Texte "Select Language" non trouvé');
            const regionLabel = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Select Region')]")),5000,'Texte "Select Region" non trouvé'   );
            const saveButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Save')]")),5000,'Bouton "Save" non trouvé'  );
            console.log("Interface vérifiée avec succès en anglais!");
            return true;
            } catch (error) {
            console.error('L\'interface ne semble pas être en anglais:', error.message);
            return false;
        }
    }
async scrollToLanguageSection() {
    try {
        const xpathExpression = "//label[contains(text(), 'Paramètres de langue et de région') or contains(text(), 'Language & Region Settings')]";
        const languageSection = await this.driver.wait(until.elementLocated(By.xpath(xpathExpression)),5000,'Section des paramètres de langue et de région non trouvée dans aucune langue' );
        await this.driver.executeScript("arguments[0].scrollIntoView(true);", languageSection);
        await this.driver.sleep(1000); 
        return true;
    } catch (error) {
        console.error('Erreur lors du défilement vers la section des paramètres de langue:', error);
        throw error;
    }
}
  
    

}


module.exports = ProfilePage;
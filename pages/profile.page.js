const {By,until}=require("selenium-webdriver");

class ProfilePage{
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
            const ProfileLink =await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mon profil')]")), 5000,'Lien "Mon profil" non trouvé' );
            await ProfileLink.click();
            await this.driver.wait(until.urlContains('UserProfile'), 10000, 'Navigation vers la page des profils échouée');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des profils:', error);
            throw error;
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
async updateProfileInfo(updates = {}) {
    try {
        await this.driver.wait(until.elementLocated(By.css("form")), 10000, 'Formulaire de profil non trouvé' );
        const oldValues = await this.getProfileInfo();
        for (const [field, value] of Object.entries(updates)) {
            if (value) {
                if (field === 'country') {
                    const countryInput = await this.driver.findElement(By.css("input[name='target']"));
                    await countryInput.clear();
                    await countryInput.sendKeys(value);
                } else {
                    const input = await this.driver.findElement(By.name(field));
                    await input.clear();
                    await input.sendKeys(value);
                }
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

}

module.exports = ProfilePage;

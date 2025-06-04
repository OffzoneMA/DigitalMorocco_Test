const {By, until} = require("selenium-webdriver");

class HistoriquePage {
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

    async navigateToHistorique() {
        try {
            const historiqueMenu = await this.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Historique')]")),10000,'Menu "Historique" non trouvé' );
            await historiqueMenu.click();
            await this.driver.wait(until.urlContains('History'),10000,'Navigation vers la page des historiques échouée' );
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des Historiques:', error.message);
            throw error;
        }
    }

    async isHistoriquePageDisplayed() {
        try {
            const currentUrl = await this.driver.getCurrentUrl();
            return currentUrl.includes('History');
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'affichage de la page:', error.message);
            return false;
        }
    }

    async getHistoryEntries() {
        try {
            await this.waitForPageLoad();const entries = await this.driver.findElements( By.xpath("//div[contains(@class, 'flex flex-row gap-4')]"));
            return entries;
        } catch (error) {
            console.error('Erreur lors de la récupération des entrées:', error.message);
            return [];
        }
    }

    async getEntryInfo(entryIndex) {
        try {
            const entries = await this.getHistoryEntries();
            if (entryIndex >= entries.length) {
                throw new Error(`Index ${entryIndex} hors limite`);
            }

            const entry = entries[entryIndex];
            
            // Récupérer la date/heure
            const dateTimeElement = await entry.findElement(By.xpath(".//label[contains(@class, 'text-gray500')]") );
            const dateTime = await dateTimeElement.getText();

            // Récupérer l'action
            const actionElement = await entry.findElement( By.xpath(".//label[contains(@class, 'font-dm-sans-medium')]") );
            const action = await actionElement.getText();

            // Récupérer le nom d'utilisateur
            const userElement = await entry.findElement(By.xpath(".//label[contains(@class, 'font-dm-sans-regular')]") );
            const username = await userElement.getText();

            return {
                dateTime: dateTime,
                action: action,
                username: username
            };
        } catch (error) {
            console.error(`Erreur lors de la récupération des infos de l'entrée ${entryIndex}:`, error.message);
            throw error;
        }
    }

    // Vérifier que chaque ligne contient les informations requises
    async verifyEntryStructure(entryIndex) {
        try {
            const entryInfo = await this.getEntryInfo(entryIndex);
            
            const hasDateTime = entryInfo.dateTime && entryInfo.dateTime.trim() !== '';
            const hasAction = entryInfo.action && entryInfo.action.trim() !== '';
            const hasUsername = entryInfo.username && entryInfo.username.trim() !== '';

            return {
                hasDateTime,
                hasAction,
                hasUsername,
                isComplete: hasDateTime && hasAction && hasUsername
            };
        } catch (error) {
            console.error(`Erreur lors de la vérification de la structure de l'entrée ${entryIndex}:`, error.message);
            return {
                hasDateTime: false,
                hasAction: false,
                hasUsername: false,
                isComplete: false
            };
        }
    }

    // Vérifier l'ordre chronologique 
    async verifyChronologicalOrder() {
        try {
            const entries = await this.getHistoryEntries();
            if (entries.length < 2) {
                return true; 
            }
            const maxEntriesToCheck = Math.min(entries.length, 10);

            let previousDate = null;
            
            for (let i = 0; i < maxEntriesToCheck; i++) {
                const entryInfo = await this.getEntryInfo(i);
                const currentDate = this.parseDateTime(entryInfo.dateTime);
                
                console.log(`Entrée ${i + 1}: ${entryInfo.dateTime} → ${currentDate.toISOString()}`);
                
                if (previousDate !== null && currentDate > previousDate) {
                    return false; 
                }
                
                previousDate = currentDate;
            }
            
            console.log('Ordre chronologique vérifié avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'ordre chronologique:', error.message);
            return false;
        }
    }

    parseDateTime(dateTimeString) {
        try {
            if (!dateTimeString || !dateTimeString.includes(',')) {
                console.error('Format de date invalide:', dateTimeString);
                return new Date(0);
            }

            const months = {
                'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
                'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
                'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
                // Versions avec majuscule
                'Janvier': 0, 'Février': 1, 'Mars': 2, 'Avril': 3,
                'Mai': 4, 'Juin': 5, 'Juillet': 6, 'Août': 7,
                'Septembre': 8, 'Octobre': 9, 'Novembre': 10, 'Décembre': 11
            };

            const parts = dateTimeString.trim().split(', ');
            if (parts.length !== 2) {
                console.error('Format de date incorrect - parties:', parts);
                return new Date(0);
            }

            const datePart = parts[0].trim(); 
            const timePart = parts[1].trim(); 

            const dateComponents = datePart.split(' ');
            if (dateComponents.length !== 3) {
                console.error('Format de date incorrect - composants:', dateComponents);
                return new Date(0);
            }

            const [day, month, year] = dateComponents;
            const timeComponents = timePart.split(':');
            
            if (timeComponents.length !== 3) {
                console.error('Format d\'heure incorrect:', timeComponents);
                return new Date(0);
            }

            const [hour, minute, second] = timeComponents;

            // Vérifier que le mois existe
            if (!(month in months)) {
                console.error('Mois non reconnu:', month);
                return new Date(0);
            }

            const parsedDate = new Date(
                parseInt(year),
                months[month],
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            );

            return parsedDate;
        } catch (error) {
            console.error('Erreur lors du parsing de la date:', error.message, 'Input:', dateTimeString);
            return new Date(0); 
        }
    }

    // Vérifier qu'un utilisateur spécifique apparaît dans l'historique
    async verifyUserInHistory(expectedUsername) {
        try {
            const entries = await this.getHistoryEntries();
            
            for (let i = 0; i < entries.length; i++) {
                const entryInfo = await this.getEntryInfo(i);
                if (entryInfo.username.toLowerCase().includes(expectedUsername.toLowerCase())) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'utilisateur:', error.message);
            return false;
        }
    }

    async getHistoryEntriesCount() {
        try {
            const entries = await this.getHistoryEntries();
            return entries.length;
        } catch (error) {
            console.error('Erreur lors du comptage des entrées:', error.message);
            return 0;
        }
    }

    async verifyActionInHistory(expectedAction) {
        try {
            const entries = await this.getHistoryEntries();
            
            for (let i = 0; i < entries.length; i++) {
                const entryInfo = await this.getEntryInfo(i);
                if (entryInfo.action.toLowerCase().includes(expectedAction.toLowerCase())) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'action:', error.message);
            return false;
        }
    }

    async waitForNewEntry(previousCount, timeout = 10000) {
        try {
            await this.driver.wait(async () => {
                const currentCount = await this.getHistoryEntriesCount();
                return currentCount > previousCount;
            }, timeout, 'Nouvelle entrée non ajoutée dans le délai');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'attente de nouvelle entrée:', error.message);
            return false;
        }
    }
}

module.exports = HistoriquePage;
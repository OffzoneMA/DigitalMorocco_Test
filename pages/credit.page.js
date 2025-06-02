const { By, until } = require("selenium-webdriver");

class CreditPage {
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

    async navigateToCredit() {
        try {
            const manageButton = await this.driver.wait(until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Gérer')]]")), 10000, 'Bouton "Gérer" non trouvé' );
            await this.driver.wait(until.elementIsEnabled(manageButton), 5000);
            await manageButton.click();
            await this.driver.sleep(500);
            await this.driver.wait(until.urlContains('ManageCredits'), 10000, 'Navigation vers la page ManageCredits échouée' );
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers ManageCredits:', error);
            throw error;
        }
    }

    async getTotalCreditsValue() {
        try {
            const totalElement = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Total des crédits')]/following-sibling::div")),10000,'Élément total des crédits non trouvé' );
             const totalValue = await totalElement.getText();
            return totalValue.trim();
        } catch (error) {
            console.error('Erreur lors de la récupération du total des crédits:', error);
            throw error;
        }
    }

    async isTotalCreditsDisplayed() {
        try {
            const totalContainer = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Total des crédits')]")),10000 );
            return await totalContainer.isDisplayed();
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'affichage du total:', error);
            return false;
        }
    }

    async validateTotalCreditsFormat() {
        try {
            const totalValue = await this.getTotalCreditsValue();
            const numericValue = totalValue.replace(/[,\s]/g, '');
            const isNumeric = /^\d+$/.test(numericValue);
            return {
                value: totalValue,
                isNumeric: isNumeric,
                numericValue: numericValue
            };
        } catch (error) {
            console.error('Erreur lors de la validation du format:', error);
            throw error;
        }
    }
async selectCreditOption(optionText) {
    try {
        await this.driver.sleep(1500);
        try {
            const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[@role='menu']//span[contains(@class, 'text-gray-801') and contains(text(), '${optionText}')]`)),5000,'Option non trouvée par texte exact'  );
            if (await option.isDisplayed()) {
                await option.click();
                return true;
            }
        } catch (error) {
            console.log('Méthode 1 échouée, tentative méthode 2...');
        }
        try {
            const optionContainer = await this.driver.wait(until.elementLocated(By.xpath(`//div[@role='menu']//div[contains(@class, 'cursorpointer-green') and .//span[contains(text(), '${optionText}')]]`)),5000,'Container d\'option non trouvé' );
            if (await optionContainer.isDisplayed()) {
                await optionContainer.click();
                return true;
            }
        } catch (error) {
            console.log('Méthode 2 échouée, tentative méthode 3...');
        }
        try {
            const searchTerms = optionText.split(' ');
            const firstTerm = searchTerms[0]; 
            const option = await this.driver.wait(until.elementLocated(By.xpath(`//div[@role='menu']//span[contains(@class, 'text-gray-801') and contains(text(), '${firstTerm}')]`)),5000,'Option non trouvée avec recherche flexible');
            if (await option.isDisplayed()) {
                await option.click();
                return true;
            }
        } catch (error) {
            console.log('Méthode 3 échouée, tentative méthode 4...');
        }
        try {
            const option = await this.driver.findElement(By.xpath(`//div[@role='menu']//span[contains(@class, 'text-gray-801') and contains(text(), 'crédits')]`) );
            await this.driver.executeScript("arguments[0].click();", option);
            return true;
        } catch (error) {
            console.log('Toutes les méthodes de sélection ont échoué');
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors de la sélection de l\'option:', error);
        return false;
    }
}

async getSelectedCreditValue() {
    try {
        await this.driver.sleep(1000);
        const inputElement = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Sélectionnez des crédits' and @readonly]")),5000, 'Input de sélection non trouvé');
        const selectedValue = await inputElement.getAttribute('value');
        return selectedValue;
    } catch (error) {
        console.error('Erreur lors de la récupération de la valeur sélectionnée:', error);
        return '';
    }
}

async isDropdownClosed() {
    try {
        await this.driver.sleep(500);
        
        const menuElements = await this.driver.findElements( By.xpath("//div[@role='menu']"));
        if (menuElements.length === 0) {
            return true;
        }
        for (let menu of menuElements) {
            if (await menu.isDisplayed()) {
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification de fermeture:', error);
        return false;
    }
}

async debugAvailableOptions() {
    try {
        const options = await this.driver.findElements(By.xpath("//div[@role='menu']//span[contains(@class, 'text-gray-801')]"));        
        for (let i = 0; i < options.length; i++) {
            try {
                const optionText = await options[i].getText();
                const isDisplayed = await options[i].isDisplayed();
            } catch (error) {
                console.log(`Option ${i+1}: Erreur lors de la lecture`);
            }
        }
        
        console.log('=== FIN DEBUG OPTIONS ===');
    } catch (error) {
        console.error('Erreur lors du debug des options:', error);
    }
}


async clickCreditDropdown() {
    try {
        const dropdown = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Sélectionnez des crédits']/parent::div")),10000,'Menu déroulant des crédits non trouvé' );
        await this.driver.wait(until.elementIsEnabled(dropdown), 5000);
        await this.driver.executeScript("arguments[0].click();", dropdown);
        await this.driver.sleep(1000); 
        const menuOpened = await this.isDropdownOpen();
        if (!menuOpened) {
            throw new Error('Le menu ne s\'est pas ouvert correctement');
        }
        return true;
    } catch (error) {
        console.error('Erreur lors du clic sur le menu déroulant:', error);
        throw error;
    }
}
async isDropdownOpen() {
    try {
        await this.driver.sleep(500);
        const dropdownMenu = await this.driver.findElements(By.xpath("//div[@role='menu']") );
        if (dropdownMenu.length > 0) {
            return await dropdownMenu[0].isDisplayed();
        }
        return false;
    } catch (error) {
        return false;
    }
}

async searchInCreditDropdown(searchTerm) {
    try {
        let isOpen = await this.isDropdownOpen();
        if (!isOpen) {
            await this.clickCreditDropdown();
            await this.driver.sleep(2000);
            isOpen = await this.isDropdownOpen();
            
            if (!isOpen) {
                throw new Error('Impossible d\'ouvrir le menu déroulant');
            }
        }
        
        let searchInput;
        const maxAttempts = 3;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                searchInput = await this.driver.wait(until.elementLocated(By.xpath("//div[@role='menu']//input[@name='search' and @placeholder='Search']")),5000,`Tentative ${attempt}: Barre de recherche non trouvée`);
                if (await searchInput.isDisplayed()) {
                    break;
                }
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw new Error('Barre de recherche non trouvée après plusieurs tentatives');
                }
                console.log(`Tentative ${attempt} échouée, nouvelle tentative...`);
                await this.driver.sleep(1000);
            }
        }
        await searchInput.clear();
        await searchInput.sendKeys(searchTerm);
        await this.driver.sleep(2000); 
        return true;
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        throw error;
    }
}

async clickCreditDropdownWithActions() {
    try {
        const dropdown = await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Sélectionnez des crédits']/parent::div")),10000,'Menu déroulant des crédits non trouvé' );
        const actions = this.driver.actions({ bridge: true });
        await actions.move({ origin: dropdown }).click().perform();
        await this.driver.sleep(1500);
        return await this.isDropdownOpen();
    } catch (error) {
        console.error('Erreur avec Actions:', error);
        throw error;
    }
}
async testCreditDropdownWithSearchRobuste(searchTerm, optionToSelect) {
    try {
        const result = {
            dropdownOpened: false,
            searchPerformed: false,
            resultsFound: 0,
            optionSelected: false,
            selectedValue: '',
            dropdownClosed: false
        };

        let dropdownAttempts = 0;
        const maxDropdownAttempts = 3;
        
        while (!result.dropdownOpened && dropdownAttempts < maxDropdownAttempts) {
            dropdownAttempts++;
            try {
                if (dropdownAttempts === 1) {
                    result.dropdownOpened = await this.clickCreditDropdown();
                } else if (dropdownAttempts === 2) {
                    result.dropdownOpened = await this.clickCreditDropdownWithActions();
                } else {
                    const dropdown = await this.driver.findElement(By.xpath("//input[@placeholder='Sélectionnez des crédits']/parent::div") );
                    await this.driver.executeScript("arguments[0].click();", dropdown);
                    await this.driver.sleep(2000);
                    result.dropdownOpened = await this.isDropdownOpen();
                }
                
                if (result.dropdownOpened) {
                    break;
                }
            } catch (error) {
                console.log(`Tentative ${dropdownAttempts} échouée:`, error.message);
                await this.driver.sleep(1000);
            }
        }

        if (!result.dropdownOpened) {
            throw new Error('Impossible d\'ouvrir le menu déroulant après plusieurs tentatives');
        }

        try {
            await this.searchInCreditDropdown(searchTerm);
            result.searchPerformed = true;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            result.searchPerformed = false;
        }

        result.resultsFound = await this.getSearchResults();
        if (result.resultsFound > 0 && optionToSelect) {
            try {
                result.optionSelected = await this.selectCreditOption(optionToSelect);
                if (result.optionSelected) {
                    await this.driver.sleep(1000);
                    result.selectedValue = await this.getSelectedCreditValue();
                    result.dropdownClosed = await this.isDropdownClosed();
                }
            } catch (error) {
                console.error('Erreur lors de la sélection:', error);
                result.optionSelected = false;
            }
        }

        return result;
    } catch (error) {
        console.error('Erreur dans le test complet du dropdown:', error);
        throw error;
    }
}

async getSearchResults() {
    try {
        await this.driver.sleep(1000);
        const results = await this.driver.findElements(By.xpath("//div[@role='menu']//span[contains(@class, 'text-gray-801') and contains(text(), 'crédits')]"));
        return results.length;
    } catch (error) {
        console.error('Erreur lors de la récupération des résultats:', error);
        return 0;
    }
}


async debugDropdownState() {
    try {
        const inputElements = await this.driver.findElements(By.xpath("//input[@placeholder='Sélectionnez des crédits']"));        
        if (inputElements.length > 0) {
            const inputValue = await inputElements[0].getAttribute('value');
            const inputReadonly = await inputElements[0].getAttribute('readonly');
        }
        const menuElements = await this.driver.findElements( By.xpath("//div[@role='menu']") );        
        for (let i = 0; i < menuElements.length; i++) {
            const isDisplayed = await menuElements[i].isDisplayed();
        }
        const searchElements = await this.driver.findElements(By.xpath("//input[@name='search']"));
    } catch (error) {
        console.error('Erreur lors du debug:', error);
    }
}

async clickFinalizeOrderButton() {
    try {
        const finalizeButton = await this.driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(@class, 'bg-[#482be7]') and contains(text(), 'Finaliser la Commande')]")),10000,'Bouton "Finaliser la Commande" non trouvé' );
        await this.driver.wait(until.elementIsVisible(finalizeButton), 5000);
        await this.driver.wait(until.elementIsEnabled(finalizeButton), 5000);
        await finalizeButton.click();
        await this.driver.sleep(1500);
        return true;
    } catch (error) {
        console.error('Erreur lors du clic sur "Finaliser la Commande":', error);
        return false;
    }
}

async isTermsCheckboxChecked() {
    try {
        const checkbox = await this.driver.findElement(By.xpath("//input[@name='acceptTerms' and @id='acceptTerms']") );
        const isChecked = await checkbox.isSelected();
        return isChecked;
    } catch (error) {
        console.error('Erreur lors de la vérification de la checkbox:', error);
        return false;
    }
}

async toggleTermsCheckbox(shouldCheck = true) {
    try {
        const checkbox = await this.driver.wait(until.elementLocated(By.xpath("//input[@name='acceptTerms' and @id='acceptTerms']")),10000,'Checkbox conditions d\'utilisation non trouvée' );
        const isCurrentlyChecked = await checkbox.isSelected();
        if ((shouldCheck && !isCurrentlyChecked) || (!shouldCheck && isCurrentlyChecked)) {
            await checkbox.click();
            await this.driver.sleep(500);
        }
        
        return await checkbox.isSelected();
    } catch (error) {
        console.error('Erreur lors de la modification de la checkbox:', error);
        return false;
    }
}

async hasTermsCheckboxError() {
    try {
        const checkboxWithError = await this.driver.findElements(By.xpath("//input[@name='acceptTerms' and contains(@class, 'shadow-checkErrorbs')]")  );
        
        if (checkboxWithError.length > 0) {
            console.log('Erreur de validation détectée sur la checkbox conditions d\'utilisation');
            return true;
        }
        
        const checkboxWithErrorBorder = await this.driver.findElements(By.xpath("//input[@name='acceptTerms' and contains(@class, 'border-errorColor')]") ); 
        if (checkboxWithErrorBorder.length > 0) {
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification d\'erreur checkbox:', error);
        return false;
    }
}

async hasCreditDropdownError() {
    try {
        const dropdownWithError = await this.driver.findElements(By.xpath("//div[contains(@class, 'shadow-inputBsError') and .//input[@placeholder='Sélectionnez des crédits']]")   );
        
        if (dropdownWithError.length > 0) {
            return true;
        }
        
        const dropdownWithErrorBorder = await this.driver.findElements(By.xpath("//div[contains(@class, 'border-errorColor') and .//input[@placeholder='Sélectionnez des crédits']]")  );
        
        if (dropdownWithErrorBorder.length > 0) {
            console.log('Erreur de validation détectée (border rouge) sur le dropdown');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification d\'erreur dropdown:', error);
        return false;
    }
}

async isCreditSelected() {
    try {
        const creditInput = await this.driver.findElement(By.xpath("//input[@placeholder='Sélectionnez des crédits' and @readonly]") );
        
        const value = await creditInput.getAttribute('value');
        const hasValue = value && value.trim() !== '';
        
        if (hasValue) {
            console.log(`Valeur sélectionnée: "${value}"`);
        }
        
        return hasValue;
    } catch (error) {
        console.error('Erreur lors de la vérification de sélection de crédits:', error);
        return false;
    }
}

async testValidationErrors() {
    try {
        const validationResult = {
            initialState: {
                termsChecked: false,
                creditSelected: false
            },
            scenario1: { 
                buttonClicked: false,
                termsError: false,
                creditError: false
            },
            scenario2: { 
                termsChecked: false,
                buttonClicked: false,
                termsError: false,
                creditError: false
            }
        };
        
        validationResult.initialState.termsChecked = await this.isTermsCheckboxChecked();
        validationResult.initialState.creditSelected = await this.isCreditSelected();
        
        
        if (validationResult.initialState.termsChecked) {
            await this.toggleTermsCheckbox(false);
        }
        
        validationResult.scenario1.buttonClicked = await this.clickFinalizeOrderButton();
        
        if (validationResult.scenario1.buttonClicked) {
            validationResult.scenario1.termsError = await this.hasTermsCheckboxError();
            validationResult.scenario1.creditError = await this.hasCreditDropdownError();
        }
        
        
        validationResult.scenario2.termsChecked = await this.toggleTermsCheckbox(true);
        
        const isCreditCurrentlySelected = await this.isCreditSelected();
        if (isCreditCurrentlySelected) {
            console.log('⚠️ Des crédits sont déjà sélectionnés - ce test nécessite une page vierge');
        }
        
        validationResult.scenario2.buttonClicked = await this.clickFinalizeOrderButton();
        
        if (validationResult.scenario2.buttonClicked) {
            validationResult.scenario2.termsError = await this.hasTermsCheckboxError();
            validationResult.scenario2.creditError = await this.hasCreditDropdownError();
        }
        
        return validationResult;
    } catch (error) {
        console.error('Erreur lors du test de validation:', error);
        throw error;
    }
}

async resetFormState() {
    try {
        const isChecked = await this.isTermsCheckboxChecked();
        if (isChecked) {
            await this.toggleTermsCheckbox(false);
        }
        return true;
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        return false;
    }
}

async getOrderSummary() {
    try {
        console.log('🔍 Recherche des éléments du résumé de commande...');
        
        await this.driver.sleep(1000);
        
        try {
            const summaryContainer = await this.driver.findElement(
                By.xpath('//div[contains(text(), "Résumé de la commande")]/..')
            );
            
            const creditsCountElement = await summaryContainer.findElement(
                By.xpath('.//div[contains(text(), "Nombre de crédits")]/following-sibling::div | .//div[contains(text(), "Nombre de crédits")]/..//div[contains(text(), "-") or contains(text(), ",")]')
            );
            
            const creditsCostElement = await summaryContainer.findElement(
                By.xpath('.//div[contains(text(), "Coût des crédits")]/following-sibling::div | .//div[contains(text(), "Coût des crédits")]/..//div[contains(text(), "$")]')
            );
            
            const totalElement = await summaryContainer.findElement(
                By.xpath('.//div[contains(text(), "Total")]/following-sibling::div | .//div[contains(text(), "Total")]/..//div[contains(text(), "$")]')
            );
            
            const creditsCount = await creditsCountElement.getText();
            const creditsCost = await creditsCostElement.getText();
            const total = await totalElement.getText();
            
            return {
                creditsCount: creditsCount.trim(),
                creditsCost: creditsCost.trim(),
                total: total.trim()
            };
            
        } catch (method1Error) {
            console.log('Méthode 1 échouée, tentative méthode 2...');
        }
        
        try {
            const creditsRow = await this.driver.findElement(
                By.xpath('//div[contains(text(), "Nombre de crédits")]/..')
            );
            const costRow = await this.driver.findElement(
                By.xpath('//div[contains(text(), "Coût des crédits")]/..')
            );
            const totalRow = await this.driver.findElement(
                By.xpath('//div[contains(text(), "Total") and not(contains(text(), "Coût"))]/..')
            );
            
            const creditsElements = await creditsRow.findElements(By.css('div'));
            const costElements = await costRow.findElements(By.css('div'));
            const totalElements = await totalRow.findElements(By.css('div'));
            
            let creditsCount = 'Non trouvé';
            let creditsCost = 'Non trouvé';
            let total = 'Non trouvé';
            
            if (creditsElements.length > 0) {
                creditsCount = await creditsElements[creditsElements.length - 1].getText();
            }
            if (costElements.length > 0) {
                creditsCost = await costElements[costElements.length - 1].getText();
            }
            if (totalElements.length > 0) {
                total = await totalElements[totalElements.length - 1].getText();
            }
            
            return {
                creditsCount: creditsCount.trim(),
                creditsCost: creditsCost.trim(),
                total: total.trim()
            };
            
        } catch (method2Error) {
            console.log('Méthode 2 échouée, tentative méthode 3...');
        }
        
        try {
            const pageText = await this.driver.findElement(By.css('body')).getText();
            const lines = pageText.split('\n');
            let creditsCount = 'Non trouvé';
            let creditsCost = 'Non trouvé';
            let total = 'Non trouvé';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.includes('Nombre de crédits') && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine && nextLine !== 'Nombre de crédits :') {
                        creditsCount = nextLine;
                    }
                }
                
                if (line.includes('Coût des crédits') && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine && nextLine !== 'Coût des crédits :' && nextLine.includes('$')) {
                        creditsCost = nextLine;
                    }
                }
                
                if (line === 'Total' && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine && nextLine.includes('$')) {
                        total = nextLine;
                    }
                }
            }
            
            return {
                creditsCount: creditsCount.trim(),
                creditsCost: creditsCost.trim(),
                total: total.trim()
            };
            
        } catch (method3Error) {
            console.log('Méthode 3 échouée, tentative méthode 4...');
        }
        
        try {
            const dollarElements = await this.driver.findElements(By.xpath('//*[contains(text(), "$")]') );
            const dashElements = await this.driver.findElements(By.xpath('//*[text()="-"]')  );
            const numberElements = await this.driver.findElements( By.xpath('//*[contains(text(), ",") and not(contains(text(), "$"))]')  );
            let creditsCount = 'Non trouvé';
            let creditsCost = 'Non trouvé';
            let total = 'Non trouvé';
            
            if (dashElements.length > 0) {
                creditsCount = await dashElements[0].getText();
            } else if (numberElements.length > 0) {
                creditsCount = await numberElements[0].getText();
            }
            
            if (dollarElements.length >= 2) {
                creditsCost = await dollarElements[0].getText();
                total = await dollarElements[1].getText();
            } else if (dollarElements.length === 1) {
                const dollarText = await dollarElements[0].getText();
                if (dollarText.includes('00.00')) {
                    creditsCost = dollarText;
                    total = dollarText;
                }
            }
            
            return {
                creditsCount: creditsCount,
                creditsCost: creditsCost,
                total: total
            };
            
        } catch (method4Error) {
            console.error('Toutes les méthodes ont échoué');
        }
        
    } catch (error) {
        console.error(' Erreur générale lors de la récupération du résumé:', error.message);
    }
    
    return {
        creditsCount: 'Erreur critique',
        creditsCost: 'Erreur critique',
        total: 'Erreur critique'
    };
}

async debugOrderSummaryStructure() {
    try {
        
        try {
            const summaryTitle = await this.driver.findElement(By.xpath('//*[contains(text(), "Résumé de la commande")]') );
            const parent = await summaryTitle.findElement(By.xpath('..'));
            const parentHTML = await parent.getAttribute('innerHTML');
            
        } catch (e) {
            console.log('Titre "Résumé de la commande" non trouvé');
        }
        
        const dollarElements = await this.driver.findElements(By.xpath('//*[contains(text(), "$")]') );
        for (let i = 0; i < dollarElements.length; i++) {
            const text = await dollarElements[i].getText();
            const tagName = await dollarElements[i].getTagName();
        }
        const dashElements = await this.driver.findElements(By.xpath('//*[text()="-"]') );
        const pageText = await this.driver.findElement(By.css('body')).getText();
        const lines = pageText.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('Nombre de crédits') || 
                line.includes('Coût des crédits') || 
                line.includes('Total') ||
                line.includes('$') ||
                line.trim() === '-') {
            }
        });
        
    } catch (error) {
        console.error('Erreur lors du debug de structure:', error.message);
    }
}





}

module.exports = CreditPage;
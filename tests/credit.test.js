const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const CreditPage = require('../pages/credit.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

describe('Tests fonctionnels de la page des crédits', function () {
    let driver;
    let loginPage;
    let creditPage;

    beforeEach(async function() {
        driver = await createUniqueBrowser();
        await driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
        creditPage = new CreditPage(driver);
    });

    afterEach(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test d\'affichage du total des crédits', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await driver.getCurrentUrl();
            await creditPage.navigateToCredit();
            await creditPage.isTotalCreditsDisplayed();
            await creditPage.validateTotalCreditsFormat();
            await creditPage. getTotalCreditsValue();
            logResult('Test OK : Affichage du total des crédits validé avec succès');
        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

   it('Test complet du menu déroulant avec recherche et sélection', async function() {
    try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await driver.getCurrentUrl();
        await creditPage.navigateToCredit();
        const searchTerm = '11 000';
        const optionToSelect = '11 000 crédits : 98,18 $ (Tarif initial : 115,50 $)';
        const testResult = await creditPage.testCreditDropdownWithSearchRobuste(searchTerm, optionToSelect);
        if (testResult.optionSelected) {
            console.log(`Option sélectionnée avec succès`)
            if (testResult.selectedValue && testResult.selectedValue.trim() !== '') {
                console.log(`Valeur récupérée: "${testResult.selectedValue}"`);
            } else {
                logResult('Test KO : Impossible de récupérer la valeur sélectionnée');
            }
        } else {
            logResult('Test KO : Échec de sélection de l\'option');
            if (testResult.resultsFound === 0) {
                logResult('   Raison: Aucun résultat trouvé');
            } else {
                logResult('   Raison: Option non trouvée ou non cliquable');
            }
        }

        if (testResult.optionSelected ) {
            logResult('Test OK : Test complet du menu déroulant réussi avec succès');
        }
        else {
            logResult('Test KO : Test complet du menu déroulant a échoué');


        }
        
    } catch (error) {
        logResult('Test KO : ' + error.message);
        try {
            await creditPage.debugDropdownState();
        } catch (debugError) {
            console.log('Erreur lors du debug:', debugError.message);
        }
        
        throw error;
    }
});
   
it(' Finaliser commande sans accepter les conditions d\'utilisation', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await creditPage.navigateToCredit();
            const isInitiallyChecked = await creditPage.isTermsCheckboxChecked();
            if (isInitiallyChecked) {
                await creditPage.toggleTermsCheckbox(false);
            } else {
                console.log('Conditions d\'utilisation déjà décochées');
            }

            const buttonClicked = await creditPage.clickFinalizeOrderButton();
            if (!buttonClicked) {
                throw new Error('Impossible de cliquer sur le bouton "Finaliser la Commande"');
            }
            await creditPage.hasTermsCheckboxError();
            await creditPage.hasCreditDropdownError();
            logResult(' Test OK : Validation des conditions d\'utilisation fonctionne correctement');

        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

it('Finaliser commande sans sélection de crédits', async function() {
    try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await creditPage.navigateToCredit();
        await creditPage.resetFormState();
        await creditPage.toggleTermsCheckbox(true);
        await creditPage.isCreditSelected();
        await creditPage.clickFinalizeOrderButton();
        await creditPage.hasTermsCheckboxError();
        await creditPage.hasCreditDropdownError();
        logResult(' Test OK : Finaliser une commande sans sélection de crédits');

    } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
    }
});

it(' Le résumé de commande se met à jour correctement lors du changement de crédits', async function() {
    try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await creditPage.navigateToCredit();
        await creditPage.debugOrderSummaryStructure();
        await creditPage.getOrderSummary();
        const firstSearchTerm = '25 000';
        const firstOption = '25 000 crédits : 196,88 $ (Tarif initial : 262,50 $)';
        const firstSelectionResult = await creditPage.testCreditDropdownWithSearchRobuste(firstSearchTerm, firstOption);
        if (!firstSelectionResult.optionSelected) {
            throw new Error(`Impossible de sélectionner la première option : ${firstOption}`);
        }
        await driver.sleep(2000); 
        const firstSummary = await creditPage.getOrderSummary();
        
        if (firstSummary.creditsCount !== '-' && firstSummary.creditsCost !== '$ 00.00' && firstSummary.total !== '$ 00.00') {
            console.log('Résumé mis à jour après première sélection');
        } else {
            console.log('Résumé non mis à jour après première sélection');
            throw new Error('Le résumé de commande ne s\'est pas mis à jour');
        }
        const secondSearchTerm = '11 000';
        const secondOption = '11 000 crédits : 98,18 $ (Tarif initial : 115,50 $)';
        const secondSelectionResult = await creditPage.testCreditDropdownWithSearchRobuste(secondSearchTerm, secondOption);
        
        if (!secondSelectionResult.optionSelected) {
            throw new Error(`Impossible de sélectionner la deuxième option : ${secondOption}`);
        }
        await driver.sleep(3000); 
        if (process.env.DEBUG_MODE === 'true') {
            await creditPage.debugOrderSummaryStructure();
        }
        
        const secondSummary = await creditPage.getOrderSummary();
        const valuesChanged = (
            secondSummary.creditsCount !== firstSummary.creditsCount ||
            secondSummary.creditsCost !== firstSummary.creditsCost ||
            secondSummary.total !== firstSummary.total
        );

        if (valuesChanged) {
            console.log('Résumé mis à jour après deuxième sélection');
        } else {
            console.log('Résumé non mis à jour après deuxième sélection');
            throw new Error('Le résumé de commande ne s\'est pas mis à jour avec la nouvelle sélection');
        }
        const thirdSearchTerm = '19 000';
        const thirdOption = '19 000 crédits : 149,63 $ (Tarif initial : 199,50 $)';
        const thirdSelectionResult = await creditPage.testCreditDropdownWithSearchRobuste(thirdSearchTerm, thirdOption);
        
        if (!thirdSelectionResult.optionSelected) {
            console.log('Troisième option non disponible ou non sélectionnable');
        } else {
            await driver.sleep(2000);
            const thirdSummary = await creditPage.getOrderSummary();
            
            const thirdValuesChanged = (
                thirdSummary.creditsCount !== secondSummary.creditsCount ||
                thirdSummary.creditsCost !== secondSummary.creditsCost ||
                thirdSummary.total !== secondSummary.total
            );

            if (thirdValuesChanged) {
                console.log('Résumé mis à jour après troisième sélection');
                
            } else {
                console.log('Résumé identique (possibilité de même valeur)');
            }
        }

        // Test de cohérence - vérifier que le total correspond au coût
        const finalSummary = await creditPage.getOrderSummary();
        if (finalSummary.creditsCost === finalSummary.total) {
            console.log('Cohérence des montants - Coût = Total');
        } else {
            console.log('Coût différent du Total (possibles taxes ou remises)');
        }

        logResult('Test OK : Le résumé de commande se met à jour correctement lors des changements de sélection');

    } catch (error) {
        logResult('Test KO : ' + error.message);
        try {
            console.log(' Analyse de la structure pour diagnostiquer le problème...');
            await creditPage.debugOrderSummaryStructure();
            const debugSummary = await creditPage.getOrderSummary();
            await creditPage.debugDropdownState();
        } catch (debugError) {
            logResult('Erreur lors du debug : ' + debugError.message);
        }
        
        throw error;
    }
});
/*it('Test d\'achat de crédits', async function(){
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 20000);
    await creditPage.navigateToCredit();
    const searchTerm = '35';
    const optionToSelect = '3 000 crédits : 28,35 $ (Tarif initial : 31,50 $)';
    await creditPage.testCreditDropdownWithSearchRobuste(searchTerm, optionToSelect);
    const isInitiallyChecked = await creditPage.isTermsCheckboxChecked();
     if (isInitiallyChecked) {
                await creditPage.toggleTermsCheckbox(false);
            } else {
                console.log('Conditions d\'utilisation déjà décochées');
     }

   




})*/
});
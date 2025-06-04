const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const HistoriquePage = require('../pages/historique.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

describe('Tests de la page Historique', function () {
    let driver;
    let loginPage;
    let historiquePage;

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
        historiquePage = new HistoriquePage(driver);
    });

    afterEach(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Affichage de la page Historique', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
             const dashboardUrl = await driver.getCurrentUrl();
            if (dashboardUrl.includes('Dashboard')) {
                logResult('Étape 1 OK : Connexion réussie');
            } else {
                logResult(`Étape 1 KO : Redirection inattendue vers ${dashboardUrl}`);
                throw new Error('Échec de connexion');
            }
            const navigationSuccess = await historiquePage.navigateToHistorique();
            if (navigationSuccess) {
                logResult('Étape 2 OK : Navigation vers la page Historique réussie');
            } else {
                logResult('Étape 2 KO : Échec de navigation vers la page Historique');
                throw new Error('Échec de navigation vers la page Historique');
            }
            const isPageDisplayed = await historiquePage.isHistoriquePageDisplayed();
            if (isPageDisplayed) {
                logResult('Étape 3 OK : Page Historique correctement affichée');
            } else {
                logResult('Étape 3 KO : Page Historique non affichée');
                throw new Error('Page Historique non affichée');
            }

            const currentUrl = await driver.getCurrentUrl();
            if (currentUrl.toLowerCase().includes('history')) {
                logResult('Test OK : Affichage de la page Historique réussi');
            } else {
                logResult(`Test KO : URL inattendue ${currentUrl}`);
                throw new Error(`URL inattendue: ${currentUrl}`);
            }

        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

    it('Affichage des informations de l\'action - Vérifier que chaque ligne affiche l\'action, la date/heure et l\'utilisateur', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await historiquePage.navigateToHistorique();
            const entriesCount = await historiquePage.getHistoryEntriesCount();
            if (entriesCount === 0) {
                return;
            }

            let allEntriesValid = true;
            for (let i = 0; i < Math.min(entriesCount, 5); i++) { // Limiter à 5 entrées max pour le test
                const entryStructure = await historiquePage.verifyEntryStructure(i);
                
                if (entryStructure.isComplete) {
                    const entryInfo = await historiquePage.getEntryInfo(i);
                } else {
                    allEntriesValid = false;
                }
            }

            if (allEntriesValid) {
                logResult('Test OK : Toutes les entrées contiennent les informations requises');
            } else {
                logResult('Test KO : Certaines entrées sont incomplètes');
                throw new Error('Entrées incomplètes détectées');
            }

        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

   it('Vérification de l\'ordre chronologique - Actions affichées de la plus récente à la plus ancienne', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await historiquePage.navigateToHistorique();
            const entriesCount = await historiquePage.getHistoryEntriesCount();
            for (let i = 0; i < Math.min(entriesCount, 4); i++) {
                const entryInfo = await historiquePage.getEntryInfo(i);
            }
            const isChronological = await historiquePage.verifyChronologicalOrder();
            
            if (isChronological) {
                logResult('Test OK : L\'ordre chronologique est respecté (plus récent en premier)');
            } else {
                logResult('Test KO : L\'ordre chronologique n\'est pas respecté');
                throw new Error('Ordre chronologique incorrect');
            }

        } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
        }
    });

   
});
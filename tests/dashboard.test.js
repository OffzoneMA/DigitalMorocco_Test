const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const { createBugTicket} = require('../utils/jiraUtils');
const testInfo = require('../utils/testInfo');

describe('Tests fonctionnels de la page Tableau de bord', function () {
    let driver;
    let loginPage;
    let dashboardPage;

    beforeEach(async function() {
        driver = await createUniqueBrowser();
        await driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
    });

    afterEach(async function() {
        if (this.currentTest && this.currentTest.state === 'failed') {
            console.log(`Le test "${this.currentTest.title}" a échoué!`);
            
            if (!global.ticketCreatedForTest) {
                global.ticketCreatedForTest = {};
            }
            if (global.ticketCreatedForTest[this.currentTest.title]) {
                console.log(`Un ticket a déjà été créé pour le test "${this.currentTest.title}". Éviter la duplication.`);
            } else {
                let errorMessage = 'Erreur inconnue';
                
                if (this.currentTest.err) {
                    errorMessage = this.currentTest.err.message;
                    console.log("Message d'erreur détecté:", errorMessage);
                }
                if (global.lastTestError) {
                    errorMessage = global.lastTestError;
                    console.log("Utilisation du message d'erreur global:", errorMessage);
                }
                const testSpecificInfo = testInfo[this.currentTest.title] || {};
                const stepsInfo = {
                    stepsPerformed: testSpecificInfo.stepsPerformed || "Étapes non spécifiées",
                    actualResult: errorMessage,
                    expectedResult: testSpecificInfo.expectedResult || "Résultat attendu non spécifié"
                };
                
                const ticketKey = await createBugTicket(
                    this.currentTest.title,
                    errorMessage,
                    stepsInfo,
                    driver
                );
                
                if (ticketKey) {
                    global.ticketCreatedForTest[this.currentTest.title] = ticketKey;
                }
            }
        }
        if (driver) {
            await driver.quit();
        }
    });

    it('Test du bouton "Créer un projet"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickCreateProjectButton();
            await driver.wait(until.urlContains('CreateProject'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('CreateProject')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : Test du bouton "Créer un projet" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'Le bouton "Créer un projet" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

     it('Test du bouton "Mettre à niveau l\'abonnement"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickUpgradeSubscriptionButton();
            await driver.wait(until.urlContains('Subscription'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('Subscription') && !currentUrl.includes('upgrade') && !currentUrl.includes('billing')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : Test du bouton "Mettre à niveau l\'abonnement" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'Le bouton "Mettre à niveau l\'abonnement" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });
    it('Test de la section "Total des crédits"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickTotalCreditsCard();
            await driver.wait(until.urlContains('ManageCredit'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('ManageCredit')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : La section "Total des crédits" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Total des crédits" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

     it('Test de la section "Projets Créés"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickTotalProjectsCard();
            await driver.wait(until.urlContains('Projects'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('Projects')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : La section "Projets créés" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Projets créés" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });
       it('Test de la section "Investisseurs"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickInvestorCard();
            await driver.wait(until.urlContains('MyInvestors'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('MyInvestors')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : La section "Investisseurs" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Investisseurs" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

      it('Test de la section "Evénements"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickEventCard();
            await driver.wait(until.urlContains('Participate'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('Participate')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : La section "Evénements" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Evénements" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });    
    
    it('Test de la section "Mon Entreprise"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickCompanyCard();
            await driver.wait(until.urlContains('MyCompany'), 15000);
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('MyCompany')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : La section "Mon Entreprise" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Mon Entreprise" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

    it('Test de la section "Dernières demandes"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickLastRequestsSection();
            await driver.wait(until.urlContains('InvestorRequestsHistoty'), 15000);
            
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('InvestorRequestsHistoty') && !currentUrl.includes('demandes') && !currentUrl.includes('history')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : Test de la section "Dernières demandes" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Dernières demandes" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

    it('Test de la section "Dernier projet actif"', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickLastActiveProjectSection();
            await driver.wait(until.urlContains('Projects'), 15000);
            
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('Projects') && !currentUrl.includes('projet')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : Test de la section "Dernier projet actif" fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'La section "Dernier projet actif" ne fonctionne pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

    it('Test des détails du projet de la section "Dernier Projet Actif" ', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await dashboardPage.clickProjectDetailsCard();
            await driver.wait(until.urlContains('Projectdetails'), 15000);
            
            const currentUrl = await driver.getCurrentUrl();
            if (!currentUrl.includes('Projectdetails') && !currentUrl.includes('details')) {
                throw new Error(`Navigation échouée. URL actuelle: ${currentUrl}`);
            }
           
            logResult('Test OK : Test des détails du projet fonctionne correctement.');
        } catch (error) {
            const errorMessage = 'Les détails du projet ne fonctionnent pas correctement';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw error;
        }
    });

});

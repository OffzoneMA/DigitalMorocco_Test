const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const HistoriquePage = require('../pages/historique.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const ProfilePage = require('../pages/profile.page');
const testInfo = require('../utils/testInfo');
const { createBugTicket } = require('../utils/jiraUtils');



describe('Tests de la page Historique', function () {
    let driver;
    let loginPage;
    let historiquePage;
    let profilePage;


    beforeEach(async function() {
        driver = await createUniqueBrowser();
        await driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
        historiquePage = new HistoriquePage(driver);
        profilePage = new ProfilePage(driver);

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

    function parseHistoryTimestamp(timestampStr) {
    try {
        const months = {
            'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
            'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
            'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
        };
        
        const parts = timestampStr.match(/(\d+)\s+(\w+)\s+(\d+),\s+(\d+):(\d+):(\d+)/);
        if (parts) {
            const [, day, month, year, hour, minute, second] = parts;
            return new Date(year, months[month.toLowerCase()], day, hour, minute, second);
        }
        
        return new Date(timestampStr);
    } catch (e) {
        return new Date(); 
    }
}

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
            const errorMessage = error.message || 'URL inattendue';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;      
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
            const errorMessage =error.message || ' Certaines entrées sont incomplètes';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;      
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
            const errorMessage = error.message ||'  L\'ordre chronologique n\'est pas respecté';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;      
            throw error;
        }
    });

    it('Vérification que le bon nom d\'utilisateur est affiché dans l\'action', async function() {
        try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            await historiquePage.navigateToHistorique();
            await driver.sleep(2000);
            const expectedUsername = "IKRAM ELHAJII"; 
            const userFoundInHistory = await historiquePage.verifyUserInHistory(expectedUsername);
            if (userFoundInHistory) {
                const entriesCount = await historiquePage.getHistoryEntriesCount();
                let userEntriesCount = 0;
                for (let i = 0; i < Math.min(entriesCount, 3); i++) {
                    const entryInfo = await historiquePage.getEntryInfo(i);
                    if (entryInfo.username.includes(expectedUsername)) {
                        userEntriesCount++;
                    }
                }
                logResult('Test OK : Le bon nom d\'utilisateur est affiché');
            } else {
                
                const entriesCount = await historiquePage.getHistoryEntriesCount();
                for (let i = 0; i < Math.min(entriesCount, 3); i++) {
                    const entryInfo = await historiquePage.getEntryInfo(i);
                }
                
                throw new Error('Utilisateur attendu non trouvé dans l\'historique');
            }

        } catch (error) {
           const errorMessage =error.message || '  Le bon utilisateur n\'est pas affiché .';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;      
            throw error;
        }
    });

    it('Vérification que les actions utilisateur sont ajoutées à l\'historique', async function() {
    try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await historiquePage.navigateToHistorique();
        await driver.sleep(2000);
        const initialEntriesCount = await historiquePage.getHistoryEntriesCount();
        let initialLatestEntry = null;
        if (initialEntriesCount > 0) {
            initialLatestEntry = await historiquePage.getEntryInfo(0); 
        }

        await profilePage.navigateToProfile();
        await driver.sleep(2000);
        
        const oldProfileInfo = await profilePage.getProfileInfo();
        
        const timestamp = Date.now();
        const updates = {
            phoneNumber: `+212641459661` 
        };
        await profilePage.updateProfileInfo(updates);
        await driver.sleep(1000);
        await profilePage.saveProfileInfo();
        await driver.sleep(3000); 
        await historiquePage.navigateToHistorique();
        await driver.navigate().refresh();
        await driver.sleep(3000);
        const newEntriesCount = await historiquePage.getHistoryEntriesCount();
        if (newEntriesCount > initialEntriesCount) {
            console.log(` Nombre d'entrées augmenté: ${initialEntriesCount} → ${newEntriesCount}`);
        } else {
            throw new Error(`Le nombre d'entrées n'a pas augmenté: ${initialEntriesCount} → ${newEntriesCount}`);
        }
        const latestEntry = await historiquePage.getEntryInfo(0);
        const isNewEntry = !initialLatestEntry || 
            latestEntry.timestamp !== initialLatestEntry.timestamp ||
            latestEntry.action !== initialLatestEntry.action;

        if (!isNewEntry) {
            throw new Error('Aucune nouvelle entrée détectée dans l\'historique');
        }

        const expectedPatterns = [
            /profil.*mis.*jour/i,                   
            /informations.*personnelles.*modifi/i,   
            /modification.*profil/i,                 
            /update.*profile/i,                     
            /profile.*information.*updated/i,        
            /données.*profil.*sauvegard/i,         
            /personal.*information.*changed/i        
        ];

        const actionMatches = expectedPatterns.some(pattern => 
            pattern.test(latestEntry.action)
        );

        if (actionMatches) {
            console.log(`Action de modification profil correctement enregistrée: "${latestEntry.action}"`);
        } else {
            console.log(`Action enregistrée mais libellé inattendu: "${latestEntry.action}"`);
        }
        const expectedUsername = "IKRAM ELHAJII";
        if (latestEntry.username.includes(expectedUsername)) {
            console.log(` Utilisateur correct: ${latestEntry.username}`);
        } else {
            throw new Error(`Utilisateur incorrect dans l'historique: attendu "${expectedUsername}", trouvé "${latestEntry.username}"`);
        }

        const now = new Date();
        const entryTime = parseHistoryTimestamp(latestEntry.timestamp);
        const timeDifference = Math.abs(now - entryTime) / (1000 * 60); // en minutes

        if (timeDifference <= 5) {
            console.log(` Timestamp récent: ${latestEntry.timestamp} (${timeDifference.toFixed(1)} min)`);
        } else {
            console.log(`Timestamp possiblement incorrect: ${latestEntry.timestamp} (${timeDifference.toFixed(1)} min de différence)`);
        }

        logResult('Test OK : L\'action de modification du profil a été correctement ajoutée à l\'historique');

    } catch (error) {
         const errorMessage =error.message || '  L\'action n\'est pas correctement ajouté à l\'historique .';
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;      
            throw error;
    }
});

b

   
});
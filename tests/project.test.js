const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const ProjectsPage = require('../pages/project.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const { createBugTicket} = require('../utils/jiraUtils');
const testInfo = require('../utils/testInfo');
const { createUniqueBrowser } = require('../helpers/browser.helper');


describe('Tests de création de projet', function () {
  let driver;
  let loginPage;
  let projectsPage;

  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    projectsPage = new ProjectsPage(driver);
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

 it('Création d\'un nouveau projet', async function() {
    try {
      const projectData = {
        name: 'Projet Test ',
        details: 'Description détaillée du projet créé par test ',
        website: config.website,
        contactEmail: config.mail,
        funding: config.funding,
        totalRaised: config.raised,
      };

      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const dashboardUrl = await driver.getCurrentUrl();
      
      if (dashboardUrl.includes('Dashboard')) {
        logResult('Étape 1 OK : Connexion réussie');
      } else {
        const errorMessage = `Redirection inattendue vers ${dashboardUrl}`;
        logResult('Étape 1 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error('Échec de connexion');
      }

      const navigateSuccess = await projectsPage.navigateToProjects();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des projets réussie');
      } else {
        const errorMessage = 'Échec de navigation vers la page des projets';
        logResult('Étape 2 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      const createProjectSuccess = await projectsPage.clickCreateProject();
      if (createProjectSuccess) {
        logResult('Étape 3 OK : Navigation vers la page de création de projet réussie');
      } else {
        const errorMessage = 'Échec de navigation vers la page de création de projet';
        logResult('Étape 3 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      const formFillSuccess = await projectsPage.fillProjectForm(projectData);
      if (formFillSuccess) {
        logResult('Étape 4 OK : Formulaire de projet rempli avec succès');
      } else {
        const errorMessage = 'Échec du remplissage du formulaire de projet';
        logResult('Étape 4 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      const submitSuccess = await projectsPage.submitProjectForm();
      if (submitSuccess) {
        logResult('Étape 5 OK : Soumission du formulaire réussie');
      } else {
        const errorMessage = 'Échec de soumission du formulaire';
        logResult('Étape 5 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      logResult('Test OK : Création de projet réussie');
    } catch (error) {
      const errorMessage = error.message || 'Erreur inconnue lors de la création de projet';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  })

  it('Échec de la création - Champs obligatoires non remplis', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await projectsPage.navigateToProjects();
        await projectsPage.clickCreateProject();
        await projectsPage.submitProjectForm();
        
        const nameInput = await driver.findElement(By.name('name'));
        const detailsInput = await driver.findElement(By.name('details'));
        const nameHasError = await nameInput.getAttribute('class');
        const detailsHasError = await detailsInput.getAttribute('class');
  
        if (nameHasError.includes('shadow-inputBsError') && detailsHasError.includes('shadow-inputBsError')) {
          logResult('Test OK : Echec de la création - Champs obligatoires non remplis.');
        } else {
          const errorMessage = 'Les champs obligatoires ne sont pas correctement mis en évidence';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la validation des champs obligatoires';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Échec de la création - Les champs numériques doivent être positifs', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await projectsPage.navigateToProjects();
        await projectsPage.clickCreateProject();
        
        const fundingField = await driver.findElement(By.name('funding'));
        await fundingField.clear();
        await fundingField.sendKeys('-500');
        const fundingValue = await fundingField.getAttribute('value');
        
        const totalRaisedField = await driver.findElement(By.name('totalRaised'));
        await totalRaisedField.clear();
        await totalRaisedField.sendKeys('-1000');
        const totalRaisedValue = await totalRaisedField.getAttribute('value');        
        
        if (!fundingValue.includes('-') && !totalRaisedValue.includes('-')) {
          logResult('Test OK : Echec de la création - Champs numériques doivent être positifs');
        } else {
          const errorMessage = 'Au moins un des champs accepte des valeurs négatives';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la validation des champs numériques';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Validation échouée - Email au format incorrect', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        await projectsPage.navigateToProjects();
        await projectsPage.clickCreateProject();
        
        const emailField = await driver.findElement(By.name('contactEmail'));
        await emailField.clear();
        await emailField.sendKeys('test');
        
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        await driver.sleep(1000);
        
        const emailClass = await emailField.getAttribute('class');
        if (emailClass.includes('shadow-inputBsError')) {
          logResult('Test OK : Echec de la création - Format email invalide');
        } else {
          const errorMessage = 'Le champ email invalide n\'est pas signalé - Pas de classe shadow-inputBsError';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la validation de l\'email';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Modification d\'un projet existant', async function() {
      try {
        const updatedName = 'Projet Test Modifié';
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        
        const dashboardUrl = await driver.getCurrentUrl();
        const navigateSuccess = await projectsPage.navigateToProjects();
        if (!navigateSuccess) {
          const errorMessage = 'Échec de navigation vers la page des projets';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
        if (!editProjectSuccess) {
          const errorMessage = 'Échec d\'accès au formulaire de modification';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        try {
          await driver.wait(until.elementLocated(By.name('name')), 10000);
          const nameField = await driver.findElement(By.name('name'));
          await nameField.clear(); 
          await nameField.sendKeys(updatedName); 
        } catch (error) {
          const errorMessage = 'Impossible de modifier le champ nom du projet';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
        if (!submitUpdateSuccess) {
          const errorMessage = 'Échec de soumission du formulaire de modification';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        logResult('Test OK : Modification du nom de projet réussie');
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la modification du projet';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Modification d\'un projet avec un champ obligatoire vide', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        
        const dashboardUrl = await driver.getCurrentUrl();
        const navigateSuccess = await projectsPage.navigateToProjects();
        if (!navigateSuccess) {
          const errorMessage = 'Échec de navigation vers la page des projets';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
        if (!editProjectSuccess) {
          const errorMessage = 'Échec d\'accès au formulaire de modification';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
      
        try {
          await driver.wait(until.elementLocated(By.name('name')), 10000);
          const nameField = await driver.findElement(By.name('name'));
          await nameField.clear(); 
        } catch (error) {
          const errorMessage = 'Impossible d\'accéder au champ nom pour le vider';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
          const nameField = await driver.findElement(By.name('name'));
        const nameHasError = await nameField.getAttribute('class');
        
        if (nameHasError.includes('shadow-inputBsError')) {
          logResult('Test OK : Echec de modification - Champ obligatoire vide');
        } else {
          const errorMessage = 'La validation du champ obligatoire vide n\'a pas fonctionné';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la validation du champ obligatoire vide';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Modification d\'un projet avec des données invalides', async function() {
      try {
        const updatedEmail = 'Test';
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        
        const dashboardUrl = await driver.getCurrentUrl();
        const navigateSuccess = await projectsPage.navigateToProjects();
        if (!navigateSuccess) {
          const errorMessage = 'Échec de navigation vers la page des projets';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
        if (!editProjectSuccess) {
          const errorMessage = 'Échec d\'accès au formulaire de modification';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        try {
          await driver.wait(until.elementLocated(By.name('contactEmail')), 10000);
          const emailField = await driver.findElement(By.name('contactEmail'));
          await emailField.clear(); 
          await emailField.sendKeys(updatedEmail); 
        } catch (error) {
          const errorMessage = 'Impossible de modifier le champ email';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
        await driver.sleep(1000);
        
        // Vérifier que la validation de l'email a échoué
        const emailField = await driver.findElement(By.name('contactEmail'));
        const emailClass = await emailField.getAttribute('class');
        
        if (emailClass.includes('shadow-inputBsError')) {
          logResult('Test OK : Echec de modification - Email invalide');
        } else {
          const errorMessage = 'La validation de l\'email invalide n\'a pas fonctionné';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors de la validation de l\'email invalide';
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

    it('Suppression d\'un projet', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        
        const navigateSuccess = await projectsPage.navigateToProjects();
        if (!navigateSuccess) {
          const errorMessage = 'Échec de navigation vers la page des projets';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        await driver.wait(until.elementLocated(By.xpath("//tbody")), 10000, "Le tableau des projets n'a pas été chargé après 10 secondes");
        const projects = await driver.findElements(By.xpath("//tbody/tr"));
        
        if (projects.length === 0) {
          console.log("Aucun projet à supprimer");
          logResult('Test ignoré : Aucun projet disponible');
          return;
        }
        
        const tableElement = await driver.findElement(By.xpath("//tbody"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", tableElement);
        
        const firstProjectNameXPath = "//tbody/tr[1]/td[1]";
        await driver.wait(until.elementLocated(By.xpath(firstProjectNameXPath)), 5000, "L'élément contenant le nom du projet n'a pas été trouvé");
        const firstProjectElement = await driver.findElement(By.xpath(firstProjectNameXPath));
        const projectNameToDelete = await firstProjectElement.getText();
        console.log(`Projet à supprimer: ${projectNameToDelete}`);
        
        const deleteProjectSuccess = await projectsPage.clickDeleteFirstProject();
        if (!deleteProjectSuccess) {
          const errorMessage = 'Échec de l\'action de suppression du projet';
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw new Error(errorMessage);
        }
        
        try {
          await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'bg-white-A700')]//label[contains(text(), 'supprimé avec succès')]")), 5000);
          console.log("Message de confirmation trouvé");
          
          const closeButton = await driver.findElement(By.xpath("//div[contains(@class, 'hover:bg-gray-201') and contains(@class, 'rounded-full')]"));
          await closeButton.click();
          console.log("Modal de confirmation fermé");
          await driver.sleep(1000);
        } catch (error) {
          console.log("Tentative de continuer le test malgré l'erreur...");
        }
        
        await driver.sleep(2000);
        
        try {
          const allProjectElements = await driver.findElements(By.xpath("//tbody/tr/td[1]"));
          let projectsAfterDeletion = [];
          
          for (let element of allProjectElements) {
            const projectName = await element.getText();
            projectsAfterDeletion.push(projectName);
          }
                    
          const isProjectStillPresent = projectsAfterDeletion.some(name => 
            name.trim().toLowerCase() === projectNameToDelete.trim().toLowerCase()
          );
          
          if (isProjectStillPresent) {
            const errorMessage = `Le projet "${projectNameToDelete}" est toujours présent dans le tableau après suppression`;
            console.log(errorMessage);
            logResult('Test KO : ' + errorMessage);
            global.lastTestError = errorMessage;
            throw new Error(errorMessage);
          } else {
            console.log(`Vérification réussie: Le projet "${projectNameToDelete}" a été supprimé avec succès`);
            logResult('Test OK : Suppression de projet vérifiée');
          }
        } catch (error) {
          const errorMessage = error.message || 'Erreur lors de la vérification de la suppression';
          console.error("Erreur lors de la vérification:", errorMessage);
          logResult('Test KO : ' + errorMessage);
          global.lastTestError = errorMessage;
          throw error;
        }
      } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors du test de suppression';
        console.error("Erreur lors du test de suppression:", error);
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
      }
    });

  it('Vérification du changement de statut d\'un projet ', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const dashboardUrl = await driver.getCurrentUrl();
      
      if (dashboardUrl.includes('Dashboard')) {
        logResult('Étape 1 OK : Connexion réussie');
      } else {
        const errorMessage = `Redirection inattendue vers ${dashboardUrl}`;
        logResult('Étape 1 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error('Échec de connexion');
      }

      const navigateSuccess = await projectsPage.navigateToProjects();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des projets réussie');
      } else {
        const errorMessage = 'Échec de navigation vers la page des projets';
        logResult('Étape 2 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      const initialStatus = await projectsPage.getProjectStatus();
      logResult(`Étape 3 OK : Statut initial du projet: ${initialStatus}`);
      const editSuccess = await projectsPage.clickEditFirstProject();
      if (editSuccess) {
        logResult('Étape 4 OK : Ouverture du formulaire d\'édition réussie');
      } else {
        const errorMessage = 'Échec de l\'ouverture du formulaire d\'édition';
        logResult('Étape 4 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      const activateSuccess = await projectsPage.activateProject();
      if (activateSuccess) {
        logResult('Étape 5 OK : Activation du projet réussie');
      } else {
        const errorMessage = 'Échec de l\'activation du projet';
        logResult('Étape 5 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      await projectsPage.navigateToProjects();
      await driver.wait(until.urlContains('Projects'), 10000);
      await driver.sleep(2000); // Attendre la mise à jour
      const activeStatus = await projectsPage.getProjectStatus();
      
      if (activeStatus === 'Actif') {
        logResult('Étape 6 OK : Statut du projet confirmé comme "Actif"');
      } else {
        const errorMessage = `Statut attendu "Actif" mais trouvé "${activeStatus}"`;
        logResult('Étape 6 KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw new Error(errorMessage);
      }

      await projectsPage.clickEditFirstProject();
      await projectsPage.deactivateProject();
      await projectsPage.navigateToProjects();
      await driver.wait(until.urlContains('Projects'), 10000);
      await driver.sleep(2000);
      const finalStatus = await projectsPage.getProjectStatus();
      
      if (finalStatus === 'En attente') {
        logResult('Étape 7 OK : Projet remis en attente avec succès');
      } else {
        logResult(`Étape 7 WARNING : Statut final "${finalStatus}" au lieu de "En attente"`);
      }

      logResult('Test OK : Changement de statut du projet vérifié avec succès');
    } catch (error) {
      const errorMessage = error.message || 'Erreur inconnue lors du test de changement de statut';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });
  });
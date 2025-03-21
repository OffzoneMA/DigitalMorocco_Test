const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const ProjectsPage = require('../pages/project.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');

describe('Tests de création de projet', function () {
  let driver;
  let loginPage;
  let projectsPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    projectsPage = new ProjectsPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });  

 it('Création d\'un nouveau projet', async function() {
    try {
      const projectData = {
        name: 'Projet Test ',
        details: 'Description détaillée du projet créé par test automatisé',
        website: 'https://www.example.com',
        contactEmail: 'contact@example.com',
        funding: '100000',
        totalRaised: '50000',
       
        
      };

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
      const navigateSuccess = await projectsPage.navigateToProjects();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des projets réussie');
      } else {
        logResult('Étape 2 KO : Échec de navigation vers la page des projets');
        throw new Error('Échec de navigation vers la page des projets');
      }
      const createProjectSuccess = await projectsPage.clickCreateProject();
      if (createProjectSuccess) {
        logResult('Étape 3 OK : Navigation vers la page de création de projet réussie');
      } else {
        logResult('Étape 3 KO : Échec de navigation vers la page de création de projet');
        throw new Error('Échec de navigation vers la page de création de projet');
      }

      const formFillSuccess = await projectsPage.fillProjectForm(projectData);
      if (formFillSuccess) {
        logResult('Étape 4 OK : Formulaire de projet rempli avec succès');
      } else {
        logResult('Étape 4 KO : Échec du remplissage du formulaire de projet');
        throw new Error('Échec du remplissage du formulaire de projet');
      }

    const submitSuccess = await projectsPage.submitProjectForm();
    if (submitSuccess) {
      logResult('Étape 5 OK : Soumission du formulaire réussie');
    } else {
      logResult('Étape 5 KO : Échec de soumission du formulaire ');
      throw new Error('Échec de soumission du formulaire ');
    }
          logResult('Test OK : Création de projet réussie ');
    } catch (error) {
      logResult('Test KO : ' + error.message);
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
          logResult('Test KO : Les champs obligatoires ne sont pas correctement mis en évidence.');
          throw new Error('Échec de la mise en évidence des champs obligatoires.');
        }
      } catch (error) {
        logResult('Test KO : ' + error.message);
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
          logResult('Test OK :Echec de la création - Champs numériques doivent être positifs');
        } else {
          logResult('Test KO : Au moins un des champs accepte des valeurs négatives');
          throw new Error('Échec de la validation - valeurs négatives acceptées');
        }
        
      } catch (error) {
        logResult('Test KO : ' + error.message);
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
          logResult('Test KO : Le champ email invalide n\'est pas signalé ');
          throw new Error('Pas de classe shadow-inputBsError pour l\'email invalide');
        }
        
      } catch (error) {
        logResult('Test KO : ' + error.message);
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
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
        try {
          await driver.wait(until.elementLocated(By.name('name')), 10000);
          const nameField = await driver.findElement(By.name('name'));
          await nameField.clear(); 
          await nameField.sendKeys(updatedName); 
          } catch (error) {
          throw error;
        }
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
        logResult('Test OK : Modification du nom de projet réussie');
      } catch (error) {
        logResult('Test KO : ' + error.message);
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
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
      
        try {
          await driver.wait(until.elementLocated(By.name('name')), 10000);
          const nameField = await driver.findElement(By.name('name'));
          await nameField.clear(); 
        } catch (error) {
          throw error;
        }
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
       logResult('Test OK :Echec de modification - Champ obligatoire vide');
      } catch (error) {
        logResult('Test KO : ' + error.message);
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
        const editProjectSuccess = await projectsPage.clickEditFirstProject();
        try {
          await driver.wait(until.elementLocated(By.name('contactEmail')), 10000);
          const emailField = await driver.findElement(By.name('contactEmail'));
          await emailField.clear(); 
          await emailField.sendKeys(updatedEmail); 

        } catch (error) {
          throw error;
        }
        const submitUpdateSuccess = await projectsPage.submitProjectForm();
        logResult('Test OK :Echec de modification - Email invalide');
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });

   /* it('Suppression d\'un projet', async function() {
      try {
        await driver.get(config.baseUrl);
        await loginPage.login(config.validEmail, config.validPassword);
        await driver.wait(until.urlContains('Dashboard'), 20000);
        const dashboardUrl = await driver.getCurrentUrl();
        const navigateSuccess = await projectsPage.navigateToProjects();
        const deleteProjectSuccess = await projectsPage.clickDeleteFirstProject();
       try {
          const successMessageXPath = "//div[contains(@class, 'alert-success') or contains(text(), 'supprimé avec succès')]";
          await driver.wait(until.elementLocated(By.xpath(successMessageXPath)), 5000);
        } catch (error) {
          console.log("Pas de message de confirmation trouvé, mais la suppression peut avoir réussi");
        }
        logResult('Test OK : Suppression de projet réussie');
      } catch (error) {
        logResult('Test KO : ' + error.message);
        throw error;
      }
    });*/
  });
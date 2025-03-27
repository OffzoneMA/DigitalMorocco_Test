const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const ProjectsDetailsPage = require('../pages/projectDetails.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const assert = require('assert');


describe('Tests d\'ajout de jalon à un projet', function () {
   let driver;
   let loginPage;
   let projectsPage;
   let projectsDetailsPage;

   beforeEach(async function() {
     driver = await new Builder().forBrowser('chrome').build();
     await driver.manage().window().maximize();
     loginPage = new LoginPage(driver);
     projectsDetailsPage = new ProjectsDetailsPage(driver);
   });

   afterEach(async function() {
     if (driver) {
       await driver.quit();
     }
   });

   it('Modification du projet - Ajouter un nouveau jalon', async function() {
     try {
       await driver.get(config.baseUrl);
       await loginPage.login(config.validEmail, config.validPassword);
       await driver.wait(until.urlContains('Dashboard'), 20000);
       const navigateSuccess = await projectsDetailsPage.navigateToProjects();
       const editProjectSuccess = await projectsDetailsPage.clickEditFirstProject();
     try {
         const addJalonSuccess = await projectsDetailsPage.clickAddJalon();
         const jalonName = "Jalon de test ";
         const jalonDate = "25/03/2025";
         const jalonDescription = "Description créée par test ";
        const formFilled = await projectsDetailsPage.fillJalonForm(jalonName, jalonDate, jalonDescription);
         if (!formFilled) {
           logResult('Test OK : Remplissage du formulaire de jalon');
           throw new Error('Impossible de remplir le formulaire de jalon');
         }
          const formSubmitted = await projectsDetailsPage.submitJalonForm();
         if (formSubmitted) {
           logResult('Test OK : Modification du projet - Ajouter un nouveau jalon');
         } else {
           logResult('Test KO :Modification du projet - Échec de la soumission du formulaire de jalon');
           throw new Error('Impossible de soumettre le formulaire de jalon');
         }

       } catch (error) {
         logResult('Test KO : Modification du projet - Ajouter un nouveau jalon', error.message);
         throw error;
       }
     } catch (error) {
       throw error;
     }
   });

   it('Échec de création de jalon - Champ nom vide', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const navigateSuccess = await projectsDetailsPage.navigateToProjects();
      const editProjectSuccess = await projectsDetailsPage.clickEditFirstProject();
      const addJalonSuccess = await projectsDetailsPage.clickAddJalon();
      const formFilled = await projectsDetailsPage.fillJalonForm('', '25/03/2025','');
      const formSubmitted = await projectsDetailsPage.submitJalonForm();

      try {
        const nameInput = await driver.findElement(By.css('input[placeholder="Nom de l\'étape clé"].shadow-inputBsError'));
         logResult('Test OK :Échec de création de jalon - Champ nom vide');
      } catch (error) {
        logResult('Test KO : Erreur Validation champ nom');
        throw new Error('Validation du champ nom a échoué');
      }
    } catch (error) {
      throw error;
    }
  });
  it('Échec de création de jalon - Champ date vide', async function() {     
    try {
       await driver.get(config.baseUrl);
       await loginPage.login(config.validEmail, config.validPassword);
       await driver.wait(until.urlContains('Dashboard'), 20000);
       const navigateSuccess = await projectsDetailsPage.navigateToProjects();
       const editProjectSuccess = await projectsDetailsPage.clickEditFirstProject();
       const addJalonSuccess = await projectsDetailsPage.clickAddJalon();
       const nameInput = await driver.findElement(By.css('input[name="name"]'));
       await nameInput.sendKeys('Jalon de test');
       const submitButton = await driver.findElement(By.css('button[type="submit"]'));
       await submitButton.click();
       await driver.wait(async () => {
           const dateInputContainer = await driver.findElements(By.css('div.border-errorColor'));           
           return dateInputContainer.length > 0;
       }, 10000);
       const dateInputContainer = await driver.findElement(By.css('div.border-errorColor'));
       const containerClasses = await dateInputContainer.getAttribute('class');       
       if (!containerClasses.includes('border-errorColor')) {
           throw new Error('Pas de bordure d\'erreur pour le champ de date');
       }
       
       logResult('Test OK : Échec de création de jalon - Champ date vide');
       
    } catch (error) {
       logResult('Test KO :Test de validation du champ date', false, error.message);
       throw error;
    }
});
  it('Échec de création de jalon - Tous les champs obligatoires vides', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const navigateSuccess = await projectsDetailsPage.navigateToProjects();
      const editProjectSuccess = await projectsDetailsPage.clickEditFirstProject();
      const addJalonSuccess = await projectsDetailsPage.clickAddJalon();      
      const formSubmitted = await projectsDetailsPage.submitJalonForm();
      const nameInput = await driver.findElement(By.xpath('//input[@placeholder="Nom de l\'étape clé"]'));
      const nameInputClasses = await nameInput.getAttribute('class');
      const nameInputContainer = await driver.findElement(By.xpath('//input[@placeholder="Nom de l\'étape clé"]/..'));
      const nameInputContainerClasses = await nameInputContainer.getAttribute('class');
      const dateInput = await driver.findElement(By.xpath('//input[@placeholder="Date d\'échéance"]'));
      const dateInputClasses = await dateInput.getAttribute('class');
      const dateInputContainer = await driver.findElement(By.xpath('//input[@placeholder="Date d\'échéance"]/..'));
      const dateInputContainerClasses = await dateInputContainer.getAttribute('class');
      

      const isNameError = nameInputClasses.includes('border-errorColor') || 
                          nameInputClasses.includes('shadow-inputBsError') ||
                          nameInputContainerClasses.includes('border-errorColor') || 
                          nameInputContainerClasses.includes('shadow-inputBsError');
      
      const isDateError = dateInputClasses.includes('border-errorColor') || 
                          dateInputClasses.includes('shadow-inputBsError') ||
                          dateInputContainerClasses.includes('border-errorColor') || 
                          dateInputContainerClasses.includes('shadow-inputBsError');
      
      assert(isNameError, 'Le champ nom devrait avoir une bordure rouge');
      assert(isDateError, 'Le champ date devrait avoir une bordure rouge');
      
      logResult('Test OK : Échec de création de jalon - Tous les champs obligatoires vides');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      logResult('Test KO : Erreur Test de validation de tous les champs', false, error.message);
      throw error;
    }
  });

  it('Vérification du bouton Annuler dans le formulaire de jalon', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 20000);

    const navigateSuccess = await projectsDetailsPage.navigateToProjects();
    const editProjectSuccess = await projectsDetailsPage.clickEditFirstProject();
    const addJalonSuccess = await projectsDetailsPage.clickAddJalon();
    const cancelSuccess = await projectsDetailsPage.cancelJalonForm();
    assert(cancelSuccess, 'L\'annulation du formulaire a échoué');

    try {
      await driver.findElement(By.xpath('//input[@placeholder="Nom de l\'étape clé"]'));
      assert.fail('Le formulaire ne devrait plus être présent');
    } catch (error) {
      logResult('Test OK : Vérification du bouton Annuler dans le formulaire de jalon');
    }
  } catch (error) {
    console.error('Erreur lors du test du bouton Annuler:', error);
    logResult('Test du bouton Annuler', false, error.message);
    throw error;
  }
});



});
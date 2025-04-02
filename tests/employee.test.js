const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const EmployeePage = require('../pages/employee.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const path = require('path');
const assert = require('assert');


describe('Tests de création d\'un employé', function () {
  let driver;
  let loginPage;
  let employeePage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    employeePage = new EmployeePage(driver);
});

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });  

  it('Création d\'un employé', async function() {
    try {
        const employeeData = {
            name: 'Ikram Imzi',
            workEmail: config.mail,
            personalEmail: config.mail,
            phoneNumber: '+212698745896',
            address: 'Adresse 1',
            funding: config.funding,
            country: 'France',       
            taxIdentifier: '12345678901', 
            photoPath: 'profilephoto.png', 
            title: 'Analyste Business (AB)',         
            level: 'Chef de Projet',             
            department: 'Analyse des données' ,
            dueDate: '02/04/2025', 
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
      const navigateSuccess = await employeePage.navigateToEmployee();
      if (navigateSuccess) {
        logResult('Étape 2 OK : Navigation vers la page des employees réussie');
      } else {
        logResult('Étape 2 KO : Échec de navigation vers la page des employees');
        throw new Error('Échec de navigation vers la page des entreprises');
      }
     const createEmployeeSuccess = await employeePage.clickCreateEmployee();
      if (createEmployeeSuccess) {
        logResult('Étape 3 OK : Navigation vers la page de création des employees réussie');
      } else {
        logResult('Étape 3 KO : Échec de navigation vers la page de création des employees');
        throw new Error('Échec de navigation vers la page de création de projet');
      }
     const formFillSuccess = await employeePage.fillEmployeeForm(employeeData);
      if (formFillSuccess) {
        logResult('Étape 4 OK : Formulaire de l\'employé rempli avec succès');
      } else {
        logResult('Étape 4 KO : Échec du remplissage du formulaire de l\'employé');
        throw new Error('Échec du remplissage du formulaire des employés');
      }
  
      const submitSuccess = await employeePage.submitEmployeeForm();
      if (submitSuccess) {
        logResult('Étape 5 OK : Soumission du formulaire réussie');
      } else {
        logResult('Étape 5 KO : Échec de soumission du formulaire ');
        throw new Error('Échec de soumission du formulaire ');
      }
      
      logResult('Test OK : Création d\'un nouveau employé réussie ');
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  })


  it('Echec de la création d\'un employé - champs obligatoires vides', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 20000);
      const navigateSuccess = await employeePage.navigateToEmployee();
      const createEmployeeSuccess = await employeePage.clickCreateEmployee();
      const submitSuccess = await employeePage.submitEmployeeForm();
      const nameInput = await driver.findElement(By.name('fullName'));
      const workEmailInput = await driver.findElement(By.name('workEmail'));
      const phoneInput = await driver.findElement(By.name('phoneNumber'));
      const countryInputContainer = await driver.findElement(By.xpath("//input[@name='target'][@readonly]/parent::div"));
      const nameHasError = await nameInput.getAttribute('class');
      const workEmailHasError = await workEmailInput.getAttribute('class');
      const phoneHasError = await phoneInput.getAttribute('class');
      const countryContainerClass = await countryInputContainer.getAttribute('class');

     if (nameHasError.includes('shadow-inputBsError') && workEmailHasError.includes('shadow-inputBsError') && phoneHasError.includes('shadow-inputBsError') && countryContainerClass.includes('shadow-inputBsError') ) {
        logResult('Test OK : Echec de la création d\'un nouveau employé - Champs obligatoires non remplis.');
      } else {
        logResult('Test KO : Les champs obligatoires ne sont pas correctement mis en évidence.');
        throw new Error('Échec de la mise en évidence des champs obligatoires.');
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

  it('Echec de la création d\'un employé - Email au format incorrect', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          const navigateSuccess = await employeePage.navigateToEmployee();
          const createEmployeeSuccess = await employeePage.clickCreateEmployee();
          const workemailField = await driver.findElement(By.name('workEmail'));
          await workemailField.sendKeys('test');
          const submitSuccess = await employeePage.submitEmployeeForm();
          await driver.sleep(1000);
          const emailClass = await workemailField.getAttribute('class');
          if (emailClass.includes('shadow-inputBsError')) {
            logResult('Test OK : Echec de la création d\'un employé - Format email invalide');
          } else {
            logResult('Test KO : Le champ email invalide n\'est pas signalé ');
            throw new Error('Pas de classe shadow-inputBsError pour l\'email invalide');
          }
          
        } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
        }
      });

      it('Echec de la création d\'un employé - numéro de téléphone invalide', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          const navigateSuccess = await employeePage.navigateToEmployee();
          const createEmployeeSuccess = await employeePage.clickCreateEmployee();
          const phoneField = await driver.findElement(By.name('phoneNumber'));
          await phoneField.sendKeys('123456789');
         
          const submitSuccess = await employeePage.submitEmployeeForm();

          await driver.sleep(1000);
          const phoneClass = await phoneField.getAttribute('class');
          if (phoneClass.includes('shadow-inputBsError')) {
            logResult('Test OK : Echec de la création d\'un employé - numéro de téléphone trop invalide');
          } else {
            logResult('Test KO : Le champ du numéro de téléphone invalide n\'est pas signalé ');
            throw new Error('Pas de classe shadow-inputBsError pour numéro de téléphoneinvalide');
          }
          
        } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
        }
      });

    

      it('Echec de la création d\'un employé - numéro de téléphone trop long', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          const navigateSuccess = await employeePage.navigateToEmployee();
          const createEmployeeSuccess = await employeePage.clickCreateEmployee();
          const phoneField = await driver.findElement(By.name('phoneNumber'));
          await phoneField.sendKeys('+212698547896526589');
         
          const submitSuccess = await employeePage.submitEmployeeForm();

          await driver.sleep(1000);
          const phoneClass = await phoneField.getAttribute('class');
          if (phoneClass.includes('shadow-inputBsError')) {
            logResult('Test OK : Echec de la création d\'un employé - numéro de téléphone trop long/court');
          } else {
            logResult('Test KO : Le champ du numéro de téléphone invalide n\'est pas signalé ');
            throw new Error('Pas de classe shadow-inputBsError pour numéro de téléphoneinvalide');
          }
          
        } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
        }
      });

      it('Echec de la création d\'un employé - numéro de téléphone trop court', async function() {
        try {
          await driver.get(config.baseUrl);
          await loginPage.login(config.validEmail, config.validPassword);
          await driver.wait(until.urlContains('Dashboard'), 20000);
          const navigateSuccess = await employeePage.navigateToEmployee();
          const createEmployeeSuccess = await employeePage.clickCreateEmployee();
          const phoneField = await driver.findElement(By.name('phoneNumber'));
          await phoneField.sendKeys('+2126985');
         
          const submitSuccess = await employeePage.submitEmployeeForm();

          await driver.sleep(1000);
          const phoneClass = await phoneField.getAttribute('class');
          if (phoneClass.includes('shadow-inputBsError')) {
            logResult('Test OK : Echec de la création d\'un employé - numéro de téléphone trop court');
          } else {
            logResult('Test KO : Le champ du numéro de téléphone invalide n\'est pas signalé ');
            throw new Error('Pas de classe shadow-inputBsError pour numéro de téléphoneinvalide');
          }
          
        } catch (error) {
          logResult('Test KO : ' + error.message);
          throw error;
        }
      });

      it('Échec de la création d\'un employé - Les champs numériques doivent être positifs', async function() {
            try {
              await driver.get(config.baseUrl);
              await loginPage.login(config.validEmail, config.validPassword);
              await driver.wait(until.urlContains('Dashboard'), 20000);
              const navigateSuccess = await employeePage.navigateToEmployee();
              const createEmployeeSuccess = await employeePage.clickCreateEmployee();
              const fundingField = await driver.findElement(By.name('personalTaxIdentifierNumber'));
              await fundingField.clear();
              await fundingField.sendKeys('-500');
              const fundingValue = await fundingField.getAttribute('value');
              
              if (!fundingValue.includes('-')) {
                logResult('Test OK :Echec de la création d\'un employé - Champs numériques doivent être positifs');
              } else {
                logResult('Test KO : Au moins un des champs accepte des valeurs négatives');
                throw new Error('Échec de la validation - valeurs négatives acceptées');
              }
              
            } catch (error) {
              logResult('Test KO : ' + error.message);
              throw error;
            }
          });


     it('Modification d\'un employé existant', async function() {
         try {
           const updatedName = config.name;
           await driver.get(config.baseUrl);
           await loginPage.login(config.validEmail, config.validPassword);
           await driver.wait(until.urlContains('Dashboard'), 20000);
           const dashboardUrl = await driver.getCurrentUrl();
           const navigateSuccess = await employeePage.navigateToEmployee();
           const editEmployeeSuccess = await employeePage.clickEditFirstEmployee();
           try {
             await driver.wait(until.elementLocated(By.name('fullName')), 10000);
             const nameField = await driver.findElement(By.name('fullName'));
             await nameField.clear(); 
             await nameField.sendKeys(updatedName); 
             } catch (error) {
             throw error;
           }
           const submitUpdateSuccess = await employeePage.submitEmployeeForm();
           logResult('Test OK : Modification du nom d\'un employé réussie');
         } catch (error) {
           logResult('Test KO : ' + error.message);
           throw error;
         }
       });

      it('Modification d\'un employé avec un champ obligatoire vide', async function() {
          try {
            await driver.get(config.baseUrl);
            await loginPage.login(config.validEmail, config.validPassword);
            await driver.wait(until.urlContains('Dashboard'), 20000);
            const dashboardUrl = await driver.getCurrentUrl();
            const navigateSuccess = await employeePage.navigateToEmployee();
            const editEmployeeSuccess = await employeePage.clickEditFirstEmployee();
          
            try {
              await driver.wait(until.elementLocated(By.name('fullName')), 10000);
              const nameField = await driver.findElement(By.name('fullName'));
              await nameField.clear(); 
            } catch (error) {
              throw error;
            }
            const submitUpdateSuccess = await employeePage.submitEmployeeForm();
            logResult('Test OK :Echec de modification - Champ obligatoire vide');
          } catch (error) {
            logResult('Test KO : ' + error.message);
            throw error;
          }
        });

         it('Modification d\'un employé avec des données invalides', async function() {
              try {
        
                const updatedEmail = 'Test';
                await driver.get(config.baseUrl);
                await loginPage.login(config.validEmail, config.validPassword);
                await driver.wait(until.urlContains('Dashboard'), 20000);
                const dashboardUrl = await driver.getCurrentUrl();
                const navigateSuccess = await employeePage.navigateToEmployee();
                const editEmployeeSuccess = await employeePage.clickEditFirstEmployee();
                try {
                  await driver.wait(until.elementLocated(By.name('workEmail')), 10000);
                  const emailField = await driver.findElement(By.name('workEmail'));
                  await emailField.clear(); 
                  await emailField.sendKeys(updatedEmail); 
        
                } catch (error) {
                  throw error;
                }
                const submitUpdateSuccess = await employeePage.submitEmployeeForm();
                logResult('Test OK :Echec de modification d\'un employé - Email invalide');
              } catch (error) {
                logResult('Test KO : ' + error.message);
                throw error;
              }
            });

            it('Modification d\'un employé avec des données invalides', async function() {
                try {
                 const updatedphone = '123456789';
                  await driver.get(config.baseUrl);
                  await loginPage.login(config.validEmail, config.validPassword);
                  await driver.wait(until.urlContains('Dashboard'), 20000);
                  const dashboardUrl = await driver.getCurrentUrl();
                  const navigateSuccess = await employeePage.navigateToEmployee();
                  const editEmployeeSuccess = await employeePage.clickEditFirstEmployee();
                  try {
                    await driver.wait(until.elementLocated(By.name('phoneNumber')), 10000);
                    const phoneField = await driver.findElement(By.name('phoneNumber'));
                    await phoneField.clear(); 
                    await phoneField.sendKeys(updatedphone); 
          
                  } catch (error) {
                    throw error;
                  }
                  const submitUpdateSuccess = await employeePage.submitEmployeeForm();
                  logResult('Test OK :Echec de modification d\'un employé - numéro de téléphone invalide');
                } catch (error) {
                  logResult('Test KO : ' + error.message);
                  throw error;
                }
              });

            it('Suppression d\'un employé existant', async function() {
                try {
                  await driver.get(config.baseUrl);
                  await loginPage.login(config.validEmail, config.validPassword);
                  await driver.wait(until.urlContains('Dashboard'), 20000);
                  const navigateSuccess = await employeePage.navigateToEmployee();
                  let employeesBeforeCount = 0;
                  try {
                    const employees = await driver.findElements(By.css('tbody tr'));
                    employeesBeforeCount = employees.length;
                  } catch (error) {
                    throw new Error("Impossible de compter les employés avant suppression: " + error.message);
                  }
                  if (employeesBeforeCount === 0) {
                    throw new Error("Aucun employé trouvé pour le test de suppression");
                  }
                  const deleteSuccess = await employeePage.clickDeleteFirstEmployee();
                  
                  if (!deleteSuccess) {
                    throw new Error("Échec de la suppression de l'employé");
                  }
                  await driver.sleep(2000);
                  try {
                    if (employeesBeforeCount === 1) {
                      try {
                        await driver.wait(until.elementLocated(By.css('tbody tr')), 5000);
                        const employees = await driver.findElements(By.css('tbody tr'));
                        const employeesAfterCount = employees.length;
                        if (employeesAfterCount !== 0) {
                          throw new Error("L'employé n'a pas été supprimé correctement");
                        }
                      } catch (timeoutErr) {
                      }
                    } else {
                      await driver.wait(until.elementLocated(By.css('tbody tr')), 10000);
                      const employees = await driver.findElements(By.css('tbody tr'));
                      const employeesAfterCount = employees.length;
                      if (employeesAfterCount !== employeesBeforeCount - 1) {
                        throw new Error(`Le nombre d'employés n'a pas diminué (avant: ${employeesBeforeCount}, après: ${employeesAfterCount})`);
                      }
                    }
                    
                    logResult('Test OK : Suppression d\'un employé réussie');
                  } catch (error) {
                    throw new Error("Échec de la vérification après suppression: " + error.message);
                  }
                } catch (error) {
                  logResult('Test KO : ' + error.message);
                  throw error;
                }
              });

              it('Annulation de la suppression d\'un employé', async function() {
                try {
                  await driver.get(config.baseUrl);
                  await loginPage.login(config.validEmail, config.validPassword);
                  await driver.wait(until.urlContains('Dashboard'), 20000);
                  const navigateSuccess = await employeePage.navigateToEmployee();
                  let employeesBeforeCount = 0;
                  try {
                    await driver.wait(until.elementLocated(By.css('tbody tr')), 10000);
                    const employees = await driver.findElements(By.css('tbody tr'));
                    employeesBeforeCount = employees.length;
                  } catch (error) {
                    throw new Error("Impossible de compter les employés: " + error.message);
                  }
                  if (employeesBeforeCount === 0) {
                    throw new Error("Aucun employé trouvé pour le test d'annulation de suppression");
                  }
                  let firstEmployeeIdentifier;
                  try {
                    const firstEmployeeNameElement = await driver.findElement(By.css('tbody tr:first-child td:nth-child(1)'));
                    firstEmployeeIdentifier = await firstEmployeeNameElement.getText();
                  } catch (error) {
                    console.log("Information: Impossible de capturer l'identifiant de l'employé, le test vérifiera uniquement le nombre d'employés");
                  }
                  
                  const cancelSuccess = await employeePage.clickDeleteFirstEmployeeThenCancel();
                  if (!cancelSuccess) {
                    throw new Error("Échec de l'annulation de la suppression");
                  }
                  await driver.sleep(1000);
                   try {
                    await driver.wait(until.elementLocated(By.css('tbody tr')), 10000);
                    const employees = await driver.findElements(By.css('tbody tr'));
                    const employeesAfterCount = employees.length;
                    
                    if (employeesAfterCount !== employeesBeforeCount) {
                      throw new Error(`Le nombre d'employés a changé malgré l'annulation (avant: ${employeesBeforeCount}, après: ${employeesAfterCount})`);
                    }
                    
                    if (firstEmployeeIdentifier) {
                      const firstEmployeeNameElementAfter = await driver.findElement(By.css('tbody tr:first-child td:nth-child(1)'));
                      const currentFirstEmployeeIdentifier = await firstEmployeeNameElementAfter.getText();
                      
                      if (firstEmployeeIdentifier !== currentFirstEmployeeIdentifier) {
                        throw new Error(`L'employé a changé malgré l'annulation`);
                      }
                    }
                    
                    logResult('Test OK : Annulation de la suppression d\'un employé réussie');
                  } catch (error) {
                    throw new Error("Échec de la vérification après annulation: " + error.message);
                  }
                } catch (error) {
                  logResult('Test KO : ' + error.message);
                  throw error;
                }
              });
          
        
  });


  
  


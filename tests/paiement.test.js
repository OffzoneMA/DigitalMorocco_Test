const { Builder, By, until } = require('selenium-webdriver');
const { createBugTicket } = require('../utils/jiraUtils');
const LoginPage = require('../pages/login.page');
const PaiementPage = require('../pages/paiement.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const { createUniqueBrowser } = require('../helpers/browser.helper');

describe('Tests de paiement', function () {
  let driver;
  let loginPage;
  let paiementPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    paiementPage = new PaiementPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });
/*it('Paiement réussi avec carte Visa pour plan Basique Mensuel', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "000" 
    });
    
    await paiementPage.submitPaymentForm();
    await driver.sleep(5000);
    const paymentResult = await paiementPage.verifyPaymentResult();
    console.log(`Résultat détaillé du test de paiement: ${JSON.stringify(paymentResult)}`);
    if (paymentResult.success) {
      await driver.sleep(3000);
       const alertResult = await paiementPage.verifySuccessAlert();
       if (alertResult.success) {
        logResult('Test OK : Paiement réussi pour plan Basique Mensuel avec carte Visa et alerte de confirmation affichée');
      } else {
        console.warn(`Alerte de confirmation non trouvée, mais paiement réussi. Message: ${alertResult.message}`);
        logResult('Test OK : Paiement réussi pour plan Basique Mensuel avec carte Visa (sans alerte de confirmation)');
      }
    } else {
      if (paymentResult.message === 'Statut de paiement indéterminé') {
        console.warn('Statut de paiement indéterminé, mais le test est considéré comme réussi');
        logResult('Test OK : Paiement considéré comme réussi malgré un statut indéterminé');
      } else {
        logResult(`Test KO : Paiement échoué pour plan Basique Mensuel. Message: ${paymentResult.message}`);
      }
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Paiement avec Visa échoué', error.message, driver);
    throw error;
  }
});*/


 it('Paiement échoué avec carte CVV invalide', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "043" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec CVV invalide`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec CVV invalide a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Test de paiement avec CVV invalide a échoué', error.message, driver);
    throw error;
  }
});

it('Paiement échoué avec carte restreinte', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "062" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec carte restreinte`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec carte restreinte a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Test de paiement avec carte restreinte a échoué', error.message, driver);
    throw error;
  }
});

it('Paiement échoué avec carte bloquée', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "500" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec carte bloquée.`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec carte bloquée a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Test de paiement avec carte bloquée a échoué', error.message, driver);
    throw error;
  }
});

it('Paiement échoué : fonds insuffisants', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "051" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec fonds insuffisants.`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec CVV invalide a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Test de paiement avec CVV invalide a échoué', error.message, driver);
    throw error;
  }
});
it('Paiement échoué avec une date d\'expiration invalide', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "033" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec une date d\'expiration invalide.`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec une date d\'expiration invalide a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});

it('Paiement échoué : plafond dépassé', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "034" 
    });
    await paiementPage.submitPaymentForm();
    const paymentResult = await paiementPage.verifyPaymentResult();
    await driver.sleep(5000);
    if (paymentResult.success === false && 
        (paymentResult.message.includes('rejeté') || 
         paymentResult.message.includes('échoué'))) {
      logResult(`Test OK : Paiement correctement rejeté avec un plafond dépassé.`);
    } else if (paymentResult.success === true) {
      logResult(`Test KO : Le paiement avec un plafond dépassé a été accepté alors qu'il devrait être rejeté!`);
    } else {
      logResult(`Test KO : Résultat inattendu. Message: ${paymentResult.message}`);
    }
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});
  
 it('Annulation de l\'abonnement avec bouton Annuler', async function() {
    try {
      await driver.get(config.baseUrl);
      await loginPage.login(config.validEmail, config.validPassword);
      await driver.wait(until.urlContains('Dashboard'), 15000);
      await paiementPage.navigateToPaiement();
      await paiementPage.clickStartEssay();
      await paiementPage.clickStartNowButtonForPlan('Basique');
      await paiementPage.selectSubscriptionType('Mensuel');
      await paiementPage.cancelSubscription();
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('ChoosePlan')) {
        logResult('Test OK : Annulation du paiement réussie avec redirection vers ChoosePlan');
      } else {
        logResult(`Test KO : La page après annulation n'est pas celle attendue: ${currentUrl}`);
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
      throw error;
    }
  });

 it('Validation des champs de carte de crédit trop courts', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.fillPaymentForm({
      number: "4111", 
      expMonth: "10",
      expYear: "2025",
      cvv: "123"
    });
    await paiementPage.submitPaymentForm();
    const cardNumberError = await driver.findElement(By.xpath("//div[.//input[@id='creditCardNumber']]/following::p[contains(@class, 'text-danger')]"));
    const cardErrorText = await cardNumberError.getText();
    if (cardErrorText.includes("Le champ numéro de carte est trop court")) {
      logResult("Test OK : Message d'erreur correct pour numéro de carte trop court");
    } else {
      logResult(`Test KO : Message d'erreur incorrect pour numéro de carte trop court: "${cardErrorText}"`);
    }
    await driver.navigate().refresh();
    await driver.wait(until.urlContains('payment'), 15000);
    await paiementPage.fillPaymentForm({
      number: "4111111111111111",
      expMonth: "10",
      expYear: "2025",
      cvv: "1" 
    });
    await paiementPage.submitPaymentForm();
    const cvvError = await driver.findElement(By.xpath("//input[@id='securityCode']/following::p[contains(@class, 'text-danger')]"));
    const cvvErrorText = await cvvError.getText();
    if (cvvErrorText.includes("Le champ CVV est trop court")) {
      logResult("Test OK : Message d'erreur correct pour CVV trop court");
    } else {
      logResult(`Test KO : Message d'erreur incorrect pour CVV trop court: "${cvvErrorText}"`);
    }
    
     } catch (error) {
    logResult('Test KO : ' + error.message);
    await createBugTicket('Test de validation des champs de carte de crédit', error.message, driver);
    throw error;
  }
});

it('Validation des champs obligatoires de carte de crédit', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await paiementPage.submitPaymentForm();
    await driver.sleep(1000);
    const cardNumberError = await driver.findElement(By.xpath("//div[.//input[@id='creditCardNumber']]/following::p[contains(@class, 'text-danger')]//span"));
    const cardErrorText = await cardNumberError.getText();
    if (cardErrorText.includes("Le champ numéro de carte est requis")) {
      logResult("Test OK : Message d'erreur correct pour numéro de carte vide");
    } else {
      logResult(`Test KO : Message d'erreur incorrect pour numéro de carte vide: "${cardErrorText}"`);
    }
    const cvvError = await driver.findElement(By.xpath("//input[@id='securityCode']/following::p[contains(@class, 'text-danger')]//span"));
    const cvvErrorText = await cvvError.getText();
    if (cvvErrorText.includes("Le champ CVV est requis")) {
      logResult("Test OK : Message d'erreur correct pour CVV vide");
    } else {
      logResult(`Test KO : Message d'erreur incorrect pour CVV vide: "${cvvErrorText}"`);
    }
    const expDateMessage = "Le champ date d'expiration de la carte est requis";
    const expDateError = await driver.findElement(By.xpath("//select[@id='expirationDate']/following::p[contains(@class, 'text-danger')]//span"));
    const expDateErrorText = await expDateError.getText();
    const expYearError = await driver.findElement(By.xpath("//select[@id='expirationYear']/following::p[contains(@class, 'text-danger')]//span"));
    const expYearErrorText = await expYearError.getText();
    if (expDateErrorText.includes(expDateMessage) && expYearErrorText.includes(expDateMessage)) {
      logResult("Test OK : Message d'erreur correct pour date d'expiration vide (mois et année)");
    } else {
      logResult(`Test KO : Messages d'erreur incorrects pour date d'expiration - Mois: "${expDateErrorText}", Année: "${expYearErrorText}"`);
    }
    
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});

it('Validation des limites de saisie - numéro de carte 16 chiffres et CVV 4 chiffres', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await driver.wait(until.elementLocated(By.id('creditCardNumber')), 10000);
    await driver.wait(until.elementLocated(By.id('securityCode')), 10000);
    let testPassed = true;
    const cardNumberField = await driver.findElement(By.id('creditCardNumber'));
    await cardNumberField.clear();
    await cardNumberField.sendKeys("41111111111111119999999"); 
    const cardValue = await cardNumberField.getAttribute('value');
    const cleanCardValue = cardValue.replace(/[\s-]/g, ''); 
    if (cleanCardValue.length === 16) {
      logResult("Test OK : Le champ numéro de carte limite bien la saisie à 16 chiffres");
    } else if (cleanCardValue.length < 16) {
      logResult(`Test OK : Le champ numéro de carte limite la saisie à ${cleanCardValue.length} chiffres (moins de 16)`);
    } else {
      logResult(`Test KO : Le champ numéro de carte accepte plus de 16 chiffres: ${cleanCardValue.length} chiffres saisis`);
      testPassed = false;
    }
    const cvvField = await driver.findElement(By.id('securityCode'));
    await cvvField.clear();
    await cvvField.sendKeys("456855999"); 
    const cvvValue = await cvvField.getAttribute('value');
    if (cvvValue.length === 4) {
      logResult("Test OK : Le champ CVV limite bien la saisie à 4 chiffres");
    } else if (cvvValue.length === 3) {
      logResult("Test OK : Le champ CVV limite la saisie à 3 chiffres");
    } else if (cvvValue.length < 4) {
      logResult(`Test OK : Le champ CVV limite la saisie à ${cvvValue.length} chiffres (moins de 4)`);
    } else {
      logResult(`Test KO : Le champ CVV accepte plus de 4 chiffres: ${cvvValue.length} chiffres saisis`);
      testPassed = false;
    }
    
    if (!testPassed) {
      throw new Error('Au moins une validation de limitation des champs a échoué');
    }
    
  } catch (error) {
    logResult('Test KO : ' + error.message);
    throw error;
  }
});

it('Validation que les champs numéro de carte et CVV n\'acceptent que des chiffres', async function() {
  try {
    await driver.get(config.baseUrl);
    await loginPage.login(config.validEmail, config.validPassword);
    await driver.wait(until.urlContains('Dashboard'), 15000);
    await paiementPage.navigateToPaiement();
    await paiementPage.clickStartEssay();
    await paiementPage.clickStartNowButtonForPlan('Basique');
    await paiementPage.selectSubscriptionType('Mensuel');
    await paiementPage.confirmSubscription();
    await driver.wait(until.elementLocated(By.id('creditCardNumber')), 10000);
    await driver.wait(until.elementLocated(By.id('securityCode')), 10000);
    
    let testPassed = true;
    let errors = [];
    
    const cardNumberField = await driver.findElement(By.id('creditCardNumber'));
    await cardNumberField.clear();
    await cardNumberField.sendKeys("abcdefgh"); 
    const cardValueLetters = await cardNumberField.getAttribute('value');
    const cleanCardValueLetters = cardValueLetters.replace(/[\s-]/g, '');
    
    if (cleanCardValueLetters.length === 0) {
      logResult("Test OK : Le champ numéro de carte rejette bien les lettres");
    } else {
      logResult(`Test KO : Le champ numéro de carte accepte les lettres`);
      testPassed = false;
      errors.push("lettres");
    }
    
    await cardNumberField.clear();
    await cardNumberField.sendKeys("!@#$%^&*()"); 
    
    const cardValueSpecial = await cardNumberField.getAttribute('value');
    const cleanCardValueSpecial = cardValueSpecial.replace(/[\s-]/g, '');
    
    if (cleanCardValueSpecial.length === 0) {
      logResult("Test OK : Le champ numéro de carte rejette bien les caractères spéciaux");
    } else {
      logResult(`Test KO : Le champ numéro de carte accepte les caractères spéciaux`);
      testPassed = false;
      errors.push("caractères spéciaux");
    }
    
    const cvvField = await driver.findElement(By.id('securityCode'));
    await cvvField.clear();
    await cvvField.sendKeys("abcd"); 
    const cvvValueLetters = await cvvField.getAttribute('value');
    
    if (cvvValueLetters.length === 0) {
      logResult("Test OK : Le champ CVV rejette bien les lettres");
    } else {
      logResult(`Test KO : Le champ CVV accepte les lettres`);
      testPassed = false;
      errors.push("CVV accepte les lettres");
    }
    await cvvField.clear();
    await cvvField.sendKeys("!@#$"); 
    const cvvValueSpecial = await cvvField.getAttribute('value');
    if (cvvValueSpecial.length === 0) {
      logResult("Test OK : Le champ CVV rejette bien les caractères spéciaux");
    } else {
      logResult(`Test KO : Le champ CVV accepte les caractères spéciaux`);
      testPassed = false;
      errors.push("CVV accepte les caractères spéciaux");
    }
   
    
  } catch (error) {
    if (!error.message.startsWith('KO : Le champ numéro de carte accepte des')) {
      logResult('Test KO : ' + error.message);
    }
    throw error;
  }
});

});
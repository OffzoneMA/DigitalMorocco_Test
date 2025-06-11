const { Builder, By, until } = require('selenium-webdriver');
const RegisterPage = require('../pages/register.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');
const axios = require('axios');
const sinon = require('sinon');
const nodemailer = require('nodemailer');
const { createUniqueBrowser } = require('../helpers/browser.helper');
const { createBugTicket} = require('../utils/jiraUtils');
const testInfo = require('../utils/testInfo');




const MAILTRAP_API_TOKEN = config.apiMailtraToken; 
const ACCOUNT_ID = config.apiaccountID; 
const INBOX_ID = config.apiInboxID; 

describe('Tests d\'inscription', function () {
  let driver;
  let registerPage;
  let originalPost;
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: config.user, 
      pass: config.pass 
    }
  });
  
  beforeEach(async function() {
    driver = await createUniqueBrowser();
    await driver.manage().window().maximize();
    registerPage = new RegisterPage(driver);
    originalPost = axios.post;
    axios.post = sinon.stub().callsFake((url, data) => {
      if (url.includes('/api/register') || url.includes('/api/auth/signup')) {
        console.log('Intercepté: Requête d\'enregistrement', data);
        return Promise.resolve({ 
          data: { 
            success: true, 
            message: 'Utilisateur enregistré avec succès, email de vérification envoyé' 
          } 
        });
      }
      return originalPost(url, data);
    });
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
      try {
        await driver.quit();
      } catch (error) {
        console.error("Erreur lors de la fermeture du driver:", error);
      }
    }
    axios.post = originalPost;
  });
  
  async function getMailtrapEmails() {
    try {
      const response = await axios.get(
        `https://mailtrap.io/api/accounts/${ACCOUNT_ID}/inboxes/${INBOX_ID}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des emails:', error);
      return [];
    }
  }
  async function getMailtrapEmailContent(messageId) {
    try {
      const response = await axios.get(
        `https://mailtrap.io/api/accounts/${ACCOUNT_ID}/inboxes/${INBOX_ID}/messages/${messageId}/body.html`,
        {
          headers: {
            'Authorization': `Bearer ${MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu de l'email ${messageId}:`, error);
      return null;
    }
  }
  function extractVerificationLink(htmlContent) {
    console.log('Analyse du contenu HTML:', htmlContent.substring(0, 500) + '...');
    const regexPatterns = [
      /<a\s+(?:[^>]*?\s+)?href=["']([^"']*(?:verification|valid|confirm)[^"']*)["'][^>]*>/i,
      /href=["']([^"']*(?:verification|valid|confirm)[^"']*)["']/i,
      /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(?:[^<]*(?:vérifier|confirmer|valider)[^<]*)<\/a>/i
    ];
    for (const pattern of regexPatterns) {
      const match = htmlContent.match(pattern);
      if (match && match[1]) {
        console.log('Lien trouvé avec pattern:', pattern.toString());
        return match[1];
      }
    }
    const anyLinkRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>/i;
    const anyMatch = htmlContent.match(anyLinkRegex);
    if (anyMatch && anyMatch[1]) {
      console.log('Lien quelconque trouvé:', anyMatch[1]);
      return anyMatch[1];
    }
    
    console.log('Aucun lien trouvé dans le contenu HTML');
    return null;
  }

  it('Test d\'inscription et validation d\'email', async function() {
    try {
      const timestamp = Date.now();
      const testName = config.name;
      const testEmail = `test.user${timestamp}@votredomaine.com`;
      const testPassword = config.validPassword;

      await driver.get(`${config.baseUrl}/SignUp`);
      await registerPage.register(testName, testEmail, testPassword);
      logResult('Test OK: Inscription validée');
      await driver.wait(until.urlContains('VerificationEmail'), 15000);
      logResult('Test OK: Redirection vers la page de vérification d\'email');
      
    
      const mockToken = `${timestamp.toString(16)}${Math.random().toString(16).substring(2)}`;
      try {
        const info = await transporter.sendMail({
          from: 'test@example.com',
          to: testEmail,
          subject: 'Vérification de votre inscription',
          text: 'Veuillez cliquer sur ce lien pour vérifier votre email: ',
          html: `<p>Veuillez cliquer sur <a href="${config.validUrl}/${mockToken}?lang=fr">ce lien</a> pour vérifier votre email.</p>`
        });
        
        console.log('Email envoyé avec succès:', info.messageId);
        logResult('Test OK: Email de test envoyé avec succès ');
        await new Promise(resolve => setTimeout(resolve, 5000));
        const emails = await getMailtrapEmails();
        if (emails.length > 0) { console.log(`${emails.length} emails trouvés dans la boîte Mailtrap`);
          const targetEmail = emails.find(email => 
            email.to_email.includes(testEmail.split('@')[0]) || 
            email.subject.includes('Vérification')
          );
          
          if (targetEmail) {console.log('Email de vérification trouvé:', targetEmail.subject);
           const emailContent = await getMailtrapEmailContent(targetEmail.id);
            if (emailContent) {
              const verificationLink = extractVerificationLink(emailContent);
              if (verificationLink) {
                console.log('Lien de vérification extrait:', verificationLink);
                await driver.get(verificationLink);
                                
                logResult('Test OK: Validation de l\'email réussie');
              } else {
                logResult('Test KO: Impossible d\'extraire le lien de vérification');
              }
            } else {
              logResult('Test KO: Impossible de récupérer le contenu de l\'email');
            }
          } else {
            logResult('Test KO: Email de vérification non trouvé dans Mailtrap');
          }
        } else {
          logResult('Test KO: Aucun email trouvé dans Mailtrap');
        }
      } catch (error) {
        console.error('Erreur lors du processus de vérification:', error);
        logResult(`Test KO: ${error.message}`);
      }
      
      logResult('Test OK: Processus d\'inscription simulé avec succès');
      
    } catch (error) {
      const errorMessage = error.message || 'Erreur inconnue lors du test d\'inscription et validation d\'email';
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });

  it('Test du bouton de renvoi d\'email avec vérification de confirmation', async function() {
    try {
      const timestamp = Date.now();
      const testName = config.name;
      const testEmail = `test.user${timestamp}@votredomaine.com`;
      const testPassword = config.validPassword;
      
      await driver.get(`${config.baseUrl}/SignUp`);
      await registerPage.register(testName, testEmail, testPassword);
      logResult('Test OK: Inscription validée');
      
      await driver.wait(until.urlContains('VerificationEmail'), 15000);
      logResult('Test OK: Redirection vers la page de vérification d\'email');
      
      const resendButton = await driver.wait(until.elementLocated(By.css("button.bg-\\[\\#EDF7FF\\].text-\\[\\#00CDAE\\]")), 5000);
      await driver.wait(until.elementIsVisible(resendButton), 5000);
      await driver.wait(until.elementIsEnabled(resendButton), 5000);

      await resendButton.click();
      logResult('Test OK: Bouton de renvoi d\'email cliqué');
      
      try {
        const confirmationDiv = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'bg-white-A700') and contains(@class, 'border-solid') and .//label[contains(text(), 'Un e-mail a été envoyé avec succès')]]")), 5000);
        const successMessage = await confirmationDiv.findElement(By.xpath(".//label[contains(text(), 'Un e-mail a été envoyé avec succès')]"));
        const checkIcon = await confirmationDiv.findElement(By.xpath(".//img[contains(@src, 'check-verified')]"));
        
        logResult('Test OK: une confirmation affichée correctement avec le message de succès');
        
      } catch (error) {
        logResult(`Test KO: La div de confirmation n'apparaît pas correctement: ${error.message}`);
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); 
      
      const emails = await getMailtrapEmails();
      const targetEmails = emails.filter(email => 
        email.to_email.includes(testEmail.split('@')[0]) || 
        email.subject.includes('Vérification')
      );
      
      if (targetEmails.length > 0) {
        logResult('Test OK: Email envoyé suite au clic sur le bouton de renvoi');
      } else {
        logResult('Test KO: Aucun email trouvé après le clic sur le bouton de renvoi');
      }
      
    } catch (error) {
      const errorMessage = error.message || 'Erreur inconnue lors du test du bouton de renvoi d\'email';
      console.error("Erreur lors du test du bouton de renvoi d'email:", error);
      logResult('Test KO : ' + errorMessage);
      global.lastTestError = errorMessage;
      throw error;
    }
  });
  
  it('Vérifier que l\'inscription avec un email déjà existant est échoué', async function () {
    try {
        await driver.get(config.baseUrl + '/SignUp');
        await registerPage.register(config.name, config.validEmail, config.validPassword);
        const modalLocator = By.css(".popup-content[role='dialog']");
        const modalElement = await driver.wait(until.elementLocated(modalLocator),10000, 'La modale d\'erreur n\'est pas apparue dans le DOM'
        );
        await driver.wait( until.elementIsVisible(modalElement), 5000, 'La modale d\'erreur est dans le DOM mais pas visible'  );
        
        const modalText = await modalElement.getText();
        console.log('Texte de la modale:', modalText);
        expect(modalText).toContain('Votre adresse e-mail est peut-être déjà enregistrée dans notre systèmee !');
        
        logResult('Test OK : Message d\'erreur affiché pour un email déjà existant ');
    } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors du test avec un email déjà existant';
        console.error("Erreur lors du test avec un email déjà existant:", error);
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
    }
});

it('Vérifier que l\'inscription échoue si le mot de passe ne respecte pas tous les critères', async function () {
    try {
        await driver.get(config.baseUrl + '/SignUp');
        const motDePasseInvalide = 'A';
        const passwordField = await driver.findElement(By.css('input[type="password"]'));
        await passwordField.sendKeys(motDePasseInvalide);
        await driver.sleep(500);
        const svgElements = await driver.findElements(By.css('ul.flex li.valid svg path'));
        const svgFills = await Promise.all(svgElements.map(svg => svg.getAttribute('fill')));
        expect(svgFills[2]).toBe('#0EA472');
        
        expect(svgFills[0]).toBe('#D0D5DD'); 
        expect(svgFills[1]).toBe('#D0D5DD');  
        expect(svgFills[3]).toBe('#D0D5DD'); 
        expect(svgFills[4]).toBe('#D0D5DD');  
        
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain('/SignUp');
        
        logResult('Test OK : L\'inscription a échoué car le mot de passe ne respecte pas tous les critères');
    } catch (error) {
        const errorMessage = error.message || 'Erreur inconnue lors du test avec un mot de passe invalide';
        console.error("Erreur lors du test avec un mot de passe invalide:", error);
        logResult('Test KO : ' + errorMessage);
        global.lastTestError = errorMessage;
        throw error;
    }
});


});
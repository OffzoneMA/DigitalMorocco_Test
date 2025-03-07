const { Builder, By, until } = require('selenium-webdriver');
const loginPage = require('../pages/login.page');
const { logResult } = require('../utils/loggers');
const { validEmail, validPassword, invalidEmail, invalidPassword, baseUrl } = require('../config/config');

describe('Tests de connexion', function () {
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('Connexion réussie avec des identifiants valides', async function () {
    try {
      await driver.get(baseUrl);
      await loginPage.login(validEmail, validPassword);

      await driver.wait(until.urlContains('Dashboard_Investor'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('Dashboard_Investor')) {
        logResult('Test OK : Connexion réussie');
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
    }
  });

  it('Connexion échouée avec un email incorrect', async function () {
    try {
      await driver.get(baseUrl);
      await loginPage.login(invalidEmail, validPassword);
      const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
      if (errorMessage) {
        logResult('Test KO : Connexion échouée avec un email incorrect');
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
    }
  });

  it('Connexion échouée avec un mot de passe incorrect', async function () {
    try {
      await driver.get(baseUrl);
      await loginPage.login(validEmail, invalidPassword);
      const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
      if (errorMessage) {
        logResult('Test KO : Connexion échouée avec un mot de passe incorrect');
      }
    } catch (error) {
      logResult('Test KO : ' + error.message);
    }
  });

  it('Réinitialisation du mot de passe', async function () {
    try {
      await driver.get(baseUrl);
      const forgotPasswordLink = await driver.findElement(By.xpath("//label[contains(text(), 'mot de passe oublié') or contains(text(), 'Mot de passe oublié')]"));
      await driver.executeScript("arguments[0].click();", forgotPasswordLink);
      
      await driver.wait(until.urlContains('ForgotPassword'), 10000);
      await driver.findElement(By.name('email')).sendKeys(validEmail);
      const resetButton = await driver.findElement(By.css('div.bg-teal-A700 button[type="submit"]'));
      await resetButton.click();
      
      await driver.wait(until.urlContains('ResetPasswordEmail'), 10000);
      logResult('Test OK : Réinitialisation du mot de passe réussie');
    } catch (error) {
      logResult('Test KO : ' + error.message);
    }})
});

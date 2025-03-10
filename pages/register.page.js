const { By, until } = require('selenium-webdriver');

class RegisterPage {
  constructor(driver) {
    this.driver = driver;
  }

  
  async waitForPageLoad() {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000, 'Page n\'a pas chargé dans le délai');
    await this.driver.sleep(1000);
  }

  async nameField() {
    try {
      return await this.driver.wait(until.elementLocated(By.css('input[name="displayName"]')), 10000, 'Champ nom non trouvé');
    } catch (error) {
      console.error('Erreur lors de la recherche du champ nom:', error.message);
      throw error;
    }
  }
  async emailField() {
    try {
      return await this.driver.wait(until.elementLocated(By.css('input[name="email"]')), 10000, 'Champ email non trouvé');
    } catch (error) {
      console.error('Erreur lors de la recherche du champ email:', error.message);
      throw error;
    }
  }
  async passwordField() {
    try {
      return await this.driver.wait(until.elementLocated(By.css('input[name="password"]')), 10000, 'Champ mot de passe non trouvé');
    } catch (error) {
      console.error('Erreur lors de la recherche du champ mot de passe:', error.message);
      throw error;
    }
  }

  async checkboxTerms() {
    try {
      const termsLabel = await this.driver.findElement(By.css('label[for="acceptTerms"]'));
      await termsLabel.click();
    } catch (error) {
      console.error('Erreur lors de la sélection de la case acceptTerms:', error.message);
      throw error;
    }
  }
  
  async checkboxOffers() {
    try {
      const offersLabel = await this.driver.findElement(By.css('label[for="offers"]'));
      await offersLabel.click();
    } catch (error) {
      console.error('Erreur lors de la sélection de la case offers:', error.message);
      throw error;
    }
  }

  async signUpButton() {
    try {
      const button = await this.driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000, 'Bouton d\'inscription non trouvé');
      await this.driver.wait(until.elementIsEnabled(button), 10000, 'Bouton d\'inscription désactivé');
      await this.driver.wait(until.elementIsVisible(button), 10000, 'Bouton d\'inscription non visible');
      return button;
    } catch (error) {
      console.error('Erreur lors de la recherche du bouton d\'inscription:', error.message);
      throw error;
    }
  }

  async register(name, email, password) {
    if (!name || !email || !password) {
      throw new Error(`Identifiants incomplets: name=${name}, email=${email}, password=${password ? 'défini' : 'undefined'}`);
    }
   await this.waitForPageLoad();
    const nameEl = await this.nameField();
    const emailEl = await this.emailField();
    const passwordEl = await this.passwordField();
    await nameEl.clear();
    await emailEl.clear();
    await passwordEl.clear();
    await nameEl.sendKeys(name);
    await emailEl.sendKeys(email);
    await passwordEl.sendKeys(password);
    await this.checkboxTerms();
    await this.checkboxOffers(); 
    const signUpBtn = await this.signUpButton();
    await signUpBtn.click();
  }
}

module.exports = RegisterPage;

const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForPageLoad() {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000, 'Page n\'a pas chargé dans le délai ');
    
    await this.driver.sleep(1000);
  }

  async emailField() {
    try {
      return await this.driver.wait( until.elementLocated(By.css('input[name="email"]')),  10000,  'Champ email non trouvé' );
    } catch (error) {
      console.error('Erreur lors de la recherche du champ email:', error.message);
      throw error;
    }
  }

  async passwordField() {
    try {
      return await this.driver.wait( until.elementLocated(By.css('input[name="password"]')),  10000, 'Champ mot de passe non trouvé');
    } catch (error) {
      console.error('Erreur lors de la recherche du champ mot de passe:', error.message);
      throw error;
    }
  }

  async signInButton() {
    try {
      return await this.driver.wait( until.elementLocated(By.css('button.my-3 span')),  10000, 'Bouton de connexion non trouvé'  );
    } catch (error) {
      console.error('Erreur lors de la recherche du bouton de connexion:', error.message);
      throw error;
    }
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error(`Identifiants incomplets: email=${email}, password=${password ? 'défini' : 'undefined'}`);
    }
    await this.waitForPageLoad();
    const emailEl = await this.emailField();
    const passwordEl = await this.passwordField();
    await emailEl.clear();
    await passwordEl.clear();
    await emailEl.sendKeys(email);
    await passwordEl.sendKeys(password);
    const signInBtn = await this.signInButton();
    await signInBtn.click();
  }

  async clickForgotPassword() {
    try {
      const forgotPasswordLink = await this.driver.wait(until.elementLocated(By.xpath("//a[contains(@class, 'cursorpointer')]//label[contains(text(), 'Forgot Password') or contains(text(), 'Mot de passe oublié')]")), 10000,'Lien "Forgot Password/Mot de passe oublié" non trouvé' );
      const linkText = await forgotPasswordLink.getText();
      await this.driver.executeScript("arguments[0].click();", forgotPasswordLink);
      await this.driver.sleep(2000);
      const currentUrl = await this.driver.getCurrentUrl();
      await this.driver.wait(until.urlContains("ForgotPassword"), 10000,'Navigation vers la page de réinitialisation échouée' );
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  async enterEmailForReset(email) {
    try {
      const emailField = await this.driver.wait(until.elementLocated(By.name("email")),10000, 'Champ email pour réinitialisation non trouvé');
      await emailField.clear();
      await emailField.sendKeys(email);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  async submitResetRequest() {
    try {
      const submitButton = await this.driver.wait(until.elementLocated(By.css("button[type='submit'].font-dm-sans-medium")),10000,'Bouton "Reset Password" non trouvé'  );
      await submitButton.click();
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  async waitForConfirmationPage() {
    try {
      await this.driver.wait(async () => {const currentUrl = await this.driver.getCurrentUrl();return currentUrl.includes("ResetPasswordEmail"); }, 10000,"La page de confirmation de réinitialisation n'a pas chargé" );
      return true;
    } catch (error) {
      throw error;
    }
  }


}

module.exports = LoginPage;
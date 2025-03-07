const { By } = require('selenium-webdriver');

class LoginPage {
  get emailField() {
    return $('input[name="email"]');
  }

  get passwordField() {
    return $('input[name="password"]');
  }

  get signInButton() {
    return $('button.my-3 span');
  }

  async login(email, password) {
    await this.emailField.sendKeys(email);
    await this.passwordField.sendKeys(password);
    await this.signInButton.click();
  }
}

module.exports = new LoginPage();

class RegisterPage {
  constructor(driver) {
    this.driver = driver;
  }

  get displayNameField() {
    return this.driver.findElement(By.name("displayName"));
  }

  get emailField() {
    return this.driver.findElement(By.name("email"));
  }

  get passwordField() {
    return this.driver.findElement(By.name("password"));
  }

  get checkboxes() {
    return this.driver.findElements(By.css('input[type="checkbox"]'));
  }

  get signUpButton() {
    return this.driver.findElement(By.css('button[type="submit"]'));
  }

  async register(displayName, email, password) {
    await this.displayNameField.sendKeys(displayName);
    await this.emailField.sendKeys(email);
    await this.passwordField.sendKeys(password);
    
    // Cocher toutes les cases à cocher
    const checkboxElements = await this.checkboxes;
    for (const checkbox of checkboxElements) {
      await this.driver.executeScript("arguments[0].click();", checkbox);
      await this.driver.sleep(500); 
    }
    
    await this.signUpButton.click();
  }
}

module.exports = RegisterPage;

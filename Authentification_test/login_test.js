const { Builder, By, until } = require('selenium-webdriver');

async function login() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        await driver.get('https://test.v1-sic.digitalmorocco.net/');

        await driver.findElement(By.name('email')).sendKeys('elhajiikram01@gmail.com');
        await driver.findElement(By.name('password')).sendKeys('Test0123@');
        
        // Attente pour le bouton Sign In et clique dessus
     
        const signInButton = await driver.wait(until.elementIsVisible(await driver.findElement(By.css("button.my-3 span"))), 10000  );
        await signInButton.click();

      // Attendre et récupérer l'URL de redirection
    await driver.wait(until.urlContains('https://test.v1-sic.digitalmorocco.net/Dashboard_Investor'), 10000);
    const currentUrl = await driver.getCurrentUrl();
        console.log('Connexion réussie, redirection vers le dashboard');
        
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
    } finally {
        await driver.quit();
    }
}

login();



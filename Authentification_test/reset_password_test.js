const { Builder, By, until, Key } = require('selenium-webdriver');

async function resetPassword() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        
        await driver.get('https://test.v1-sic.digitalmorocco.net/');
        console.log('Page de connexion chargée');
        await driver.sleep(3000);
        console.log('Recherche du lien en français...');
        let forgotPasswordLink;
        
        try {
        
            forgotPasswordLink = await driver.findElement(By.xpath("//label[contains(text(), 'mot de passe oublié') or contains(text(), 'Mot de passe oublié')]") );
        } catch (e) {
            try {
               
                forgotPasswordLink = await driver.findElement(
                    By.xpath("//label[contains(text(), 'oublié')]")
                );
            } catch (e2) {
                try {
                
                    forgotPasswordLink = await driver.findElement(
                        By.xpath("//label[contains(text(), 'Forgot') or contains(text(), 'forgot') or contains(text(), 'Password')]")
                    );
                } catch (e3) {
                    console.log('Recherche par classe...');
                    forgotPasswordLink = await driver.findElement(By.css("a.cursorpointer"));
                }
            }
        }
        
        console.log('Lien "mot de passe oublié" trouvé');
        await driver.executeScript("arguments[0].click();", forgotPasswordLink);
        console.log('Clic sur le lien effectué');
        
        await driver.wait(until.urlContains('https://test.v1-sic.digitalmorocco.net/ForgotPassword'), 10000);
    const currentUrl = await driver.getCurrentUrl();
        await driver.sleep(3000);
       await driver.findElement(By.name('email')).sendKeys('elhajiikram01@gmail.com');
        const resetButton = await driver.findElement(By.css('div.bg-teal-A700 button[type="submit"]'));
        await resetButton.click();
       
       await driver.wait(until.urlContains('https://test.v1-sic.digitalmorocco.net/ResetPasswordEmail'), 10000);
        const currenteUrl = await driver.getCurrentUrl();
        console.log('reinitialisation du mot de passe réussie !');

 } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        
    } finally {
        await driver.quit();
        console.log('Test terminé');
    }
}

resetPassword();
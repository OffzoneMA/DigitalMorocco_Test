const { Builder, By, until, Key } = require('selenium-webdriver');

async function resetPassword() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Accéder à la page de connexion
        await driver.get('https://test.v1-sic.digitalmorocco.net/');
        console.log('Page de connexion chargée');

        // Attendre quelques secondes pour s'assurer que la page est complètement chargée
        await driver.sleep(3000);

        // Rechercher le lien en français "mot de passe oublié"
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
                    // Dernière option: chercher tous les liens
                    console.log('Recherche par classe...');
                    forgotPasswordLink = await driver.findElement(By.css("a.cursorpointer"));
                }
            }
        }
        
        console.log('Lien "mot de passe oublié" trouvé');
        
        // Cliquer sur le lien
        await driver.executeScript("arguments[0].click();", forgotPasswordLink);
        console.log('Clic sur le lien effectué');
        
        // Attendre que l'URL change
        await driver.wait(until.urlContains('https://test.v1-sic.digitalmorocco.net/ForgotPassword'), 10000);
    const currentUrl = await driver.getCurrentUrl();
        
        
   
        
        // Attendre que la page soit chargée
        await driver.sleep(3000);

        await driver.findElement(By.name('email')).sendKeys('elhajiikram01@gmail.com');
        const resetButton = await driver.findElement(By.css('div.bg-teal-A700 button[type="submit"]'));
        await resetButton.click();
        // Attendre et récupérer l'URL de redirection
       await driver.wait(until.urlContains('https://test.v1-sic.digitalmorocco.net/ResetPasswordEmail'), 10000);
        const currenteUrl = await driver.getCurrentUrl();
        console.log('reinitialisation du mot de passe réussie !');

 } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        
    } finally {
        // Fermer le navigateur
        await driver.quit();
        console.log('Test terminé');
    }
}

resetPassword();
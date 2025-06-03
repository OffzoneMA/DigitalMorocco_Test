const { By, until } = require('selenium-webdriver');

class NotificationPage {
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

  async notificationIcon() {
    try {
      // Essayer plusieurs sélecteurs possibles
      const selectors = [
        'div.relative.flex.p-1.rounded-full', // Sans bg-teal-401
        'div.relative.flex.bg-teal-401.p-1.rounded-full', // Avec bg-teal-401
        'div.relative.flex.rounded-full svg', // Cibler directement le SVG
        'svg[viewBox="0 0 512 512"]' // Cibler le SVG par son viewBox
      ];

      let iconElement = null;
      let lastError = null;

      for (const selector of selectors) {
        try {
          console.log(`Tentative avec le sélecteur: ${selector}`);
          iconElement = await this.driver.wait(until.elementLocated(By.css(selector)),3000 );
          break;
        } catch (error) {
          lastError = error;
          console.log(`Sélecteur ${selector} non trouvé, essai suivant...`);
        }
      }

      if (!iconElement) {
        throw new Error('Icône de notification non trouvée avec aucun sélecteur');
      }

      return iconElement;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'icône de notification:', error.message);
      throw error;
    }
  }

  async clickNotificationIcon() {
    try {
      await this.waitForPageLoad();
      const iconElement = await this.notificationIcon();
      await this.driver.wait(until.elementIsEnabled(iconElement),5000,'L\'icône de notification n\'est pas cliquable');
      await this.driver.executeScript('arguments[0].scrollIntoView(true);', iconElement);
      await this.driver.sleep(500);
      await iconElement.click();
      return true;
    } catch (error) {
      console.error('Erreur lors du clic sur l\'icône de notification:', error.message);
      throw error;
    }
  }

  async waitForNotificationPage() {
    try {
      await this.driver.wait(async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return currentUrl.toLowerCase().includes('notification');
      }, 10000, 'Navigation vers la page de notifications échouée');
      
      await this.waitForPageLoad();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'attente de la page de notifications:', error.message);
      throw error;
    }
  }

  async isNotificationIconVisible() {
    try {
      const selectors = [
        'div.relative.flex.p-1.rounded-full',
        'div.relative.flex.bg-teal-401.p-1.rounded-full',
        'div.relative.flex.rounded-full svg',
        'svg[viewBox="0 0 512 512"]'
      ];

      for (const selector of selectors) {
        try {
          const iconElement = await this.driver.findElement(By.css(selector));
          const isDisplayed = await iconElement.isDisplayed();
          if (isDisplayed) {
            console.log(`Icône trouvée et visible avec le sélecteur: ${selector}`);
            return true;
          }
        } catch (error) {
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = NotificationPage;
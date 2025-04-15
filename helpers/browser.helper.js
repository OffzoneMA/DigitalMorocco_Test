// helpers/browser.helper.js
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * @returns {WebDriver} Instance de navigateur configurée
 */
async function createUniqueBrowser() {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments(`--user-data-dir=/tmp/chrome-user-data-${uniqueId}`);
  
  if (process.env.CI === 'true') {
    options.addArguments('--headless');
  }
  
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

module.exports = {
  createUniqueBrowser
};
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createUniqueBrowser() {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments(`--user-data-dir=/tmp/chrome-unique-${uniqueId}`);
  
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

module.exports = {
  createUniqueBrowser
};
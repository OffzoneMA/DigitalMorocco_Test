const { Builder, By, until } = require('selenium-webdriver');
const LoginPage = require('../pages/login.page');
const ProjectsPage = require('../pages/project.page');
const ProjectsDetailsPage = require('../pages/projectDetails.page');
const { logResult } = require('../utils/loggers');
const config = require('../config/config');

describe('Tests d\'ajout de jalon à un projet', function () {
  let driver;
  let loginPage;
  let projectsPage;
  let projectsDetailsPage;

  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    loginPage = new LoginPage(driver);
    projectsPage = new ProjectsPage(driver);
    projectsDetailsPage = new ProjectsDetailsPage(driver);
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  
});
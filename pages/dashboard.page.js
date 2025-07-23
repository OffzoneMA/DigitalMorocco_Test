const {By, until} = require("selenium-webdriver");

class DashboardPage {
    constructor(driver) {
        this.driver = driver;
    }

    get createProjectButton() {
        return By.xpath('//button[contains(@class, "bg-blue-A400") and contains(text(), "Créer un projet")]');
    }
    get upgradeSubscriptionButton() {
        return By.xpath('//button[contains(@class, "bg-teal-A700") and contains(text(), "Mettre à niveau l\'abonnement")]');
    }

    get totalCreditsCard() {
        return By.xpath('//div[contains(@class, "hover:shadow-dashCard") and .//label[contains(text(), "Total des crédits")]]');
    }
     get TotalProjectsCard() {
        return By.xpath('//div[contains(@class, "hover:shadow-dashCard") and .//label[contains(text(), "Projets créés")]]');
    }
     get investorCard() {
        return By.xpath('//div[contains(@class, "hover:shadow-dashCard") and .//label[contains(text(), "Investisseurs")]]');
    }
     get eventCard() {
        return By.xpath('//div[contains(@class, "hover:shadow-dashCard") and .//label[contains(text(), "Événements")]]');
    }
     get companyCard() {
        return By.xpath('//div[contains(@class, "hover:shadow-dashCard") and .//label[contains(text(), "Mon entreprise")]]');
    }
    get lastRequestsSection() {
        return By.xpath('//div[contains(@class, "border-b") and .//label[contains(text(), "Dernières demandes")]]');
    }

     get lastActiveProjectSection() {
        return By.xpath('//div[contains(@class, "border-b") and .//label[contains(text(), "Dernier projet actif")]]');
    }
    get projectDetailsCard() {
        return By.xpath('//div[contains(@class, "hover:bg-blue-50") and contains(@class, "cursorpointer") and .//label[contains(text(), "Projet Test Modifié")]]');
    }

    async clickCreateProjectButton() {
        const button = await this.driver.wait(until.elementLocated(this.createProjectButton), 10000);
        await this.driver.wait(until.elementIsEnabled(button), 5000);
        await button.click();
    }
    async clickUpgradeSubscriptionButton() {
        const button = await this.driver.wait(until.elementLocated(this.upgradeSubscriptionButton), 10000);
        await this.driver.wait(until.elementIsEnabled(button), 5000);
        await button.click();
    }

    async clickTotalCreditsCard() {
        const card = await this.driver.wait(until.elementLocated(this.totalCreditsCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }
     async clickTotalProjectsCard() {
        const card = await this.driver.wait(until.elementLocated(this.TotalProjectsCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }
     async clickInvestorCard() {
        const card = await this.driver.wait(until.elementLocated(this.investorCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }
     async clickEventCard() {
        const card = await this.driver.wait(until.elementLocated(this.eventCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }
     async clickCompanyCard() {
        const card = await this.driver.wait(until.elementLocated(this.companyCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }

     async clickLastRequestsSection() {
        const section = await this.driver.wait(until.elementLocated(this.lastRequestsSection), 10000);
        await this.driver.wait(until.elementIsEnabled(section), 5000);
        await section.click();
    }

     async clickLastActiveProjectSection() {
        const section = await this.driver.wait(until.elementLocated(this.lastActiveProjectSection), 10000);
        await this.driver.wait(until.elementIsEnabled(section), 5000);
        await section.click();
    }

    async clickProjectDetailsCard() {
        const card = await this.driver.wait(until.elementLocated(this.projectDetailsCard), 10000);
        await this.driver.wait(until.elementIsEnabled(card), 5000);
        await card.click();
    }
}

module.exports = DashboardPage;
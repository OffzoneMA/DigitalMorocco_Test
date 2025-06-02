const {By, until} = require("selenium-webdriver");

class PaiementPage {
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

    async navigateToPaiement() {
        try {
            await this.driver.sleep(2000);
            let ParametresMenuTrigger;
            try {
                ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//li[.//span[contains(text(), 'Paramètres')]]")),  5000  );
            } catch (e) {
                try {
                    ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Paramètres')]")), 5000);
                } catch (e2) {
                    ParametresMenuTrigger = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(translate(text(), 'PARAMÈTRES', 'paramètres'), 'paramètres')]")), 5000,'Menu "Paramètres" non trouvé même après plusieurs tentatives'
                    );
                }
            }
            await ParametresMenuTrigger.click();
            await this.driver.sleep(1000); 
            const PaiementLink = await this.driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Abonnement et facturation')]")), 5000,'Lien "Abonnement et facturation" non trouvé' );
            await PaiementLink.click();
            await this.driver.wait(until.urlContains('Subscription'), 10000, 'Navigation vers la page des paiements échouée');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la navigation vers la page des paiements:', error);
            throw error;
        }
    }

  async clickStartEssay() {
    try {
        const xpath1 = "//button[contains(@class, 'bg-blue-A400') and contains(., 'Commencez votre essai gratuit')]";
        const xpath2 = "//button[contains(@class, 'bg-blue-A400') and @type='button']";
        let startEssayButton;
        try {
            startEssayButton = await this.driver.wait(until.elementLocated(By.xpath(xpath1)), 5000);
        } catch (e) {
            startEssayButton = await this.driver.wait(until.elementLocated(By.xpath(xpath2)), 5000, 'Bouton "Commencez votre essai gratuit" non trouvé');
        }
        
        await startEssayButton.click();
        await this.driver.wait(until.urlContains('ChoosePlan'), 10000, 'Navigation vers la page ChoosePlan échouée');
        await this.waitForPageLoad();
        return true;
    } catch (error) {
        console.error('Erreur lors du clic sur le bouton "Commencez votre essai gratuit":', error.message);
        throw error;
    }
}
    async getAllPlans() {
        try {
            await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Basique') or contains(text(), 'Standard') or contains(text(), 'Premium')]")), 10000, 'Plans non trouvés');
            const plans = await this.driver.findElements(By.xpath("//div[.//label[contains(text(), 'Basique') or contains(text(), 'Standard') or contains(text(), 'Premium')]]"));
            return plans;
        } catch (error) {
            console.error('Erreur lors de la récupération des plans:', error);
            throw error;
        }
    }

  async getPlanByName(planName) {
    try {        
        await this.driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Basique') or contains(text(), 'Standard') or contains(text(), 'Premium')]")), 10000, 'Aucun plan trouvé sur la page');
        let planElement;
        // Recherche précise par label 
        try {
            const labelXPath = `//label[contains(text(), '${planName}')]`;
            const labels = await this.driver.findElements(By.xpath(labelXPath));
            if (labels.length > 0) {
                for (let i = 0; i < labels.length; i++) {
                    const labelText = await labels[i].getText();                    
                    if (labelText.trim() === planName || labelText.includes(planName)) {
                        try {
                            for (let level = 1; level <= 5; level++) {
                                try {
                                    planElement = await labels[i].findElement(By.xpath(`./ancestor::div[contains(@class, 'border') or contains(@class, 'rounded')][${level}]`));
                                    return planElement;
                                } catch (e) {
                                }
                            }
                            planElement = await labels[i].findElement(By.xpath("./ancestor::div[3]"));
                            return planElement;
                            
                        } catch (e) {
                            console.log(` Impossible de trouver l'ancestor pour le label ${i}:`, e.message);
                        }
                    }
                }
            }
        } catch (e) {
            console.log(` échouée:`, e.message);
        }
        
       
    } catch (error) {
        console.error(`Erreur lors de la récupération du plan "${planName}":`, error);
        throw error;
    }
}

async clickStartNowButtonForPlan(planName) {
    try {        
        const planElement = await this.getPlanByName(planName);        
        let startButton;
        let buttonFound = false;
        
        if (!buttonFound) {
            try {
                startButton = await planElement.findElement(By.xpath(".//button[contains(text(), 'Commencez maintenant')]"));
                const buttonText = await startButton.getText();
                buttonFound = true;
            } catch (e) {
                console.log(` Pas de bouton "Commencez maintenant":`, e.message);
            }
        }
        
        await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", startButton);
        await this.driver.sleep(1000);
        await this.driver.wait(until.elementIsEnabled(startButton), 5000, 'Le bouton n\'est pas cliquable');
        await startButton.click();        
        await this.driver.sleep(2000); 
        await this.driver.wait(until.urlContains('subscribePlan'), 10000, 'Navigation vers la page de sélection du plan échouée');
        await this.waitForPageLoad();
        return true;
        
    } catch (error) {
        console.error(`ERREUR clickStartNowButtonForPlan pour "${planName}":`, error);
        throw error;
    }
}

    async selectSubscriptionType(type) {
        try {
            if (type !== 'Mensuel' && type !== 'Annuel') {
                throw new Error('Le type d\'abonnement doit être "Mensuel" ou "Annuel"');
            }
            
            const buttonXPath = `//button[.//span[contains(text(), '${type}')]]`;
            const button = await this.driver.wait(until.elementLocated(By.xpath(buttonXPath)), 10000, `Bouton "${type}" non trouvé`);
            await button.click();
            await this.driver.sleep(1000);
            
            return true;
        } catch (error) {
            console.error(`Erreur lors de la sélection du type d'abonnement "${type}":`, error);
            throw error;
        }
    }

    async confirmSubscription() {
        try {
            const confirmButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'bg-blue-A400') and contains(., 'Confirmer mon abonnement')]")), 10000, 'Bouton "Confirmer mon abonnement" non trouvé');
            await confirmButton.click();
            await this.driver.wait(until.urlContains('payzone.ma'), 15000, 'Navigation vers la page de paiement Payzone échouée');
            await this.waitForPageLoad();
            return true;
        } catch (error) {
            console.error('Erreur lors de la confirmation de l\'abonnement:', error);
            throw error;
        }
    }

    async fillPaymentForm(cardDetails = null) {
    try {
        if (!cardDetails) {
            cardDetails = this.testCards.visaEnrolled;
        }
        await this.driver.wait(until.urlContains('payzone.ma'), 10000, 'Page de paiement Payzone non trouvée');
        let paymentFrame = null;
        try {
            const frames = await this.driver.findElements(By.tagName('iframe'));
            if (frames.length > 0) {
                paymentFrame = frames[0];
                await this.driver.switchTo().frame(paymentFrame);
            }
        } catch (frameError) {
            console.log('No iframe found or error switching to iframe:', frameError);
        }
        await this.driver.wait(until.elementLocated(By.id('creditCardNumber')), 10000, 'Champ de numéro de carte non trouvé');
        const cardNumberField = await this.driver.findElement(By.id('creditCardNumber'));
        await cardNumberField.clear();
        await cardNumberField.sendKeys(cardDetails.number);
        const cvvField = await this.driver.findElement(By.id('securityCode'));
        await cvvField.clear();
        await cvvField.sendKeys(cardDetails.cvv);
        const expirationMonthSelect = await this.driver.findElement(By.id('expirationDate'));
        await expirationMonthSelect.click();
        const monthOption = await this.driver.findElement(By.xpath(`//select[@id='expirationDate']/option[@value='${cardDetails.expMonth}']`));
        await monthOption.click();
        const expirationYearSelect = await this.driver.findElement(By.id('expirationYear'));
        await expirationYearSelect.click();
        const yearOption = await this.driver.findElement(By.xpath(`//select[@id='expirationYear']/option[@value='${cardDetails.expYear}']`));
        await yearOption.click();
        try {
            const dataProtectionCheckbox = await this.driver.findElement(By.id('vpsDataProtection'));
            if (!await dataProtectionCheckbox.isSelected()) {
                await dataProtectionCheckbox.click();
            }
        } catch (checkboxError) {
            console.error('Erreur lors de la sélection de la case de protection des données:', checkboxError);
            throw checkboxError;
        }
        if (paymentFrame) {
            await this.driver.switchTo().defaultContent();
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors du remplissage du formulaire de paiement:', error);
        
        try {
            await this.driver.switchTo().defaultContent();
        } catch (switchError) {
            console.log('Erreur lors du retour au contexte principal:', switchError);
        }
        
        throw error;
    }
}

    async submitPaymentForm() {
        try {
            let inIframe = false;
            try {
                await this.driver.findElement(By.xpath("//button[contains(text(), 'payez maintenant')]"));
            } catch (e) {
                const frames = await this.driver.findElements(By.tagName('iframe'));
                if (frames.length > 0) {
                    await this.driver.switchTo().frame(frames[0]);
                    inIframe = true;
                }
            }
            const payButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'payez maintenant')]")), 10000, 'Bouton "payez maintenant" non trouvé');
            await payButton.click();
            if (inIframe) {
                await this.driver.switchTo().defaultContent();
            }
            await this.driver.sleep(5000);
            return true;
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire de paiement:', error);
            try {
                await this.driver.switchTo().defaultContent();
            } catch (switchError) {
                console.log('Erreur lors du retour au contexte principal:', switchError);
            }
            
            throw error;
        }
    }

 async verifyPaymentResult() {
    try {
        await this.driver.sleep(10000);
        const currentUrl = await this.driver.getCurrentUrl();
        const pageSource = await this.driver.getPageSource();
        
        let paymentStatus = {
            success: false,
            message: '',
            url: currentUrl
        };
        if (pageSource.includes('Votre demande de paiement a été autorisée') || 
            pageSource.includes('paiement réussi') ||
            pageSource.includes('payment successful')) {
            paymentStatus.success = true;
            paymentStatus.message = 'Paiement réussi - Message de confirmation affiché';
        }
        else if (currentUrl.includes('payment-sandbox.payzone.ma')) {
            await this.driver.wait(async () => {
                const updatedSource = await this.driver.getPageSource();
                return updatedSource.includes('rejected') || 
                       updatedSource.includes('declined') || 
                       updatedSource.includes('failed') ||
                       updatedSource.includes('rejeté') ||
                       updatedSource.includes('refusé');
            }, 15000).catch(() => {}); 
            const updatedSource = await this.driver.getPageSource();
            
            if (updatedSource.includes('rejected') || 
                updatedSource.includes('declined') || 
                updatedSource.includes('failed') ||
                updatedSource.includes('rejeté') ||
                updatedSource.includes('refusé')) {
                paymentStatus.success = false;
                paymentStatus.message = 'Paiement rejeté sur Payzone - Message de rejet détecté';
            } else {
                paymentStatus.success = false;
                paymentStatus.message = `Paiement probablement rejeté sur Payzone. Capture d'écran sauvegardée: ${screenshotPath}`;
            }
        }
        else if (
            pageSource.includes('Votre paiement a été rejeté') ||
            pageSource.includes('paiement a été rejeté') ||
            pageSource.toLowerCase().includes('votre paiement a été rejeté') ||
            pageSource.includes('payment rejected') ||
            pageSource.includes('payment declined') ||
            (pageSource.includes('29,90 MAD') && pageSource.includes('rejeté')) ||
            (pageSource.includes('REVENIR À DIGITALMOROCCO.NET') && 
             (pageSource.includes('rejeté') || pageSource.includes('rejete')))
        ) {
            paymentStatus.success = false;
            paymentStatus.message = 'Paiement rejeté - Message de rejet affiché';
            try {
                const possibleXPaths = [
                    "//span[contains(text(), 'rejeté')]",
                    "//div[contains(text(), 'rejeté')]",
                    "//p[contains(text(), 'rejeté')]",
                    "//h4[contains(text(), 'rejeté')]",
                    "//*[contains(text(), 'rejeté')]",
                    "//span[contains(text(), 'rejected')]",
                    "//div[contains(text(), 'rejected')]",
                    "//*[contains(text(), 'error')]",
                    "//*[contains(text(), 'declined')]"
                ];
                
                let errorMessage = "";
                for (const xpath of possibleXPaths) {
                    try {
                        const element = await this.driver.findElement(By.xpath(xpath));
                        errorMessage = await element.getText();
                        if (errorMessage && 
                           (errorMessage.includes('rejeté') || 
                            errorMessage.includes('rejected') || 
                            errorMessage.includes('declined') ||
                            errorMessage.includes('error'))) {
                            break;
                        }
                    } catch (e) {
                    }
                }
                
                if (errorMessage) {
                    paymentStatus.message += ` - Message exact: "${errorMessage}"`;
                }
            } catch (e) {
                console.warn('Impossible de récupérer le message d\'erreur exact:', e);
            }
        }
        else if (pageSource.includes('REVENIR À DIGITALMOROCCO.NET')) {
            paymentStatus.success = false;
            paymentStatus.message = 'Paiement probablement rejeté - Bouton de retour trouvé';
        }
        else if (currentUrl.includes('error') || 
                pageSource.includes('échec') || 
                pageSource.includes('erreur') ||
                pageSource.includes('error') ||
                pageSource.includes('fail')) {
            paymentStatus.success = false;
            paymentStatus.message = 'Paiement échoué - Termes d\'erreur détectés';
        } else {
            await this.driver.sleep(5000);
            const newPageSource = await this.driver.getPageSource();
            
            if (newPageSource.includes('rejeté') || 
                newPageSource.includes('rejected') || 
                newPageSource.includes('declined')) {
                paymentStatus.success = false;
                paymentStatus.message = 'Paiement rejeté - Détecté après délai supplémentaire';
            } else {
                paymentStatus.message = `Statut de paiement indéterminé. URL actuelle: ${currentUrl}`;
                try {
                    const pageTitle = await this.driver.getTitle();
                    paymentStatus.message += ` - Titre de la page: "${pageTitle}"`;
                    
                } catch (e) {}
            }
        }
        
        return paymentStatus;
    } catch (error) {
        console.error('Erreur lors de la vérification du résultat du paiement:', error);
        return {
            success: false,
            message: 'Erreur lors de la vérification du paiement',
            error: error.message
        };
    }
}
    async verifySuccessAlert() {
        try {
            const successAlert = await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'bg-white-A700') and .//label[contains(text(), 'Votre abonnement a bien été confirmé')]]") ), 10000, 'Alerte de confirmation non trouvée');
            return {
                success: true,
                message: 'Alerte de confirmation affichée'
            };
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'alerte de succès:', error);
            return {
                success: false,
                message: 'Alerte de confirmation non trouvée',
                error: error.message
            };
        }
    }


    async testCompletePlanSubscription(planName, subscriptionType = 'Mensuel', cardDetails = null) {
        try {
            await this.clickStartNowButtonForPlan(planName);
            await this.selectSubscriptionType(subscriptionType);
            await this.confirmSubscription();
            if (!cardDetails) {
                cardDetails = this.testCards.visaEnrolled; 
            }
            await this.fillPaymentForm(cardDetails);
            await this.submitPaymentForm();
            const paymentResult = await this.verifyPaymentResult();            
            return {
                plan: planName,
                subscriptionType: subscriptionType,
                cardUsed: {
                    number: `${cardDetails.number.substring(0, 4)}...${cardDetails.number.substring(cardDetails.number.length - 4)}`, // Masquer le numéro de carte
                    expiry: `${cardDetails.expMonth}/${cardDetails.expYear}`,
                },
                paymentResult: paymentResult
            };
        } catch (error) {
            console.error(`Erreur lors du test complet pour le plan "${planName}":`, error);
            throw error;
        }
    }
    
    async testAllPlansWithVariations() {
        const results = [];
        const plans = ['Basique', 'Standard', 'Premium'];
        const subscriptionTypes = ['Mensuel', 'Annuel'];
        const cards = [
            this.testCards.visaEnrolled,  ];
        
        try {
            for (const plan of plans) {
                for (const subType of subscriptionTypes) {
                    for (const card of cards) {
                        try {
                            await this.navigateToPaiement();
                            const result = await this.testCompletePlanSubscription(plan, subType, card);
                            results.push(result);
                            await this.driver.sleep(2000);
                        } catch (error) {
                            console.error(`Erreur lors du test de ${plan}/${subType}:`, error);
                            results.push({
                                plan,
                                subscriptionType: subType,
                                error: error.message
                            });
                        }
                    }
                }
            }
            
            return results;
        } catch (error) {
            console.error('Erreur lors des tests de variations:', error);
            throw error;
        }
    }

    async cancelSubscription() {
    try {
        await this.driver.sleep(2000);        
        const xpaths = [
            "//button[contains(text(), 'Annuler')]",
            "//button[contains(., 'Annuler')]",
            "//button[.//svg and contains(., 'Annuler')]",
            "//button[contains(@class, 'bg-gray-201')]",
            "//button[contains(@class, 'text-blue_gray-301')]",
            "//button[.//svg]//*[contains(text(), 'Annuler')]",
            "//button[.//polyline and .//path]", 
        ];
        let cancelButton = null;
        for (const xpath of xpaths) {
            try {
                cancelButton = await this.driver.wait(until.elementLocated(By.xpath(xpath)), 3000);
                break; 
            } catch (e) {
                console.log(`XPath non trouvé: ${xpath}`);
            }
        }
        if (!cancelButton) {
            try {
                cancelButton = await this.driver.wait(until.elementLocated(By.css("button.bg-gray-201, button.text-blue_gray-301") ), 3000);
            } catch (e) {
                console.log("Sélecteur CSS non trouvé");
            }
        }
        if (!cancelButton) {
            try {
                cancelButton = await this.driver.executeScript(`
                    return Array.from(document.querySelectorAll('button')).find(
                        button => button.textContent.includes('Annuler') || 
                                (button.innerHTML.includes('svg') && button.textContent.includes('Annuler'))
                    );
                `);
            } catch (e) {
                console.log("Recherche JavaScript a échoué");
            }
        }
       
        await this.driver.executeScript("arguments[0].click();", cancelButton);
        
        try {
            await cancelButton.click();
        } catch (clickError) {
            console.log("Clic traditionnel a échoué, mais le clic JavaScript a peut-être fonctionné");
        }
        
        await this.driver.wait(until.urlContains('ChoosePlan'), 10000, 'Navigation vers la page ChoosePlan après annulation échouée');
        await this.waitForPageLoad();
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
        throw error;
    }
}



async clickUpgradePlanButton() {
    try {
        const xpathSelector = '//button[.//span[contains(text(), "Mettre à niveau le plan")]]';
        
        await this.driver.wait(until.elementLocated(By.xpath(xpathSelector)), 10000);
        const upgradeButton = await this.driver.findElement(By.xpath(xpathSelector));
        
        await this.driver.wait(until.elementIsVisible(upgradeButton), 5000);
        await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", upgradeButton);
        await this.driver.sleep(1000);
        
        await upgradeButton.click();
        console.log('Clic sur le bouton "Mettre à niveau le plan" effectué');
        
        await this.driver.sleep(2000);
        
    } catch (error) {
        console.error('Erreur lors du clic sur le bouton "Mettre à niveau le plan":', error);
        throw error;
    }
}

async clickReturnToDigitalMoroccoButton() {
    try {
        const linkSelector = 'a.btn.btn-success[href*="statuspaid=success"]';
        const xpathSelector = '//a[contains(@class, "btn-success") and contains(@href, "statuspaid=success")]';
        
        await this.driver.wait(until.elementLocated(By.xpath(xpathSelector)), 10000);
        const returnButton = await this.driver.findElement(By.xpath(xpathSelector));
        
        await this.driver.wait(until.elementIsVisible(returnButton), 5000);
        await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", returnButton);
        await this.driver.sleep(1000);
        
        await returnButton.click();
        console.log('Clic sur le bouton "revenir à digitalmorocco.net" effectué');
        
        await this.driver.sleep(3000);
        
    } catch (error) {
        console.error('Erreur lors du clic sur le bouton de retour:', error);
        throw error;
    }
}

async verifyUpgradeSuccessAlert() {
    try {
        const alertSelectors = [
            '//label[contains(text(), "Votre abonnement a bien été mis à niveau !")]',
            '//div[contains(@class, "bg-white-A700")]//label[contains(text(), "Votre abonnement")]',
            '//img[@alt="successtick"]'
        ];
        
        let alertFound = false;
        let alertMessage = '';
        
        for (const selector of alertSelectors) {
            try {
                await this.driver.wait(until.elementLocated(By.xpath(selector)), 8000);
                const alertElement = await this.driver.findElement(By.xpath(selector));
                
                if (await alertElement.isDisplayed()) {
                    alertFound = true;
                    alertMessage = 'Alerte de mise à niveau trouvée et visible';
                    console.log('Alerte de mise à niveau réussie détectée');
                    break;
                }
            } catch (e) {
            }
        }
        
        return {
            success: alertFound,
            message: alertFound ? alertMessage : 'Alerte de mise à niveau non trouvée'
        };
        
    } catch (error) {
        return {
            success: false,
            message: `Erreur lors de la vérification de l'alerte: ${error.message}`
        };
    }
}
async verifyCurrentPlan(expectedPlan) {
    try {
        await this.driver.sleep(3000);
        const selectors = [
            // Sélecteur CSS direct - le plus fiable
            `label.text-blue-501`,
            // Sélecteur CSS avec classes multiples
            `label[class*="text-blue-501"]`,
            // XPath avec normalize-space pour nettoyer les espaces
            `//label[contains(@class, "text-blue-501") and normalize-space(text())="${expectedPlan}"]`,
            // XPath plus flexible avec contains
            `//label[contains(@class, "text-blue-501") and contains(normalize-space(text()), "${expectedPlan}")]`,
            // XPath très flexible
            `//label[contains(@class, "text-blue-501")]`
        ];

        let planElement = null;
        let usedSelector = null;
        let allFoundElements = [];

        // Essayer chaque sélecteur
        for (let i = 0; i < selectors.length; i++) {
            try {
                
                let elements = [];
                
                if (selectors[i].startsWith('//')) {
                    elements = await this.driver.findElements(By.xpath(selectors[i]));
                } else {
                    elements = await this.driver.findElements(By.css(selectors[i]));
                }
                
                
                if (elements.length > 0) {
                    for (let j = 0; j < elements.length; j++) {
                        try {
                            const element = elements[j];
                            const isDisplayed = await element.isDisplayed();
                            const text = await element.getText();
                            allFoundElements.push({ element, text, isDisplayed });
                            if (isDisplayed && text.trim()) {
                                const normalizedText = text.trim().toLowerCase();
                                const normalizedExpected = expectedPlan.trim().toLowerCase();
                                
                                if (normalizedText === normalizedExpected || 
                                    normalizedText.includes(normalizedExpected) ||
                                    normalizedExpected.includes(normalizedText)) {
                                    
                                    planElement = element;
                                    usedSelector = selectors[i];
                                    break;
                                }
                            }
                        } catch (elementError) {
                            console.log(`Erreur lors de la vérification de l'élément ${j + 1}: ${elementError.message}`);
                        }
                    }
                    
                    if (planElement) break;
                }
                
            } catch (selectorError) {
                console.log(` Sélecteur ${i + 1} échoué: ${selectorError.message}`);
                continue;
            }
        }

        if (planElement) {
            const planText = await planElement.getText();
            
            return {
                success: true,
                message: `Plan actuel confirmé: ${planText}`,
                currentPlan: planText,
                selectorUsed: usedSelector
            };
        }
        
        allFoundElements.forEach((item, index) => {
            console.log(`- Élément ${index + 1}: "${item.text}" (Visible: ${item.isDisplayed})`);
        });
        return await this.debugPlanDetection(expectedPlan);
        
    } catch (error) {
        console.error(` Erreur lors de la vérification du plan: ${error.message}`);
        return {
            success: false,
            message: `Erreur lors de la vérification du plan actuel: ${error.message}`
        };
    }
}

async debugPlanDetection(expectedPlan) {
    try {
        const blueElements = await this.driver.findElements(By.css('[class*="text-blue-501"]'));        
        for (let i = 0; i < blueElements.length; i++) {
            try {
                const element = blueElements[i];
                const text = await element.getText();
                const tagName = await element.getTagName();
                const className = await element.getAttribute('class');
                const isDisplayed = await element.isDisplayed();
            } catch (e) {
                console.log(`Erreur élément ${i + 1}: ${e.message}`);
            }
        }
        const allLabels = await this.driver.findElements(By.tagName('label'));
        
        for (let i = 0; i < Math.min(allLabels.length, 15); i++) {
            try {
                const element = allLabels[i];
                const text = await element.getText();
                const className = await element.getAttribute('class');
                const isDisplayed = await element.isDisplayed();
                
                if (text.trim()) {
                    const normalizedText = text.trim().toLowerCase();
                    const normalizedExpected = expectedPlan.trim().toLowerCase();
                    if (normalizedText.includes(normalizedExpected) || normalizedExpected.includes(normalizedText)) {
                        console.log(` CORRESPONDANCE POTENTIELLE!`);
                    }
                    console.log(`   ---`);
                }
            } catch (e) {
                console.log(` Erreur label ${i + 1}: ${e.message}`);
            }
        }
        
        try {
            const textElements = await this.driver.findElements(By.xpath(`//*[contains(text(), "${expectedPlan}")]`));
            
            for (let i = 0; i < textElements.length; i++) {
                try {
                    const element = textElements[i];
                    const text = await element.getText();
                    const tagName = await element.getTagName();
                    const className = await element.getAttribute('class');
                    const isDisplayed = await element.isDisplayed();
                } catch (e) {
                    console.log(` Erreur élément texte ${i + 1}: ${e.message}`);
                }
            }
        } catch (xpathError) {
            console.log(` Erreur recherche XPath: ${xpathError.message}`);
        }
        try {
            const pageSource = await this.driver.getPageSource();
            const planMatches = pageSource.match(new RegExp(expectedPlan, 'gi'));
            
            // Extraire les sections pertinentes du HTML
            const labelRegex = /<label[^>]*>[\s\S]*?<\/label>/gi;
            const labels = pageSource.match(labelRegex);
            if (labels) {
                labels.forEach((label, index) => {
                    if (label.toLowerCase().includes(expectedPlan.toLowerCase()) || 
                        label.includes('text-blue-501')) {
                    }
                });
            }
        } catch (htmlError) {
            console.log(`Erreur analyse HTML: ${htmlError.message}`);
        }
        
        return {
            success: false,
            message: `Plan "${expectedPlan}" non trouvé. Consultez les logs de débogage détaillés ci-dessus.`,
            debugInfo: {
                blueElementsCount: blueElements.length,
                totalLabels: allLabels.length
            }
        };
        
    } catch (debugError) {
        console.error(`Erreur lors du débogage: ${debugError.message}`);
        return {
            success: false,
            message: `Erreur lors du débogage: ${debugError.message}`
        };
    }
}

async closeUpgradeSuccessAlert() {
    try {
        try {
            await this.driver.getCurrentUrl();
        } catch (driverError) {
            return { success: false, message: 'Driver non accessible avant fermeture alerte' };
        }
        await this.driver.sleep(2000);
        let alertPresent = false;
        try {
            const alertElements = await this.driver.findElements(By.xpath('//label[contains(text(), "Votre abonnement a bien été mis à niveau !")]') );
            alertPresent = alertElements.length > 0;
        } catch (alertCheckError) {
            console.log(' Erreur lors de la vérification de présence de l\'alerte:', alertCheckError.message);
        }
        
        if (!alertPresent) {
            console.log('Aucune alerte à fermer');
            return { success: true, message: 'Aucune alerte présente à fermer' };
        }
        const closeButtonSelectors = [
            '//div[contains(@class, "hover:bg-gray-201") and contains(@class, "rounded-full") and contains(@class, "p-1")]',
            '//svg[@width="12" and @height="11" and @viewBox="0 0 12 11"]',
            '//svg[@width="12" and @height="11" and @viewBox="0 0 12 11"]/parent::div'
        ];
        
        let clickSuccess = false;
        
        for (let i = 0; i < closeButtonSelectors.length && !clickSuccess; i++) {
            const selector = closeButtonSelectors[i];
            console.log(`Tentative ${i + 1}/${closeButtonSelectors.length} avec sélecteur: ${selector}`);
            
            try {
                const closeButton = await this.driver.wait(until.elementLocated(By.xpath(selector)), 3000 );
                await this.driver.getCurrentUrl();
                 if (await closeButton.isDisplayed()) {
                    try {
                        await closeButton.click();
                        clickSuccess = true;
                    } catch (clickError) {
                        try {
                            await this.driver.executeScript("arguments[0].click();", closeButton);
                            clickSuccess = true;
                        } catch (jsClickError) {
                            console.log(' Clic JavaScript échoué:', jsClickError.message);
                        }
                    }
                }
            } catch (e) {
                console.log(` Sélecteur ${i + 1} échoué: ${e.message}`);
                try {
                    await this.driver.getCurrentUrl();
                } catch (driverCheckError) {
                    console.error('❌ Driver fermé pendant la recherche du bouton');
                    return { success: false, message: 'Driver fermé pendant la recherche du bouton' };
                }
                continue;
            }
        }
        
        if (!clickSuccess) {
            console.log('Bouton spécifique non trouvé, tentative de clic général prudent...');
            try {
                await this.driver.getCurrentUrl();
                await this.driver.executeScript(`
                    try {
                        const centerElement = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
                        if (centerElement) {
                            centerElement.click();
                            console.log('Clic général effectué');
                        }
                    } catch (e) {
                        console.log('Erreur clic général:', e.message);
                    }
                `);
                console.log('Script de clic général exécuté');
                clickSuccess = true;
            } catch (generalClickError) {
                console.log(' Clic général échoué:', generalClickError.message);
            }
        }
        await this.driver.sleep(2000);
        try {
            await this.driver.getCurrentUrl();
        } catch (driverError) {
            console.error('Driver fermé après tentative de fermeture');
            return { success: false, message: 'Driver fermé après tentative de fermeture' };
        }
        try {
            const alertStillVisible = await this.driver.findElements(By.xpath('//label[contains(text(), "Votre abonnement a bien été mis à niveau !")]'));
            if (alertStillVisible.length === 0) {
                return { success: true, message: 'Alerte fermée avec succès' };
            } else {
                return { success: false, message: 'L\'alerte est toujours visible après les tentatives de clic' };
            }
        } catch (e) {
            try {
                await this.driver.getCurrentUrl();
                return { success: true, message: 'Alerte fermée avec succès' };
            } catch (driverError) {
                return { success: false, message: 'Driver fermé pendant la vérification finale' };
            }
        }
        
    } catch (error) {
        console.error(' Erreur lors de la fermeture de l\'alerte:', error);
        try {
            await this.driver.getCurrentUrl();
            console.log('Driver toujours actif malgré l\'erreur');
        } catch (driverError) {
            console.error(' Driver fermé à cause de l\'erreur:', driverError.message);
            return { success: false, message: 'Driver fermé à cause de l\'erreur de fermeture' };
        }
        
        return {
            success: false,
            message: `Erreur lors de la fermeture: ${error.message}`
        };
    }
}
async clickCancelPlanButton() {
    try {
        await this.driver.sleep(2000);
        const selectors = [
            // Sélecteur par texte exact
            `//button[contains(text(), "Annuler mon plan")]`,
            // Sélecteur par texte avec normalize-space
            `//button[normalize-space(text())="Annuler mon plan"]`,
            // Sélecteur par classe et texte
            `//button[contains(@class, "bg-[#E4E7EC]") and contains(text(), "Annuler")]`,
            // Sélecteur CSS avec classes spécifiques
            `button[class*="bg-[#E4E7EC]"][class*="text-[#98A2B3]"]:has-text("Annuler mon plan")`,
            // Sélecteur alternatif par structure
            `//button[contains(@class, "bg-[#E4E7EC]") and .//svg and contains(text(), "Annuler")]`
        ];

        let cancelButton = null;
        let usedSelector = null;

        // Essayer chaque sélecteur
        for (let i = 0; i < selectors.length; i++) {
            try {
                console.log(`Tentative ${i + 1}: ${selectors[i]}`);
                
                if (selectors[i].includes('has-text')) {
                    // Sélecteur CSS spécial - utiliser findElements pour vérifier
                    const buttons = await this.driver.findElements(By.css(`button[class*="bg-[#E4E7EC]"]`));
                    for (let button of buttons) {
                        const text = await button.getText();
                        if (text.includes("Annuler mon plan")) {
                            cancelButton = button;
                            usedSelector = "CSS avec vérification de texte";
                            break;
                        }
                    }
                } else {
                    // XPath selector
                    await this.driver.wait(until.elementLocated(By.xpath(selectors[i])), 5000);
                    cancelButton = await this.driver.findElement(By.xpath(selectors[i]));
                    usedSelector = selectors[i];
                }
                
                if (cancelButton && await cancelButton.isDisplayed()) {
                    console.log(`Bouton 'Annuler mon plan' trouvé avec: ${usedSelector}`);
                    break;
                }
                
            } catch (selectorError) {
                console.log(` Sélecteur ${i + 1} échoué: ${selectorError.message}`);
                continue;
            }
        }

        if (cancelButton && await cancelButton.isDisplayed()) {
            await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", cancelButton);
            await this.driver.sleep(1000);
            await cancelButton.click();
            await this.driver.sleep(2000);
             return {
                success: true,
                message: "Bouton 'Annuler mon plan' cliqué avec succès",
                selectorUsed: usedSelector
            };
        } else {
            return {
                success: false,
                message: "Bouton 'Annuler mon plan' non trouvé ou non visible"
            };
        }
        
    } catch (error) {
        console.error(` Erreur lors du clic sur 'Annuler mon plan': ${error.message}`);
        return {
            success: false,
            message: `Erreur lors du clic sur le bouton d'annulation: ${error.message}`
        };
    }
}

async verifyCancelPlanModal() {
    try {
        await this.driver.sleep(2000);
        const modalSelectors = [
            // Texte de confirmation principal
            `//label[contains(text(), "Êtes-vous sûr de vouloir annuler")]`,
            // Texte explicatif
            `//label[contains(text(), "L'annulation entraînera la perte")]`,
            // Container de la modal
            `//div[contains(@class, "bg-white-A700") and contains(@class, "border")]`,
            // Plan "Basique" dans la modal
            `//label[contains(@class, "text-[#2575F0]") and contains(text(), "Basique")]`
        ];

        let modalFound = false;
        let modalDetails = {};

        for (let selector of modalSelectors) {
            try {
                const element = await this.driver.findElement(By.xpath(selector));
                if (await element.isDisplayed()) {
                    modalFound = true;
                    const text = await element.getText();
                    modalDetails[selector] = text;
                }
            } catch (e) {
                console.log(`Élément non trouvé: ${selector}`);
            }
        }

        if (modalFound) {
            return {
                success: true,
                message: "Modal de confirmation d'annulation affichée",
                details: modalDetails
            };
        } else {
            return {
                success: false,
                message: "Modal de confirmation d'annulation non trouvée"
            };
        }
        
    } catch (error) {
        console.error(` Erreur lors de la vérification de la modal: ${error.message}`);
        return {
            success: false,
            message: `Erreur lors de la vérification de la modal: ${error.message}`
        };
    }
}

async clickConfirmCancellationButton() {
    try {
        await this.driver.sleep(1000);
        const selectors = [
            // Sélecteur par texte exact
            `//button[contains(text(), "Poursuivre l'annulation")]`,
            // Sélecteur par texte avec normalize-space
            `//button[normalize-space(text())="Poursuivre l'annulation"]`,
            // Sélecteur par classe CSS spécifique (rouge)
            `//button[contains(@class, "bg-[#EF4352]") and contains(text(), "Poursuivre")]`,
            // Sélecteur CSS direct
            `button[class*="bg-[#EF4352]"]`,
            // Sélecteur alternatif par couleur et texte
            `//button[contains(@class, "bg-[#EF4352]") and contains(@class, "text-white")]`
        ];

        let confirmButton = null;
        let usedSelector = null;

        // Essayer chaque sélecteur
        for (let i = 0; i < selectors.length; i++) {
            try {
                console.log(`Tentative ${i + 1}: ${selectors[i]}`);
                
                if (selectors[i].startsWith('//')) {
                    // XPath selector
                    await this.driver.wait(until.elementLocated(By.xpath(selectors[i])), 5000);
                    confirmButton = await this.driver.findElement(By.xpath(selectors[i]));
                } else {
                    // CSS selector
                    await this.driver.wait(until.elementLocated(By.css(selectors[i])), 5000);
                    const buttons = await this.driver.findElements(By.css(selectors[i]));
                    
                    // Vérifier chaque bouton pour trouver celui avec le bon texte
                    for (let button of buttons) {
                        const text = await button.getText();
                        if (text.includes("Poursuivre l'annulation") || text.includes("Poursuivre")) {
                            confirmButton = button;
                            break;
                        }
                    }
                }
                
                usedSelector = selectors[i];
                
                if (confirmButton && await confirmButton.isDisplayed()) {
                    console.log(` Bouton 'Poursuivre l'annulation' trouvé avec: ${usedSelector}`);
                    break;
                }
                
            } catch (selectorError) {
                console.log(`Sélecteur ${i + 1} échoué: ${selectorError.message}`);
                continue;
            }
        }

        if (confirmButton && await confirmButton.isDisplayed()) {
            const buttonText = await confirmButton.getText();
            await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", confirmButton);
            await this.driver.sleep(500);
            await confirmButton.click();
            await this.driver.sleep(3000);
            return {
                success: true,
                message: "Bouton 'Poursuivre l'annulation' cliqué avec succès",
                buttonText: buttonText,
                selectorUsed: usedSelector
            };
        } else {
            return {
                success: false,
                message: "Bouton 'Poursuivre l'annulation' non trouvé ou non visible"
            };
        }
        
    } catch (error) {
        console.error(`Erreur lors du clic sur 'Poursuivre l'annulation': ${error.message}`);
        return {
            success: false,
            message: `Erreur lors du clic sur le bouton de confirmation: ${error.message}`
        };
    }
}

async clickKeepPlanButton() {
    try {        
        const selectors = [
            `//button[contains(text(), "Conserver le plan Basique")]`,
            `//button[normalize-space(text())="Conserver le plan Basique"]`,
            `//button[contains(@class, "bg-[#E4E7EC]") and contains(text(), "Conserver")]`
        ];

        for (let selector of selectors) {
            try {
                const keepButton = await this.driver.findElement(By.xpath(selector));
                if (await keepButton.isDisplayed()) {
                    await keepButton.click();
                    return {
                        success: true,
                        message: "Plan conservé avec succès"
                    };
                }
            } catch (e) {
                continue;
            }
        }
        
        return {
            success: false,
            message: "Bouton 'Conserver le plan' non trouvé"
        };
        
    } catch (error) {
        return {
            success: false,
            message: `Erreur: ${error.message}`
        };
    }
}

async verifyCancellationSuccess() {
    try {
        await this.driver.sleep(3000);
        const modalSelectors = [
            // Modal avec le message de confirmation spécifique
            `//label[contains(text(), "Votre abonnement a bien été annulé")]`,
            `//div[contains(@class, "bg-white-A700")]//label[contains(text(), "abonnement a bien été annulé")]`,
            // Image de succès dans la modal
            `//img[contains(@alt, "successtick") or contains(@src, "check-verified")]`,
            // Texte de confirmation email
            `//label[contains(text(), "e-mail de confirmation vous a été envoyé")]`,
            // Container de la modal complète
            `//div[contains(@class, "bg-white-A700") and contains(@class, "border") and .//label[contains(text(), "annulé")]]`
        ];

        let successFound = false;
        let successDetails = {};
        const currentUrl = await this.driver.getCurrentUrl();
        successDetails.currentUrl = currentUrl;
        for (let selector of modalSelectors) {
            try {
                const element = await this.driver.wait(until.elementLocated(By.xpath(selector)), 10000 );
                if (await element.isDisplayed()) {
                    const text = await element.getText();
                    successFound = true;
                    successDetails.confirmationText = text;
                    successDetails.foundSelector = selector;
                    break; 
                }
            } catch (e) {
                console.log(` Élément non trouvé avec le sélecteur: ${selector}`);
            }
        }

        if (!successFound) {
            try {
                const generalSuccess = await this.driver.findElements(By.xpath(`//*[contains(text(), "annulé") or contains(text(), "confirmé") or contains(text(), "succès")]`) );
                if (generalSuccess.length > 0) {
                    for (let element of generalSuccess) {
                        if (await element.isDisplayed()) {
                            const text = await element.getText();
                            successFound = true;
                            successDetails.generalConfirmation = text;
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log(" Aucun texte de confirmation générale trouvé");
            }
        }


        return {
            success: successFound,
            message: successFound ? 
                "Annulation confirmée avec succès - Modal de confirmation détectée" : 
                "Modal de confirmation d'annulation non trouvée",
            details: successDetails
        };
        
    } catch (error) {
        console.error(` Erreur lors de la vérification: ${error.message}`);
        return {
            success: false,
            message: `Erreur lors de la vérification: ${error.message}`,
            error: error.message
        };
    }
}

async clickRenewSubscriptionButton() {
    try {
        let renewButton;
        try {
            renewButton = await this.driver.findElement(By.xpath('//button[text()="Renouveler l\'abonnement"]'));
        } catch (e1) {
            // Méthode 2: Par le texte contenu (au cas où il y aurait des espaces)
            try {
                renewButton = await this.driver.findElement(By.xpath('//button[contains(text(), "Renouveler l\'abonnement")]'));
            } catch (e2) {
                // Méthode 3: Par les classes CSS principales
                try {
                    renewButton = await this.driver.findElement(By.css('button.bg-blue-A400.text-white-A700[type="button"]'));
                } catch (e3) {
                    // Méthode 4: Par la classe bg-blue-A400 uniquement
                    try {
                        renewButton = await this.driver.findElement(By.css('button.bg-blue-A400[type="button"]'));
                    } catch (e4) {
                        // Méthode 5: Par le SVG avec viewBox spécifique
                        try {
                            renewButton = await this.driver.findElement(By.xpath('//button[.//svg[@viewBox="0 0 24 24" and @height="23" and @width="23"]]'));
                        } catch (e5) {
                            // Méthode 6: Par le path du SVG (signature unique)
                            renewButton = await this.driver.findElement(By.xpath('//button[.//path[starts-with(@d, "M14.5 4h.005m-.005 0l-2.5 6")]]'));
                        }
                    }
                }
            }
        }
        
        if (!renewButton) {
            throw new Error('Bouton Renouveler l\'abonnement non trouvé');
        }
        await this.driver.wait(until.elementIsVisible(renewButton), 10000);
        await this.driver.wait(until.elementIsEnabled(renewButton), 5000);
        await this.driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", renewButton);
        await this.driver.sleep(1000);
        await renewButton.click();
        
        return { success: true, message: "Bouton 'Renouveler l'abonnement' cliqué avec succès" };
        
    } catch (error) {
        try {
            const allButtons = await this.driver.findElements(By.css('button'));
            
            for (let i = 0; i < Math.min(allButtons.length, 3); i++) {
                const buttonText = await allButtons[i].getText().catch(() => 'Texte non lisible');
                const buttonClasses = await allButtons[i].getAttribute('class').catch(() => 'Classes non lisibles');
            }
        } catch (debugError) {
            console.log('Debug impossible:', debugError.message);
        }
        
        return { success: false, message: `Erreur lors du clic sur 'Renouveler l'abonnement': ${error.message}` };
    }
}


async verifyPayzonePaymentPage() {
    try {
        await this.driver.wait(until.urlContains('payzone.ma'), 10000);
        const pageTitle = await this.driver.getTitle();
        const pageLoaded = await this.driver.wait(until.elementLocated(By.css('body')), 5000);
         return { 
            success: true, 
            message: `Page Payzone chargée avec succès. Titre: ${pageTitle}` 
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Erreur lors de la vérification de la page Payzone: ${error.message}` 
        };
    }
}




}

module.exports = PaiementPage;

const {By, until} = require("selenium-webdriver");

class PaiementPage {
    constructor(driver) {
        this.driver = driver;
        this.testCards = {
            visaEnrolled: {
                number: "4111111111111111",
                expMonth: "10",
                expYear: "2024",
                cvv: "000" 
            },
            visaNonEnrolled: {
                number: "4012888888881881",
                expMonth: "10",
                expYear: "2024",
                cvv: "000"
            },
            mastercard: {
                number: "5105105105105100",
                expMonth: "10",
                expYear: "2024",
                cvv: "000"
            }
        };
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
            const labelXPath = `//label[contains(text(), '${planName}')]`;
            const divXPath = `//div[contains(text(), '${planName}')]`;
            const generalXPath = `//*[contains(text(), '${planName}')]`;
            let planElement;
            
            try {
                const label = await this.driver.wait(until.elementLocated(By.xpath(labelXPath)), 5000);
                planElement = await label.findElement(By.xpath("./ancestor::div[3]"));
            } catch (e) {
                try {
                    planElement = await this.driver.wait(until.elementLocated(By.xpath(`//div[./div[contains(text(), '${planName}')]]`)), 5000);
                } catch (e2) {
                    const element = await this.driver.wait(until.elementLocated(By.xpath(generalXPath)), 5000, `Plan "${planName}" non trouvé`);
                    planElement = await element.findElement(By.xpath("./ancestor::div[contains(@class, 'border') or contains(@class, 'rounded')]"));
                }
            }
            
            return planElement;
        } catch (error) {
            console.error(`Erreur lors de la récupération du plan "${planName}":`, error);
            throw error;
        }
    }

    async clickStartNowButtonForPlan(planName) {
        try {
            const planElement = await this.getPlanByName(planName);
            let startButton;
            try {
                startButton = await planElement.findElement(By.xpath(".//button[contains(text(), 'Commencez maintenant')]"));
            } catch (e) {
                try {
                    startButton = await planElement.findElement(By.xpath(".//button[contains(@class, 'bg-blue') and contains(text(), 'Commencez')]"));
                } catch (e2) {
                    startButton = await planElement.findElement(By.xpath(".//button[contains(@class, 'bg-blue')]"));
                }
            }
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", startButton);
            await this.driver.sleep(500);
            await startButton.click();
            await this.driver.sleep(2000); 
            await this.driver.wait(until.urlContains('subscribePlan'), 10000, 'Navigation vers la page de sélection du plan échouée');
            await this.waitForPageLoad();
            
            return true;
        } catch (error) {
            console.error(`Erreur lors du clic sur le bouton "Commencez maintenant" pour le plan "${planName}":`, error);
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
            }, 15000).catch(() => {}); // Ignorer l'erreur si le timeout est atteint
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
}

module.exports = PaiementPage;
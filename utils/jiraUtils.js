const JiraApi = require('jira-client');
const fs = require('fs');
const path = require('path');
const testInfo = require('./testInfo');

const jira = new JiraApi({
  protocol: 'https',
  host: '',
  username: '',
  password: '',
  apiVersion: '3',
  strictSSL: true
});

const MAX_TICKET_AGE_DAYS = 30; 

async function getAvailableTransitions(issueKey) {
  try {
    const transitions = await jira.listTransitions(issueKey);
    return transitions.transitions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transitions:", error);
    return [];
  }
}

async function isTicketTooOld(issueKey) {
  try {
    const issue = await jira.findIssue(issueKey);
    const createdDate = new Date(issue.fields.created);
    const currentDate = new Date();
    
    const diffTime = Math.abs(currentDate - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`Le ticket ${issueKey} a été créé il y a ${diffDays} jours`);
    
    return diffDays > MAX_TICKET_AGE_DAYS;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'âge du ticket:", error);
    return false; 
  }
}

async function findExistingTicket(testName) {
  try {
    const jql = `project = SCRUM AND summary ~ "Test échoué: ${testName}" AND type = Bug`;
    const searchResults = await jira.searchJira(jql);
    
    if (searchResults.issues && searchResults.issues.length > 0) {
      const existingTicket = searchResults.issues[0].key;
      console.log(`Ticket existant trouvé pour le test "${testName}": ${existingTicket}`);
      
      const tooOld = await isTicketTooOld(existingTicket);
      if (tooOld) {
        console.log(`Le ticket ${existingTicket} est trop ancien. Un nouveau ticket sera créé.`);
        return null; 
      }
      
      return existingTicket;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la recherche d'un ticket existant:", error);
    return null;
  }
}

async function updateExistingTicket(issueKey, testName, errorMessage, stepsInfo) {
  try {
    const issue = await jira.findIssue(issueKey);
    const updateData = {
      fields: {},
      update: {
        comment: [{
          add: {
            body: {
              version: 1,
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Test échoué à nouveau le ${new Date().toLocaleString()}`
                    }
                  ]
                }
              ]
            }
          }
        }]
      }
    };
    
    if (issue.fields.status.name === "Resolved" || issue.fields.status.name === "Done" || 
        issue.fields.status.name === "Closed") {
      try {
        const availableTransitions = await getAvailableTransitions(issueKey);
        console.log(`Transitions disponibles pour ${issueKey}:`, availableTransitions.map(t => `${t.id} - ${t.name}`));
        
        const toDoTransition = availableTransitions.find(t => 
          t.name === "To Do" || t.name === "TO DO" || t.name === "A faire" || t.name === "À faire");
        
        if (toDoTransition) {
          await jira.transitionIssue(issueKey, {
            transition: {
              id: toDoTransition.id
            }
          });
          console.log(`Statut du ticket ${issueKey} mis à jour vers "${toDoTransition.name}"`);
        } else {
          console.log("Transition TO DO non trouvée, utilisation de l'ID par défaut");
          await jira.transitionIssue(issueKey, {
            transition: {
              id: "11"
            }
          });
          console.log(`Statut du ticket ${issueKey} mis à jour vers "TO DO" `);
        }
      } catch (transitionError) {
        console.error("Erreur lors de la transition du ticket:", transitionError);
      }
    }
    
    await jira.updateIssue(issueKey, updateData);
    console.log(`Ticket ${issueKey} mis à jour avec succès`);
    
    return issueKey;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket:", error);
    return null;
  }
}

async function takeScreenshot(driver, testName) {
  try {
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().getTime();
    const screenshotName = `${testName.replace(/\s+/g, '_')}_${timestamp}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);

    const screenshotData = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshotData, 'base64');
    
    console.log(`Capture d'écran enregistrée à: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error("Erreur lors de la prise de capture d'écran:", error);
    return null;
  }
}

async function attachScreenshotToIssue(issueKey, screenshotPath) {
  try {
    if (!fs.existsSync(screenshotPath)) {
      console.error(`Le fichier n'existe pas: ${screenshotPath}`);
      return false;
    }

    console.log(`Ajout de la capture d'écran au ticket ${issueKey}...`);
    await jira.addAttachmentOnIssue(issueKey, fs.createReadStream(screenshotPath));
    console.log(`Capture d'écran ajoutée avec succès au ticket ${issueKey}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la capture d'écran au ticket:", error);
    return false;
  }
}

async function createBugTicket(testName, errorMessage, stepsInfo, driver = null) {
  try {
    console.log(`Gestion du ticket pour le test échoué: ${testName}`);
    const existingTicket = await findExistingTicket(testName);
    if (existingTicket) {
      await updateExistingTicket(existingTicket, testName, errorMessage, stepsInfo);
      return existingTicket;
    }
    
    let screenshotPath = null;
    if (driver) {
      screenshotPath = await takeScreenshot(driver, testName);
    }
    console.log(`Création d'un nouveau ticket bug pour le test échoué: ${testName}`);
    
    const stepsPerformed = stepsInfo?.stepsPerformed || "Non spécifiées";
    const actualResult = stepsInfo?.actualResult || errorMessage || "Non spécifié";
    const expectedResult = stepsInfo?.expectedResult || "Non spécifié";
    
    const simpleDescription = `Lors de l'exécution du test automatisé "${testName}", j'ai détecté une anomalie concernant "${errorMessage}". 
    
Je vous transmets ci-dessous la stack trace complète ainsi que des informations complémentaires pour faciliter le diagnostic.`;
    
    const issueData = {
      fields: {
        project: {
          key: 'SCRUM'
        },
        summary: `[BUG] Test échoué: ${testName}`,
        description: {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: simpleDescription
                }
              ]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [
                {
                  type: "text",
                  text: "Informations du test:"
                }
              ]
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Nom du test: "
                        },
                        {
                          type: "text",
                          text: testName
                        }
                      ]
                    }
                  ]
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: "Date d'exécution: "
                        },
                        {
                          type: "text",
                          text: new Date().toLocaleString()
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [
                {
                  type: "text",
                  text: "Étapes réalisées:"
                }
              ]
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: stepsPerformed
                }
              ]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [
                {
                  type: "text",
                  text: "Résultat obtenu:"
                }
              ]
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: actualResult
                }
              ]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [
                {
                  type: "text",
                  text: "Résultat attendu:"
                }
              ]
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: expectedResult
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Bug'
        },
        labels: ['automatisation', 'test-selenium']
      }
    };

    if (screenshotPath) {
      issueData.fields.description.content.push({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Une capture d'écran du moment de l'échec est jointe à ce ticket."
          }
        ]
      });
    }

    const issue = await jira.addNewIssue(issueData);
    console.log(`Bug créé avec succès: ${issue.key}`);
    
    if (screenshotPath) {
      await attachScreenshotToIssue(issue.key, screenshotPath);
    }
    
    return issue.key;
  } catch (error) {
    console.error('Erreur lors de la gestion du ticket Jira:', error);
    return null;
  }
}

async function changeTicketStatus(issueKey, targetStatus) {
  try {
    const availableTransitions = await getAvailableTransitions(issueKey);
    const targetTransition = availableTransitions.find(t => 
      t.name.toLowerCase() === targetStatus.toLowerCase() || 
      t.to.name.toLowerCase() === targetStatus.toLowerCase());
    
    if (targetTransition) {
      await jira.transitionIssue(issueKey, {
        transition: {
          id: targetTransition.id
        }
      });
      return true;
    } else {
      console.warn(`Aucune transition trouvée pour le statut "${targetStatus}"`);
      return false;
    }
  } catch (error) {
    console.error(`Erreur lors du changement de statut du ticket ${issueKey}:`, error);
    return false;
  }
}

module.exports = {
  jira,
  createBugTicket,
  takeScreenshot,
  attachScreenshotToIssue,
  findExistingTicket,
  updateExistingTicket,
  getAvailableTransitions,
  changeTicketStatus,
  isTicketTooOld, 
  MAX_TICKET_AGE_DAYS 
};
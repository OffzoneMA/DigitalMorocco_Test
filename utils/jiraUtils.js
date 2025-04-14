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
    console.log(`Création d'un ticket bug pour le test échoué: ${testName}`);
    
    let screenshotPath = null;
    if (driver) {
      screenshotPath = await takeScreenshot(driver, testName);
    }
    
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
    console.error('Erreur lors de la création du ticket Jira:', error);
    return null;
  }
}

module.exports = {
  jira,
  createBugTicket,
  takeScreenshot,
  attachScreenshotToIssue
};
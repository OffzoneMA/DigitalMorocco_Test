const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFilePath = process.env.LOG_FILE_PATH || './logs/test_results.log';

if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function logResult(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Erreur d\'écriture dans le fichier de log:', err);
    }
  });
}

module.exports = { logResult };
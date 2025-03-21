const fs = require('fs');
const path = require('path');
require('dotenv').config();

const fileTimestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logDirectory = process.env.LOG_DIRECTORY || './logs';
const logFilePath = path.join(logDirectory, `test_results_${fileTimestamp}.log`);

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
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
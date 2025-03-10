require('dotenv').config();

module.exports = {

  baseUrl: process.env.BASE_URL || 'https://test.v1-sic.digitalmorocco.net',
  validEmail: process.env.VALID_EMAIL || 'elhajiikram35@gmail.com',
  validPassword: process.env.VALID_PASSWORD || 'Test12345@',
  invalidEmail: process.env.INVALID_EMAIL || 'invalid@gmail.com',
  invalidPassword: process.env.INVALID_PASSWORD || 'invalidPassword',
  logFilePath: process.env.LOG_FILE_PATH || './logs/test_results.log',

};


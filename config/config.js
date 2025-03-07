require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL|| 'https://test.v1-sic.digitalmorocco.net',
  validEmail: process.env.VALID_EMAIL,
  validPassword: process.env.VALID_PASSWORD,
  invalidEmail: process.env.INVALID_EMAIL,
  invalidPassword: process.env.INVALID_PASSWORD,
  logFilePath: process.env.LOG_FILE_PATH,
  MAILOSAUR_API_KEY: process.env.MAILOSAUR_API_KEY,
  MAILOSAUR_SERVER_ID: process.env.MAILOSAUR_SERVER_ID

  
  
};

console.log('Base URL:', module.exports.baseUrl);


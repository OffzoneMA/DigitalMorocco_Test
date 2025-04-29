require('dotenv').config();

module.exports = {

  baseUrl: process.env.BASE_URL || 'https://test.v1-sic.digitalmorocco.net',
  validEmail: process.env.VALID_EMAIL || 'elhajiikram35@gmail.com',
  validPassword: process.env.VALID_PASSWORD || 'Test12345@',
  invalidEmail: process.env.INVALID_EMAIL || 'invalid',
  invalidPassword: process.env.INVALID_PASSWORD || 'invalidPassword',
  logFilePath: process.env.LOG_FILE_PATH || './logs/test_results.log',
  validUrl:process.env.VALID_URL || 'https://apitest.digitalmorocco.net/verify',
  name:process.env.Name || 'EL HAJI IKRAM',
  apiMailtraToken:process.env.MAILTRAP_API_TOKEN || '74bad0c7414cdd76735d5cec91806796',
  apiaccountID:process.env.ACCOUNT_ID ||'2240531',
  apiInboxID :process.env.INBOX_ID || '3524498',
  user:process.env.USER || 'd87c253f99bce4',
  pass:process.env.PASS || '78b0dd56e3a502',
  mail:process.env.EMAIL || 'contact@example.com',
  website:process.env.WEBSITE || 'https://www.example.com',
  funding:process.env.FUNDING || '5000',
  raised:process.env.RAISED || '1000',
  member:process.env.MEMBER || 'Ikram Imzi',
  reportApi:process.env.reportApi || 'DigitalMoroccoAPI_pfXFk7MqSYu-nxGRc310hZezITUgSRq4-I4Z0U5ZGrMzomT7KbyWMk6rl82ErRhI',
  endpoint:process.env.endpoint || 'http://localhost:8080/api/v1',
  projectReport:process.env.projectReport || 'DIGITALMOROCCO'

};


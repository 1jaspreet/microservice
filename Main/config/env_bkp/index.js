module.exports = {
  APP_NAME: "Prabandh Application",
  APP_ENV: "local",
  APP_PORT: "4000",
  APP_DEBUG: true,
  BASE_URL: "http://localhost:4000/",
  WEB_URL: "http://localhost:5000/",
  // BASE_URL: "http://10.23.252.252:4000/",
  // WEB_URL: "http://10.23.252.252:5000/",
  // BASE_URL:"https://prabandh.education.gov.in/",
  // WEB_URL:"https://prabandh.education.gov.in/",

  DB_CONNECTION: "pg",
  DB_PORT: "5433",
  DB_USER: "postgres",
  DB_PASSWORD: "postgres",
  DB_DATABASE: "pmshri",
  DB_HOST: "10.23.252.74",

  /*   DB_CONNECTION: "pg",
  DB_HOST: "10.194.82.4",
  DB_PORT: "5432",
  DB_USER: "pms",
  DB_PASSWORD: "Pmshri@DB2022#321",
  DB_DATABASE: "prabandh", */

  //DB_DATABASE: "mhrdprabandh_dec2023",
  JWT_TOKEN:
    "09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611",

  MAIL_MAILER: "smtp",
  MAIL_HOST: "sandbox.smtp.mailtrap.io",
  MAIL_PORT: 587,
  MAIL_USERNAME: "ebd74601bfdc0e",
  MAIL_PASSWORD: "cce8d80e47e0e6",
  MAIL_ENCRYPTION: "tls",
  MAIL_FROM_ADDRESS: "exemplarschool2021@gmail.com",
  MAIL_FROM_NAME: "${APP_NAME}",

  SMS_URL: "https://smsgw.sms.gov.in/failsafe/HttpLink?",
  SMS_USERNAME: "shagun.sms",
  SMS_PIN: "P%26j6@tRb",
  SMS_SIGNATURE: "SELMOE",
  SMS_DLT_ENTITY_ID: "1101607010000029348",
  SMS_LOING_OTP_TEMP_ID: "1107170185330943288",
  SMS_USER_DETAIL_TEMP_ID: "1107162790063072931",
  SMS_FINAL_SUBMIT_TEMP_ID: "1107162790063072931",
  SMS_ACTIVE_SCHOOL_TEMP_ID: "1107162790063072931",
  SMS_USER_REGISTRATION_TEMP_ID: "1107166747034487519",
  SMS_SCHOOL_INVITATION_TEMP_ID: "1107166746978285148",
  PHP_SMS_API: "https://smsvidya.education.gov.in/index.php",
  SCHOOL_LOGIN_API:
    "https://demo.udiseplus.gov.in/master-services/v1.2/checkLoginCredentials/16030604502/f06162b51a76fcaa848de4c2e095ce5494f715f66c8498c8364c59213bee1b80/123456",

  API_CLIENT_ID: "vidyanjali",
  API_CLIENT_SECRET: "vidya@756~",
  API_CERT_PATH: "E:/projects/mhrdprabandh/backend/certificate/udise.cer",
  //API_CERT_PATH : "/var/www/html/vidyanjali/V1.0/nodejs/certificate/udise.cer",
  API_AUTHENTICATION: "https://api.udiseplus.gov.in/school/v1.2/authenticate",
  API_GET_SCHOOL_INFO:
    "https://api.udiseplus.gov.in/school/v1.1/school-info/by-udise-code/public",
  API_VALIDATE_MOBILE:
    "https://api.udiseplus.gov.in/school/v1.1/check-mobile-number/public",
  API_VALIDATE_UDISE:
    "https://api.udiseplus.gov.in/school/v1.1/validate-udisecode/public",

  DEFL_OTP: "425262",
  LIVE_DOMAIN_ENVIRONMENT: "development", //development,production,testing,staging,
};

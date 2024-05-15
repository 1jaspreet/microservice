module.exports = {
  APP_NAME: "Prabandh Application",
  APP_ENV: "production",
  APP_PORT: "86",
  APP_DEBUG: true,
  BASE_URL: "http://prabandh.education.gov.in/apiprabandh",
  WEB_URL: "http://prabandh.education.gov.in",

  DB_CONNECTION: "pg",
  DB_HOST: "10.194.82.4",
  DB_PORT: "5432",
  DB_USER: "pms",
  DB_PASSWORD: "Pmshri@DB2022#321",
  DB_DATABASE: "prabandh",
  JWT_TOKEN:
    "09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611",

  MAIL_MAILER: "smtp",
  MAIL_HOST: "relay.nic.in",
  MAIL_PORT: 25,
  MAIL_USERNAME: "atanu.nandy@nic.in",
  MAIL_PASSWORD: "Nandy12@",
  MAIL_ENCRYPTION: "",
  MAIL_FROM_ADDRESS: "noreply@gov.in",
  DEFL_OTP: "425262",
  DOWNLOAD_PATH: "public/downloads/",

  SMS_URL: "https://smsgw.sms.gov.in/failsafe/HttpLink?",
  SMS_USERNAME: "shagun.sms",
  SMS_PIN: "P%26j6@tRb",
  SMS_SIGNATURE: "SELMOE",
  SMS_DLT_ENTITY_ID: "1101607010000029348",
  SMS_LOING_OTP_TEMP_ID: "1107170185330943288",
  SMS_OTP_APPROVAL_TEMP_ID: "1107170185365742165",
  SMS_FINAL_SUBMIT_TEMP_ID: "1107162790063072931",
  SMS_ACTIVE_SCHOOL_TEMP_ID: "1107162790063072931",
  SMS_USER_REGISTRATION_TEMP_ID: "1107166747034487519",
  SMS_SCHOOL_INVITATION_TEMP_ID: "1107166746978285148",
  PHP_SMS_API: "http://smsprabandh.education.gov.in/index.php",

  API_CLIENT_ID: "prabandh",
  API_CLIENT_SECRET: "prabandh@756~",
  API_CERT_PATH: "E:/projects/mhrdprabandh/backend/certificate/udise.cer",
  //API_CERT_PATH : "/home/prabandh/backend/certificate/udise.cer",
  API_AUTHENTICATION: "https://api.udiseplus.gov.in/school/v1.2/authenticate",
  API_GET_SCHOOL_INFO:
    "https://api.udiseplus.gov.in/school/v1.1/school-info/by-udise-code/public",
  API_VALIDATE_MOBILE:
    "https://api.udiseplus.gov.in/school/v1.1/check-mobile-number/public",
  API_VALIDATE_UDISE:
    "https://api.udiseplus.gov.in/school/v1.1/validate-udisecode/public",
    LIVE_DOMAIN_ENVIRONMENT: "testing" //development,production,testing,staging,
};

const express = require('express');
// const OtpRateLimit = require('../app/middlware/OtpRateLimit');
const routers = express.Router();
// const env = require("../config/env");

routers.use('/user', require('../app/controllers/Users/PMSHRIAuthController'));
// env.APP_ENV != 'local' ? OtpRateLimit : [],
routers.use('/otp/send', require('../app/controllers/Assets/pmshriOtpController'));

module.exports = routers;
const express   =   require('express');
const OtpRateLimit = require('../app/middlware/OtpRateLimit');
const routers   =   express.Router();
const env = require("../config/env");
routers.use('/captcha',require('../app/controllers/Assets/CaptchaController'));
routers.use('/user',require('../app/controllers/Users/AuthController'));
// env.APP_ENV != 'local' ? OtpRateLimit : [],
routers.use('/otp/send', require('../app/controllers/Assets/OtpController'));
routers.use('/udiseplus',require('../app/controllers/Assets/UdiseController'));
routers.use('/password',require('../app/controllers/Assets/PasswordController'));
routers.use('/school',require('../app/controllers/Schools/SchoolController'));
routers.use('/cert',require('../app/controllers/Assets/UdiseAPI/UdiseAPIController'));
routers.use('/feedback-contacts',require('../app/controllers/Assets/FeedbackContactController'));

module.exports = routers;
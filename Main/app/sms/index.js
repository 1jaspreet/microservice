//const Model     =   require('../../models');
const SMS       =   require('../libraries/sms');
const env = require("../../config/env");

exports.sendOTP = (req,object) =>{
    const message =   `"Your OTP to login in Prabandh Application is ${object.OTP}. Please do not share this OTP to anyone. -Ministry of Education, Government of India"`;
    req.sms       =   {'mobile':object.mobile,'message':message,'TMPLT_ID':env.SMS_LOING_OTP_TEMP_ID};
    SMS.send(req);
}

exports.sendOTPToApprove = (req,object) =>{
    const message =   `"Your OTP to approve District Plan is ${object.OTP}. Please do not share this OTP to anyone. -Ministry of Education, Government of India"`;
    req.sms       =   {'mobile':object.mobile,'message':message,'TMPLT_ID':env.SMS_LOING_OTP_TEMP_ID};
    SMS.send(req);
}

exports.send_test_message = (req, res) =>{
    return SMS.send(req, res);
}
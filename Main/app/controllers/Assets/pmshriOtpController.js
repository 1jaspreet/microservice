const express   =   require('express');
const routers   =   express.Router();
const OTP       =   require('../../handlers').pmshriOtpHandler;

routers.post('/',async(req,res)=>{
    return await OTP.handle(req,res);
});

module.exports  =   routers;
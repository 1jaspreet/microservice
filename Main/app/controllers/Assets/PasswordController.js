const express   =   require('express');
const routers   =   express.Router();
const Password  =   require('../../handlers').Password;

routers.post('/validate/user',async(req,res)=>{
    return await Password.validateUser(req,res);
});

routers.post('/reset/password',async(req,res)=>{
    return await Password.resetPassword(req,res);
});

routers.post('/update/password',async(req,res)=>{
    return await Password.updatePassword(req,res);
});

routers.post('/validate/otp',async(req,res)=>{
    return await Password.validateOTP(req,res);
});

routers.post('/validate/token',async(req,res)=>{
    return await Password.validateToken(req,res);
});

routers.post('/check/user',async(req,res)=>{
    return await Password.checkUser(req,res);
});

routers.post('/resend/otp',async(req,res)=>{
    return await Password.sendOTP(req,res);
});

module.exports  =   routers;
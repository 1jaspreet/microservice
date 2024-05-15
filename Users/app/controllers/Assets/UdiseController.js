const express   =   require('express');
const routers   =   express.Router();
const UDISE       =   require('../../handlers').Udise;

routers.post('/validate-udisecode',async(req,res)=>{
    return await UDISE.validateUdisecode(req,res);
});

routers.post('/validate-mobile-udisecode',async(req,res)=>{
    return await UDISE.validateMobileUdiseCode(req,res);
});

routers.post('/validate-darpan-id',async (req,res)=>{
    return await UDISE.validateDarpanId(req,res);
});

routers.post('/login',async (req,res)=>{
    return await UDISE.login(req,res);
});

module.exports  =   routers;
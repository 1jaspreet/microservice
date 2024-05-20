const express   =   require('express');
const routers   =   express.Router();
const Handler   =   require('../../handlers').UserLog;

routers.post('/user-logs',async (req,res)=>{
    return await Handler.userLogs(req,res);
});

routers.post('/error-logs',async (req,res)=>{
    return await Handler.errorLogs(req,res);
});

routers.post('/activity-logs',async (req,res)=>{
    return await Handler.activityLogs(req,res);
});

module.exports  =   routers;
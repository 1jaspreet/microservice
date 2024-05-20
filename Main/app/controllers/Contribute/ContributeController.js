const express   =   require('express');
const routers   =   express.Router();
const Helper    =   require('../../helpers/Helper');
const Handler   =   require('../../handlers').Contribute;
//const Validate  =   require('../../validation').School;

routers.post('/activities',(req,res)=>{
    return Handler.index(req,res);
});

routers.post('/assets',(req,res)=>{
   return Handler.assets(req,res);
});

routers.post('/volunteer-participate',(req,res)=>{
    return Handler.volunteerParticipate(req,res);
 });

 routers.post('/volunteer-contribute',(req,res)=>{
    return Handler.volunteerContribute(req,res);
 });


module.exports = routers;

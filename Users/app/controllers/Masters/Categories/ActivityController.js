const express   =   require('express');
const routers   =   express.Router();
const Helper    =   require('../../../helpers/Helper');
const Handler   =   require('../../../handlers').ActivityCategory;
const Validate  =   require('../../../validation').ActivityCategory;

routers.post('/',(req,res)=>{
    return Handler.index(req,res);
});

routers.get('/list',(req,res)=>{
    return Handler.list(req,res);
});

routers.post('/create',Validate.create(),(req,res) => {
    const error = Helper.validate(req,res);
    return (error != null) ? error : Handler.create(req,res);
}); 

routers.post('/find',(req,res) => {
    return  Handler.find(req,res);
}); 

routers.post('/update',Validate.update(),(req,res) => {
    const error = Helper.validate(req,res);
    return (error != null) ? error : Handler.update(req,res);
});

routers.post('/update-status',Validate.status(),(req,res) => {
    const error = Helper.validate(req,res);
    return (error != null) ? error : Handler.updateStatus(req,res);
});

routers.delete('/delete',Validate.delete(),(req,res) => {
    const error = Helper.validate(req,res);
    return (error != null) ? error : Handler.delete(req,res);
});

module.exports = routers;

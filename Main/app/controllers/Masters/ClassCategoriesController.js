const express   =   require('express');
const routers   =   express.Router();
const Handler   =   require('../../handlers').ClassCategories;

routers.post('/',(req,res)=>{
    return Handler.index(req,res);
});

routers.get('/list',(req,res)=>{
    return Handler.list(req,res);
});

routers.post('/find',(req,res) => {
    return  Handler.find(req,res);
}); 

module.exports = routers;

const express   =   require('express');
const routers   =   express.Router();

routers.get('/',(req,res)=>{
    res.send('Admin routes is working.');
});

module.exports = routers;
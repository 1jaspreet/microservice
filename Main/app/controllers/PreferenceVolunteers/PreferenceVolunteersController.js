const express   =   require('express');
const routers   =   express.Router();
const Helper    =   require('../../helpers/Helper');
const Handler   =   require('../../handlers').PreferenceVolunteers;
//const Validate  =   require('../../validation').School;

routers.post('/',(req,res)=>{
    return Handler.index(req,res);
});

routers.post('/find',(req,res) => {
   return  Handler.find(req,res);
}); 
routers.post('/volunteer-list',(req,res) => {
   return  Handler.volunteerList(req,res);
});
routers.post('/activity-detail',(req,res) => {
    return  Handler.activityDetail(req,res);
 });
 routers.post('/school-profile',(req,res) => {
   return  Handler.schoolDetail(req,res);
});
 
 routers.post('/activity-image',(req,res) => {
    return  Handler.activityImage(req,res);
 });

// routers.post('/update',Validate.update(),(req,res) => {
//     const error = Helper.validate(req,res);
//     return (error != null) ? error : Handler.update(req,res);
// });

// routers.post('/update-status',Validate.status(),(req,res) => {
//     const error = Helper.validate(req,res);
//     return (error != null) ? error : Handler.updateStatus(req,res);
// });

module.exports = routers;

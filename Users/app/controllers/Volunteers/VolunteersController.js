const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').Volunteers;
//const Validate  =   require('../../validation').School;

routers.post('/activities', (req, res) => {
   return Handler.activities(req, res);
});

routers.post('/contributions', (req, res) => {
   return Handler.contributions(req, res);
});

routers.post('/assets-detail-volunteer', (req, res) => {
   return Handler.assetsDetailVolunteer(req, res);
});

routers.post('/assets-detail-school',async (req,res)=>{                 
   return await Handler.assetsDetailSchool(req,res);
});


routers.post('/create', async (req, res) => {
   return await Handler.create(req, res);
});

routers.post('/invite-accept', async (req, res) => {
   return await Handler.inviteAccept(req, res);
});

routers.post('/confirm-accept', async (req, res) => {
   return await Handler.ConfirmAccept(req, res);
});

routers.post('/volunteer-reject', async (req, res) => {
   return await Handler.volunteerReject(req, res);
});

routers.post('/update', async (req, res) => {
   return await Handler.update(req, res);
});

routers.post('/find', (req, res) => {
   return Handler.find(req, res);
});

routers.post('/volunteer-list', (req, res) => {
   return Handler.volunteerList(req, res);
});

routers.post('/activity-detail', (req, res) => {
   return Handler.activityDetail(req, res);
});

routers.post('/activity-total', (req, res) => {
   return Handler.activityTotal(req, res);
});

routers.post('/assets-total', (req, res) => {
   return Handler.AssetsTotal(req, res);
});

routers.post('/school-profile', (req, res) => {
   return Handler.schoolProfile(req, res);
});

routers.post('/volunteer-profile', (req, res) => {
   return Handler.volunteerProfile(req, res);
});

routers.post('/activity-image', (req, res) => {
   return Handler.activityImage(req, res);
});

routers.post('/get-rating', (req, res) => {
   return Handler.getRating(req, res);
})

routers.post('/get-school-rating', (req, res) => {
   return Handler.getSchoolRating(req, res);
})

routers.post('/get-badge', (req, res) => {
   return Handler.getBadge(req, res);
})

module.exports = routers;

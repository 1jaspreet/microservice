const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').Activities;
//const Validate  =   require('../../validation').School;

routers.post('/', (req, res) => {
   return Handler.index(req, res);
});

routers.post('/create', async (req, res) => {
   return await Handler.create(req, res);
});

routers.post('/upload-images', async (req, res) => {
   return await Handler.uploadImages(req, res);
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

routers.post('/volunteer-participation-status', (req, res) => {
   return Handler.volunteerParticipationStatus(req, res);
});

routers.post('/activity-total', (req, res) => {
   return Handler.activityTotal(req, res);
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

routers.post('/close-activity', (req, res) => {
   return Handler.closeActivity(req, res);
});

routers.post('/pending-invite-count', (req, res) => {
   return Handler.PendingInviteCount(req, res);
});

routers.post('/rating-to-volunteer-by-school', (req, res) => {
   return Handler.ratingToVolunteerBySchool(req, res);
});

routers.post('/rating-to-school-by-volunteer', (req, res) => {
   return Handler.ratingToSchoolByVolunteer(req, res);
});


module.exports = routers;

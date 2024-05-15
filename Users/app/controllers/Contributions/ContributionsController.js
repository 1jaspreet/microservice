const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').Contributions;
//const Validate  =   require('../../validation').School;

routers.post('/', (req, res) => {
   return Handler.index(req, res);
});

routers.post('/create', async (req, res) => {
   return await Handler.create(req, res);
});

routers.post('/offline-create', async (req, res) => {
   return await Handler.offlineCreate(req, res);
});

routers.post('/update', async (req, res) => {
   return await Handler.update(req, res);
});

routers.post('/find', (req, res) => {
   return Handler.find(req, res);
});

routers.post('/find-volunteer', (req, res) => {
   return Handler.findVolunteer(req, res);
});

routers.post('/volunteer-list', (req, res) => {
   return Handler.volunteerList(req, res);
});

routers.post('/assets-detail', (req, res) => {
   return Handler.assetsDetail(req, res);
});

routers.post('/assets-detail-volunteer', (req, res) => {
   return Handler.assetsDetailVolunteer(req, res);
});

routers.post('/contribution-detail', (req, res) => {
   return Handler.activityDetail(req, res);
});

routers.post('/contribution-details', (req, res) => {
   return Handler.contributionDetail(req, res);
});
routers.post('/contribution-total', (req, res) => {
   return Handler.contributionTotal(req, res);
});

routers.post('/school-profile', (req, res) => {
   return Handler.schoolDetail(req, res);
});

routers.post('/invite-accept', (req, res) => {
   return Handler.inviteAccept(req, res);
});

routers.post('/confirm-accept', (req, res) => {
   return Handler.ConfirmAccept(req, res);
});

routers.post('/add-delivery', (req, res) => {
   return Handler.AddDelivery(req, res);
});

routers.post('/pending-invite-count', (req, res) => {
   return Handler.PendingInviteCount(req, res);
});

routers.post('/contribution-image', (req, res) => {
   return Handler.contributionImage(req, res);
});

routers.post('/upload-images', async (req, res) => {
   return await Handler.uploadImages(req, res);
});

routers.post('/upload-offline-images', async (req, res) => {
   return await Handler.uploadOfflineImages(req, res);
});


routers.post('/close-contribution', (req, res) => {
   return Handler.closeContribution(req, res);
});

routers.post('/rating-to-volunteer-by-school', (req, res) => {
   return Handler.ratingToVolunteerBySchool(req, res);
});

routers.post('/rating-to-school-by-volunteer', (req, res) => {
   return Handler.ratingToSchoolByVolunteer(req, res);
});

module.exports = routers;

const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').WebActivities;

routers.post('/ongoing-events', (req, res) => {
   return Handler.onGoginEvents(req, res);
});

routers.post('/success-stories', (req, res) => {
   return Handler.successStories(req, res);
});

routers.post('/activities-list', (req, res) => {
   return Handler.activitiesList(req, res);
});

routers.post('/sub-activities-list', (req, res) => {
   return Handler.subActivitiesList(req, res);
});

routers.post('/contribute-activities-list', (req, res) => {
   return Handler.contributeActivitiesList(req, res);
});

module.exports = routers;

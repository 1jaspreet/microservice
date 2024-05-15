const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').WebAssets;

routers.post('/success-stories', (req, res) => {
   return Handler.successStories(req, res);
});

routers.post('/assets-detail', (req, res) => {
   return Handler.assetsDetail(req, res);
});

routers.post('/assets-list', (req, res) => {
   return Handler.assetsList(req, res);
});

routers.post('/sub-assets-list', (req, res) => {
   return Handler.subAssetsList(req, res);
});

routers.post('/contribute-assets-list', (req, res) => {
   return Handler.contributeAssetsList(req, res);
});
routers.post('/volunteer-participation-status', (req, res) => {
   return Handler.volunteerParticipationStatus(req, res);
});
module.exports = routers;

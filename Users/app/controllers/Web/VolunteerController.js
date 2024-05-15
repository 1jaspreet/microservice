const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').WebVolunteer;

routers.post('/volunteer-programme-counts', (req, res) => {
   return Handler.volunteerProgrammeCounts(req, res);
});


module.exports = routers;

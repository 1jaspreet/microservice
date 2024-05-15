const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').WebSchools;

routers.post('/onboard-schools', (req, res) => {
   return Handler.onBoardSchools(req, res);
});

module.exports = routers;

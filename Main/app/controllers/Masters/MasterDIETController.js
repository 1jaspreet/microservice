const express = require('express');
const routers = express.Router();
const Handler = require('../../handlers').MasterDIET;

routers.post('/list', async (req, res) => { return await Handler.list(req, res) });

module.exports = routers;
